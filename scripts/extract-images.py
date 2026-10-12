#!/usr/bin/env python3
"""Crop product photographs out of the fittings PDF and attach them to the catalogue.

Spec pages: the square (or product) photograph on the left, without the page
header, logo, blurb, spec column, or page number. Lifestyle pages: the
photograph under the black bar, without that bar or the corner page number.
The first spec crop is the card image. Lifestyle frames follow, up to 8
images in total.

This file is a build tool. The site does not import it.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import importlib.util

import cv2
import numpy as np
from PIL import Image

_SPEC = importlib.util.spec_from_file_location(
    "extract_catalogue",
    Path(__file__).resolve().parent / "extract-catalogue.py",
)
_CATALOGUE = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_CATALOGUE)

ROOT = _CATALOGUE.ROOT
PDF_PATH = _CATALOGUE.PDF_PATH
category_for = _CATALOGUE.category_for
classify = _CATALOGUE.classify
codes_match = _CATALOGUE.codes_match
parse_lifestyle = _CATALOGUE.parse_lifestyle
parse_spec_page = _CATALOGUE.parse_spec_page
render_page = _CATALOGUE.render_page

ZOOM = 3.4
MAX_EDGE = 1600
MAX_IMAGES = 8


def content_boxes(image: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Bounding boxes of product photographs on the left of a spec page."""
    height, width = image.shape[:2]
    gray = image.mean(axis=2)
    mask = (gray < 246).astype(np.uint8) * 255
    mask[:, int(width * 0.50) :] = 0
    mask[: int(height * 0.11), :] = 0
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 25))
    closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for contour in contours:
        x, y, box_w, box_h = cv2.boundingRect(contour)
        if box_w * box_h < 0.02 * height * width or box_w < 60 or box_h < 60:
            continue
        boxes.append((x, y, box_w, box_h))
    boxes.sort(key=lambda box: box[1])
    return [pad_box(box, width, height) for box in boxes]


def pad_box(box: tuple[int, int, int, int], width: int, height: int) -> tuple[int, int, int, int]:
    x, y, box_w, box_h = box
    pad_x = max(6, int(box_w * 0.03))
    pad_y = max(6, int(box_h * 0.03))
    left = max(0, x - pad_x)
    top = max(int(height * 0.105), y - pad_y)
    right = min(int(width * 0.49), x + box_w + pad_x)
    bottom = min(height - 4, y + box_h + pad_y)
    return left, top, max(1, right - left), max(1, bottom - top)


def slot_boxes(image: np.ndarray, count: int) -> list[tuple[int, int, int, int]]:
    """One left-hand crop per product when the contour pass finds the wrong number."""
    height, width = image.shape[:2]
    header = int(height * 0.12)
    footer = int(height * 0.03)
    usable = height - header - footer
    boxes = []
    for index in range(count):
        top = header + int(usable * index / count)
        bottom = header + int(usable * (index + 1) / count)
        band = image[top:bottom, : int(width * 0.48)]
        gray = band.mean(axis=2)
        ys, xs = np.where(gray < 246)
        if len(xs) < 40:
            side = min(int(width * 0.42), bottom - top)
            boxes.append((12, top + 8, side, max(40, bottom - top - 16)))
            continue
        x0, x1 = int(xs.min()), int(xs.max())
        y0, y1 = int(ys.min()), int(ys.max())
        boxes.append(pad_box((x0, top + y0, x1 - x0 + 1, y1 - y0 + 1), width, height))
    return boxes


def clear_corner_number(image: np.ndarray) -> np.ndarray:
    """Cover the small page number in the bottom-right corner of a lifestyle frame."""
    height, width = image.shape[:2]
    box_w = max(48, int(width * 0.09))
    box_h = max(40, int(height * 0.07))
    mask = np.zeros((height, width), np.uint8)
    mask[height - box_h :, width - box_w :] = 255
    return cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)


def lifestyle_crop(image: np.ndarray) -> np.ndarray:
    height = image.shape[0]
    row_mean = image.mean(axis=(1, 2))
    bar = 0
    while bar < int(height * 0.2) and row_mean[bar] < 70:
        bar += 1
    cropped = image[bar + 2 :, :]
    return clear_corner_number(cropped)


def to_webp(image: np.ndarray) -> tuple[bytes, int, int]:
    rgb = Image.fromarray(image)
    longest = max(rgb.size)
    if longest > MAX_EDGE:
        scale = MAX_EDGE / longest
        rgb = rgb.resize((max(1, int(rgb.width * scale)), max(1, int(rgb.height * scale))), Image.Resampling.LANCZOS)
    from io import BytesIO

    buffer = BytesIO()
    rgb.save(buffer, format="WEBP", quality=82, method=4)
    return buffer.getvalue(), rgb.width, rgb.height


