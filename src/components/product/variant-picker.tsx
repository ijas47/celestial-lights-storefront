'use client';

import type { ProductOption, ProductVariant } from '@/lib/types';

interface VariantPickerProps {
  options: ProductOption[];
  variants: ProductVariant[];
  selected: Record<string, string>;
  onSelect: (optionName: string, value: string) => void;
}

export function VariantPicker({
  options,
  variants,
  selected,
  onSelect,
}: VariantPickerProps) {
  const isOptionAvailable = (optionName: string, value: string) => {
    const selectedCopy = { ...selected };
    selectedCopy[optionName] = value;

    return variants.some((v) =>
      v.availableForSale &&
      v.selectedOptions.every(
        (opt) => selectedCopy[opt.name] === opt.value
      )
    );
  };

  return (
    <div className="space-y-5">
      {options.map((option) => (
        <div key={option.name}>
          <label className="caps text-label-sm mb-2 block text-ink-mid">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((optionValue) => {
              const isSelected = selected[option.name] === optionValue.name;
              const isAvailable = isOptionAvailable(
                option.name,
                optionValue.name
              );

              return (
                <button
                  key={optionValue.name}
                  onClick={() =>
                    onSelect(option.name, optionValue.name)
                  }
                  className={`caps-tight text-label border px-4 py-2 active:scale-[0.98] transition-transform duration-[120ms] ${
                    isSelected
                      ? 'border-ink bg-ink text-ink-inverse'
                      : 'border-line text-ink hover:border-ink'
                  } ${!isAvailable ? 'opacity-40 line-through' : ''}`}
                  aria-pressed={isSelected}
                  disabled={!isAvailable}
                >
                  {optionValue.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
