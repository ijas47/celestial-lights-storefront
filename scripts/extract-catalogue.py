#!/usr/bin/env python3
"""Extract the Celestial Lights showroom catalogue from the 2025 fittings PDF.

The PDF has no text layer. Pages are rendered with PyMuPDF and read with
Tesseract. Cover, contents, the back cover, and red section dividers are
skipped. Spec pages become products. Lifestyle pages attach only when their
model code matches a spec product, and even then the photograph is published
only if the distributor name is not readable.

This file is a build tool. The site does not import it.

Requires: pymupdf, pillow, numpy, opencv-python, and the tesseract binary.
"""

from __future__ import annotations

import argparse
import io
import json
import re
import subprocess
import sys
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import cv2
import numpy as np
import pymupdf
from PIL import Image, ImageOps

# Absolute path of the only source PDF. Not copied into the repo.
PDF_PATH = "/Users/ijasabdulla/Downloads/SAINT MALO LIGHTING 2025.pdf"

ROOT = Path(__file__).resolve().parents[1]
SKIP_PAGES = {1, 2, 503}
ZOOM = 2.4

# Strings that must never survive into JSON, alt text, or published pixels.
# Kept here so the scrubber can remove them from OCR. The site does not import
# this module.
BANNED_PATTERNS = [
    re.compile(r"saint[\s.\-]*malo", re.I),
    re.compile(r"stmalo", re.I),
    re.compile(r"圣玛露"),
    re.compile(r"广东省圣玛露灯饰有限公司"),
    re.compile(r"guangdong\s+saint[\s.\-]*malo", re.I),
    re.compile(r"info@stmalo\.cn", re.I),
    re.compile(r"stmalo\.cn", re.I),
    re.compile(r"[\u4e00-\u9fff]+"),
]

# No trailing word-boundary: "Power(max.)" ends on a parenthesis, and a
# boundary there would drop the wattage row.
LABEL_RE = re.compile(
    r"^(power\s*\(\s*max\.?\s*\)|crystal\s*colou?r|pendant\s*colou?r|"
    r"dimensions|finishing|voltage|material|pendant|accessories|"
    r"model|colou?r)"
    r"(?:\s*[-:.]+\s*|\s+|$)(.*)$",
    re.I,
)
PAGE_NO_RE = re.compile(r"^\d{1,3}$")
HEADER_RE = re.compile(
    r"^(chandeliers?|ceill?ing units|table lamps?|floor lamps?|wall sconces?)$",
    re.I,
)
LIGHT_RE = re.compile(r"^(\d+)\s+lights?\b\s*(.*)$", re.I)
MODEL_RE = re.compile(r"^[A-Z0-9]+(?:[-+][A-Z0-9]+)*$")
CODE_HINT = re.compile(r"\bmodel\b", re.I)

LABEL_CANON = {
    "model": "Model",
    "power (max.)": "Power (max.)",
    "power(max.)": "Power (max.)",
    "voltage": "Voltage",
    "dimensions": "Dimensions",
    "finishing": "Finishing",
    "finish": "Finishing",
    "crystal color": "Crystal color",
    "crystal colour": "Crystal color",
    "pendant color": "Pendant color",
    "pendant colour": "Pendant color",
    "material": "Material",
    "pendant": "Pendant",
    "accessories": "Accessories",
    "accessory": "Accessories",
    "color": "Color",
    "colour": "Color",
    "lampshade": "Lampshade",
}


