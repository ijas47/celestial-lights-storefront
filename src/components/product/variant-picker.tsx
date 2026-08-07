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
          <label className="text-xs uppercase tracking-wide text-text-low mb-2 block">
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
                  className={`rounded-pill border px-3.5 py-1.5 text-sm transition-colors focus-visible:ring focus-visible:ring-ember-500 ${
                    isSelected
                      ? 'border-ember-400 bg-ember-400/10 text-ember-200'
                      : 'border-line text-text-mid hover:border-ember-500'
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