def process_page(job: tuple[str, int, list[dict], str]) -> dict:
    pdf_path, page, page_products, catalogue = job
    if category_for(page) is None:
        return {"page": page, "kind": "skip", "saved": [], "code": None}
    image = render_page(pdf_path, page, ZOOM)
    kind = classify(image)
    if kind == "divider":
        return {"page": page, "kind": kind, "saved": [], "code": None}
    if kind == "lifestyle":
        code, _dropped = parse_lifestyle(image, page)
        if not code:
            return {"page": page, "kind": kind, "saved": [], "code": None, "miss": "no code"}
        blob, width, height = to_webp(lifestyle_crop(image))
        return {"page": page, "kind": kind, "saved": [], "code": code, "blob": blob, "width": width, "height": height}

    parsed, _problems = parse_spec_page(image, page)
    order = [item["model"] for item in parsed if item.get("model")]
    boxes = content_boxes(image)
    if len(boxes) != len(page_products):
        boxes = slot_boxes(image, len(page_products)) if page_products else boxes
    catalogue_dir = Path(catalogue)
    saved = []
    used: set[str] = set()
    pairs: list[tuple[dict, tuple[int, int, int, int]]] = []
    if order and len(boxes) >= len(order):
        for index, model in enumerate(order):
            match = next(
                (
                    product
                    for product in sorted(page_products, key=lambda item: item["slug"])
                    if product["model"] == model and product["slug"] not in used
                ),
                None,
            )
            if match is None:
                continue
            used.add(match["slug"])
            pairs.append((match, boxes[index]))
    else:
        ordered = sorted(page_products, key=lambda item: item["slug"])
        for product, box in zip(ordered, boxes):
            pairs.append((product, box))

    for product, (x, y, box_w, box_h) in pairs:
        crop = image[y : y + box_h, x : x + box_w]
        if crop.size == 0:
            continue
        blob, width, height = to_webp(crop)
        folder = catalogue_dir / product["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / "01.webp"
        path.write_bytes(blob)
        saved.append(
            {
                "slug": product["slug"],
                "src": f"/catalogue/{product['slug']}/01.webp",
                "width": width,
                "height": height,
                "alt": f"{product['title']}. Model {product['model']}.",
            }
        )
    missed = [product["slug"] for product in page_products if product["slug"] not in {item["slug"] for item in saved}]
    return {"page": page, "kind": "spec", "saved": saved, "code": None, "missed": missed}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", default=PDF_PATH)
    parser.add_argument("--pages", default="")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--data", default=str(ROOT / "src" / "data" / "products.json"))
    parser.add_argument("--catalogue", default=str(ROOT / "public" / "catalogue"))
    args = parser.parse_args()

    products = json.loads(Path(args.data).read_text())
    if args.pages:
        wanted = {int(part) for part in args.pages.split(",") if part.strip()}
        products = [product for product in products if product["sourcePage"] in wanted]
    by_page: dict[int, list[dict]] = defaultdict(list)
    for product in products:
        product["images"] = []
        by_page[product["sourcePage"]].append(product)

    pages = sorted(by_page)
    # Lifestyle frames sit on pages that are not spec pages. Walk the whole range
    # unless the caller named pages.
    if args.pages:
        scan = sorted(wanted)
    else:
        scan = list(range(4, 503))

    print(f"rendering {len(scan)} pages", flush=True)
    jobs = [(args.pdf, page, by_page.get(page, []), args.catalogue) for page in scan]
    results = []
    if args.workers <= 1:
        for job in jobs:
            results.append(process_page(job))
    else:
        with ProcessPoolExecutor(max_workers=args.workers) as pool:
            futures = [pool.submit(process_page, job) for job in jobs]
            done = 0
            for future in as_completed(futures):
                results.append(future.result())
                done += 1
                if done % 25 == 0 or done == len(scan):
                    print(f"rendered {done}/{len(scan)}", flush=True)

    by_slug = {product["slug"]: product for product in products}
    spec_saved = 0
    missed = []
    lifestyle_saved = 0
    lifestyle_unmatched = []
    ordered_products = sorted(products, key=lambda product: len(product["model"]), reverse=True)
    lifestyle_frames = []

    for item in results:
        for saved in item.get("saved") or []:
            product = by_slug.get(saved["slug"])
            if product is None:
                continue
            product["images"] = [
                {"src": saved["src"], "width": saved["width"], "height": saved["height"], "alt": saved["alt"]}
            ]
            spec_saved += 1
        missed.extend(item.get("missed") or [])
        if item.get("kind") == "lifestyle":
            if item.get("blob") and item.get("code"):
                lifestyle_frames.append(item)
            else:
                lifestyle_unmatched.append({"page": item["page"], "code": item.get("code") or ""})

    for item in sorted(lifestyle_frames, key=lambda row: row["page"]):
        code = item["code"]
        match = next((product for product in ordered_products if codes_match(code, product["model"])), None)
        if match is None:
            lifestyle_unmatched.append({"page": item["page"], "code": code})
            continue
        if len(match["images"]) >= MAX_IMAGES:
            continue
        # 01.webp is the spec cut. Room shots start at 02, or 01 when the spec cut is missing.
        index = len(match["images"]) + 1
        folder = Path(args.catalogue) / match["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        filename = f"{index:02d}.webp"
        (folder / filename).write_bytes(item["blob"])
        match["images"].append(
            {
                "src": f"/catalogue/{match['slug']}/{filename}",
                "width": item["width"],
                "height": item["height"],
                "alt": f"{match['title']}. Model {match['model']}.",
            }
        )
        lifestyle_saved += 1

    if not args.pages:
        Path(args.data).write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n")
    else:
        preview = Path("/tmp/celestial-photos/preview.json")
        preview.write_text(json.dumps(products, indent=2) + "\n")

    with_images = sum(1 for product in products if product["images"])
    print(f"spec crops saved: {spec_saved}")
    print(f"products with an image: {with_images}/{len(products)}")
    print(f"lifestyle frames attached: {lifestyle_saved}")
    print(f"products missing a crop: {len(missed)}")
    if missed[:12]:
        print("  missed:", ", ".join(missed[:12]))
    print(f"lifestyle unmatched: {len(lifestyle_unmatched)}")
    if lifestyle_unmatched:
        print(" ", json.dumps(lifestyle_unmatched[:12]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