def scrub(text: str) -> str:
    cleaned = text
    for pattern in BANNED_PATTERNS:
        cleaned = pattern.sub("", cleaned)
    cleaned = re.sub(r"\S+@\S+", "", cleaned)
    # Only a leading plus. Bare digit runs are model codes, not phone numbers.
    cleaned = re.sub(r"\+\d[\d\s().-]{8,}\d", "", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    cleaned = re.sub(r"\s+([,./])", r"\1", cleaned)
    cleaned = re.sub(r"\(\s*\)", "", cleaned)
    cleaned = re.sub(r"^[\s,./\-]+|[\s,./\-]+$", "", cleaned)
    return cleaned.strip()


def contains_banned(text: str) -> bool:
    return any(pattern.search(text) for pattern in BANNED_PATTERNS)


def clean_model(raw: str) -> str:
    text = raw.upper().replace("—", "-").replace("–", "-").replace("−", "-")
    text = text.replace("×", "X")
    text = re.sub(r"\s*([-+])\s*", r"\1", text)
    text = re.sub(r"\s+", "", text)
    text = re.sub(r"[^A-Z0-9+\-]", "", text)
    text = re.sub(r"-{2,}", "-", text).strip("-+")
    return text


def valid_model(code: str) -> bool:
    return bool(code) and len(code) >= 4 and bool(MODEL_RE.fullmatch(code)) and bool(re.search(r"\d", code))


def slugify(model: str) -> str:
    slug = model.lower().replace("+", "-")
    slug = re.sub(r"[^a-z0-9-]", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug


def category_for(page: int) -> str | None:
    if 4 <= page <= 227:
        return "chandeliers"
    if 228 <= page <= 358:
        return "hanging-pendant"
    if 359 <= page <= 426:
        return "table-floor-lamps"
    if 427 <= page <= 502:
        return "wall-lights"
    return None


def kind_for(page: int) -> str:
    if 4 <= page <= 227:
        return "chandelier"
    if 228 <= page <= 358:
        return "pendant"
    if 359 <= page <= 408:
        return "table lamp"
    if 409 <= page <= 426:
        return "floor lamp"
    if 427 <= page <= 502:
        return "wall light"
    return "light"


def canon_label(raw: str) -> str:
    key = re.sub(r"\s+", " ", raw.strip().lower())
    key = key.replace("（", "(").replace("）", ")")
    return LABEL_CANON.get(key, raw.strip().title())


def ocr_pil(image: Image.Image, psm: str = "6", tsv: bool = False) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    command = ["tesseract", "stdin", "stdout", "--psm", psm, "-l", "eng"]
    if tsv:
        command.append("tsv")
    result = subprocess.run(command, input=buffer.getvalue(), capture_output=True)
    if result.returncode != 0 and not result.stdout:
        err = result.stderr.decode("utf-8", "replace")[:400]
        raise RuntimeError(f"tesseract failed: {err}")
    return result.stdout.decode("utf-8", "replace")


def render_page(pdf_path: str, page_number: int, zoom: float = ZOOM) -> np.ndarray:
    document = pymupdf.open(pdf_path)
    try:
        page = document[page_number - 1]
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        return np.frombuffer(pixmap.samples, dtype=np.uint8).reshape(
            pixmap.height, pixmap.width, 3
        ).copy()
    finally:
        document.close()


def is_red(image: np.ndarray) -> bool:
    red = image[:, :, 0].astype(np.int16)
    green = image[:, :, 1].astype(np.int16)
    blue = image[:, :, 2].astype(np.int16)
    mask = (red > 120) & (red > green + 35) & (red > blue + 35)
    return float(mask.mean()) > 0.55


def classify(image: np.ndarray) -> str:
    if is_red(image):
        return "divider"
    height = image.shape[0]
    top = image[: max(8, int(height * 0.07))]
    if float(top.mean()) < 58:
        return "lifestyle"
    gray = image.mean(axis=2)
    if float((gray > 245).mean()) > 0.40:
        return "spec"
    return "other"


def words_from_tsv(text: str) -> list[dict]:
    words = []
    for line in text.splitlines()[1:]:
        parts = line.split("\t")
        if len(parts) < 12:
            continue
        try:
            confidence = float(parts[10])
        except ValueError:
            continue
        token = parts[11].strip()
        if not token or confidence < 20:
            continue
        words.append(
            {
                "left": int(parts[6]),
                "top": int(parts[7]),
                "width": int(parts[8]),
                "height": int(parts[9]),
                "text": token,
            }
        )
    return words


def lines_from_words(words: list[dict], tolerance: int = 12) -> list[dict]:
    ordered = sorted(words, key=lambda word: (word["top"], word["left"]))
    lines: list[dict] = []
    for word in ordered:
        if lines and abs(word["top"] - lines[-1]["top"]) <= tolerance:
            lines[-1]["words"].append(word)
            lines[-1]["top"] = min(lines[-1]["top"], word["top"])
        else:
            lines.append({"top": word["top"], "words": [word]})
    for line in lines:
        line["words"].sort(key=lambda word: word["left"])
        line["text"] = " ".join(word["text"] for word in line["words"])
        line["bottom"] = max(word["top"] + word["height"] for word in line["words"])
        line["left"] = min(word["left"] for word in line["words"])
    return lines


def tidy_value(label: str, value: str) -> str:
    value = scrub(value)
    value = re.sub(r"\s*/\s*", " / ", value)
    value = re.sub(r"\s+", " ", value).strip(" .")
    if label == "Power (max.)":
        # Tesseract reads the Edison base "E14" as a pound sign.
        value = value.replace("£", "E").replace("€", "E")
    if label == "Dimensions":
        value = re.sub(r"\b([HWDLE])\s*(\d)", r"\1 \2", value)
        value = re.sub(r"\s+", " ", value).strip()
    return value


def parse_block(block_lines: list[dict], page: int) -> dict | None:
    specs: list[dict] = []
    light_line = ""
    raw_model = ""
    for line in block_lines:
        text = re.sub(r"\s+", " ", line["text"]).strip()
        if not text or PAGE_NO_RE.match(text) or HEADER_RE.match(text):
            continue
        label_match = LABEL_RE.match(text)
        if label_match:
            label = canon_label(label_match.group(1))
            value = label_match.group(2).strip(" -.")
            if label == "Model":
                raw_model = value or raw_model
                specs.append({"label": "Model", "value": value})
            else:
                specs.append({"label": label, "value": value})
            continue
        if LIGHT_RE.match(text):
            light_line = text
            continue
        if specs and specs[-1]["label"] != "Model":
            previous = specs[-1]["value"]
            specs[-1]["value"] = (previous + " " + text).strip()

    # The light-count line is often directly under MODEL and was stored above
    # only when it did not match a label. Catch it if the loop saw it first.
    if not light_line:
        for line in block_lines:
            if LIGHT_RE.match(line["text"].strip()):
                light_line = line["text"].strip()
                break

    model = clean_model(raw_model)
    if not valid_model(model):
        return {"error": "bad-model", "raw": raw_model, "text": " | ".join(line["text"] for line in block_lines)}

    cleaned_specs = []
    for spec in specs:
        if spec["label"] == "Model":
            cleaned_specs.append({"label": "Model", "value": model})
            continue
        value = tidy_value(spec["label"], spec["value"])
        if not value:
            continue
        cleaned_specs.append({"label": spec["label"], "value": value})

    title = title_from(light_line, page, model)
    summary = build_summary(title, cleaned_specs)
    description = build_description(cleaned_specs)
    product = {
        "slug": slugify(model),
        "model": model,
        "title": title,
        "categorySlug": category_for(page),
        "summary": summary,
        "description": description,
        "specs": cleaned_specs,
        "price": None,
        "images": [],
        "sourcePage": page,
    }
    blob = json.dumps(product)
    if contains_banned(blob):
        return {"error": "banned", "raw": model}
    return product


def title_from(light_line: str, page: int, model: str) -> str:
    match = LIGHT_RE.match(light_line.strip()) if light_line else None
    kind = kind_for(page)
    if not match:
        return f"{kind} {model}"
    count = match.group(1)
    rest = match.group(2).strip(" .").lower()
    rest = re.sub(r"\s+", " ", rest)
    if rest:
        title = f"{count} light {rest}"
    else:
        title = f"{count} light {kind}"
    return title[0].upper() + title[1:] if title else title


def spec_value(specs: list[dict], label: str) -> str:
    for spec in specs:
        if spec["label"].lower() == label.lower():
            return spec["value"]
    return ""


def build_summary(title: str, specs: list[dict]) -> str:
    finish = spec_value(specs, "Finishing")
    crystal = spec_value(specs, "Crystal color")
    dimensions = spec_value(specs, "Dimensions")
    bits = []
    if finish:
        bits.append(finish)
    if crystal:
        if "crystal" in crystal.lower():
            bits.append(crystal)
        else:
            bits.append(f"{crystal} crystal")
    sentence = title
    if bits:
        sentence = f"{title} in {', '.join(bits)}"
    if dimensions:
        sentence = f"{sentence}, {dimensions}"
    if not sentence.endswith("."):
        sentence += "."
    return sentence


def build_description(specs: list[dict]) -> str:
    sentences = []
    for spec in specs:
        label = spec["label"]
        value = spec["value"].rstrip(".")
        if label == "Model":
            continue
        if label == "Dimensions":
            sentences.append(f"Dimensions are {value}.")
        elif label == "Accessories":
            sentences.append(f"{value}.")
        else:
            sentences.append(f"{label} is {value}.")
    return " ".join(sentences)


def parse_spec_page(image: np.ndarray, page: int) -> tuple[list[dict], list[dict]]:
    rgb = Image.fromarray(image)
    width, height = rgb.size
    # Spec column sits on the right. Include a little of the middle so a
    # model line that starts left of the halfway point is not clipped.
    # The photograph occupies the left half. Starting further left pulls the
    # painted name on the glass into the same OCR line as the spec rows.
    column = rgb.crop((int(width * 0.50), int(height * 0.14), int(width * 0.98), int(height * 0.96)))
    gray = ImageOps.grayscale(column)
    gray = ImageOps.autocontrast(gray)
    tsv = ocr_pil(gray.convert("RGB"), psm="6", tsv=True)
    lines = lines_from_words(words_from_tsv(tsv))
    model_indexes = [index for index, line in enumerate(lines) if CODE_HINT.search(line["text"])]
    products = []
    problems = []
    if not model_indexes:
        problems.append({"page": page, "reason": "no model line", "text": " | ".join(line["text"] for line in lines[:12])})
        return products, problems
    for position, start in enumerate(model_indexes):
        end = model_indexes[position + 1] if position + 1 < len(model_indexes) else len(lines)
        parsed = parse_block(lines[start:end], page)
        if parsed is None:
            continue
        if parsed.get("error"):
            problems.append({"page": page, **parsed})
            continue
        products.append(parsed)
        problems.append(
            {
                "page": page,
                "model": parsed["model"],
                "kind": "spec",
                "reason": "name is printed across the fitting; removing the letters would invent glass detail",
            }
        )
    return products, [item for item in problems if "reason" in item or "error" in item]


def parse_lifestyle(image: np.ndarray, page: int) -> tuple[str | None, dict]:
    height = image.shape[0]
    row_mean = image.mean(axis=(1, 2))
    bar = 0
    while bar < int(height * 0.18) and row_mean[bar] < 70:
        bar += 1
    if bar < 10:
        return None, {"page": page, "kind": "lifestyle", "reason": "no black bar"}
    bar_image = Image.fromarray(image[:bar, : int(image.shape[1] * 0.72)])
    inverted = ImageOps.invert(ImageOps.grayscale(bar_image))
    inverted = ImageOps.autocontrast(inverted)
    text = ocr_pil(inverted.convert("RGB"), psm="6", tsv=False)
    code = None
    for line in text.splitlines():
        candidate = clean_model(line)
        if valid_model(candidate):
            code = candidate
            break
    drop = {
        "page": page,
        "model": code or "",
        "kind": "lifestyle",
        "reason": "name is printed across the fitting; removing the letters would invent glass detail",
    }
    return code, drop


def process_page(args: tuple[str, int]) -> dict:
    pdf_path, page = args
    if page in SKIP_PAGES or category_for(page) is None:
        return {"page": page, "kind": "skip", "products": [], "lifestyleCode": None, "dropped": []}
    image = render_page(pdf_path, page)
    kind = classify(image)
    if kind == "divider":
        return {"page": page, "kind": kind, "products": [], "lifestyleCode": None, "dropped": []}
    if kind == "lifestyle":
        code, dropped = parse_lifestyle(image, page)
        return {"page": page, "kind": kind, "products": [], "lifestyleCode": code, "dropped": [dropped]}
    products, dropped = parse_spec_page(image, page)
    if kind == "other" and not products:
        return {
            "page": page,
            "kind": "other",
            "products": [],
            "lifestyleCode": None,
            "dropped": [{"page": page, "kind": "other", "reason": "page was not a spec or lifestyle template"}],
        }
    return {"page": page, "kind": "spec", "products": products, "lifestyleCode": None, "dropped": dropped}


def codes_match(lifestyle: str, model: str) -> bool:
    if lifestyle == model:
        return True
    if lifestyle.startswith(model):
        rest = lifestyle[len(model) :]
        return rest == "" or rest[0] in "+-"
    return False


def attach_lifestyle(products: list[dict], lifestyle_pages: list[dict]) -> list[dict]:
    unmatched = []
    by_length = sorted(products, key=lambda product: len(product["model"]), reverse=True)
    for item in lifestyle_pages:
        code = item["code"]
        if not code:
            unmatched.append({"page": item["page"], "code": ""})
            continue
        match = next((product for product in by_length if codes_match(code, product["model"])), None)
        if match is None:
            unmatched.append({"page": item["page"], "code": code})
    return unmatched


def disambiguate(products: list[dict]) -> list[dict]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for product in products:
        grouped[product["slug"]].append(product)
    kept = []
    for slug, group in grouped.items():
        if len(group) == 1:
            kept.append(group[0])
            continue
        unique = []
        for product in group:
            signature = json.dumps(product["specs"], sort_keys=True)
            existing = next((item for item in unique if json.dumps(item["specs"], sort_keys=True) == signature), None)
            if existing:
                continue
            unique.append(product)
        if len(unique) == 1:
            kept.append(unique[0])
            continue
        for index, product in enumerate(unique, start=1):
            if index > 1:
                product["slug"] = f"{slug}-{index}"
            kept.append(product)
    kept.sort(key=lambda product: (product["sourcePage"], product["model"], product["slug"]))
    return kept


def scrub_tree(value):
    if isinstance(value, str):
        return scrub(value)
    if isinstance(value, list):
        return [scrub_tree(item) for item in value]
    if isinstance(value, dict):
        return {key: scrub_tree(item) for key, item in value.items()}
    return value


def write_outputs(products: list[dict], skipped: dict, data_dir: Path) -> None:
    data_dir.mkdir(parents=True, exist_ok=True)
    products_path = data_dir / "products.json"
    skipped_path = data_dir / "skipped.json"
    products_path.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n")
    skipped_path.write_text(json.dumps(skipped, indent=2, ensure_ascii=False) + "\n")


def ripgrep_report(root: Path) -> str:
    patterns = [
        "shopify",
        "cart",
        "checkout",
        "add to cart",
        "sold out",
        "cdn.shopify.com",
        "Harold",
        "SAINT MALO",
        "Saint Malo",
        "Saint malo",
        "saint malo",
        "SAINT.MALO",
        "圣玛露",
        "stmalo",
        "info@stmalo.cn",
    ]
    targets = [root / "src", root / "public" / "catalogue", root / "src" / "data"]
    existing = [str(path) for path in targets if path.exists()]
    if not existing:
        return "ripgrep: nothing to search yet"
    lines = []
    for pattern in patterns:
        result = subprocess.run(
            ["rg", "-n", "-i", "--glob", "!scripts/**", pattern, *existing],
            capture_output=True,
            text=True,
        )
        if result.stdout.strip():
            lines.append(f"\n## {pattern}\n{result.stdout.strip()}")
    return "\n".join(lines) if lines else "ripgrep: no hits"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default=PDF_PATH)
    parser.add_argument("--pages", default="", help="Comma-separated page numbers. Default is 4-502.")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--data-dir", default=str(ROOT / "src" / "data"))
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args()

    if args.pages:
        pages = [int(part) for part in args.pages.split(",") if part.strip()]
    else:
        pages = list(range(4, 503))

    print(f"reading {len(pages)} pages from {args.pdf}", flush=True)
    results = []
    work = [(args.pdf, page) for page in pages]
    if args.workers <= 1:
        for item in work:
            results.append(process_page(item))
            print(f"page {item[1]}", flush=True)
    else:
        with ProcessPoolExecutor(max_workers=args.workers) as pool:
            futures = {pool.submit(process_page, item): item[1] for item in work}
            done = 0
            for future in as_completed(futures):
                results.append(future.result())
                done += 1
                if done % 25 == 0 or done == len(pages):
                    print(f"parsed {done}/{len(pages)}", flush=True)

    results.sort(key=lambda item: item["page"])
    products = []
    dropped = []
    lifestyle_pages = []
    unparsed = []
    for item in results:
        products.extend(item["products"])
        for frame in item["dropped"]:
            if frame.get("error") or frame.get("reason") == "no model line" or frame.get("kind") == "other":
                unparsed.append(frame)
            else:
                dropped.append(frame)
        if item["kind"] == "lifestyle":
            lifestyle_pages.append({"page": item["page"], "code": item["lifestyleCode"]})

    products = disambiguate(products)
    unmatched = attach_lifestyle(products, lifestyle_pages)
    skipped = scrub_tree({
        "droppedFrames": dropped,
        "lifestyleUnmatched": unmatched,
        "unparsed": unparsed,
    })

    counts = defaultdict(int)
    for product in products:
        counts[product["categorySlug"]] += 1

    print("\n=== catalogue report ===")
    print(f"products kept: {len(products)}")
    for slug, count in sorted(counts.items()):
        print(f"  {slug}: {count}")
    print(f"frames dropped because the name sits on the fitting: {len(dropped)}")
    print(f"lifestyle pages: {len(lifestyle_pages)}")
    print(f"lifestyle pages with no matching model: {len(unmatched)}")
    if unmatched[:20]:
        print("  first unmatched:", json.dumps(unmatched[:20], ensure_ascii=False))
    print(f"pages unparsed: {len(unparsed)}")
    if unparsed[:15]:
        print("  first unparsed:", json.dumps(unparsed[:15], ensure_ascii=False)[:2000])
    print("images published: 0")
    print("published image files: none. The name is painted across the glass, and cleaning it would invent detail.")

    if not args.no_write:
        write_outputs(products, skipped, Path(args.data_dir))
        print(ripgrep_report(ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
