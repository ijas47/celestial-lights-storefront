import type { Spec } from '@/lib/types';

interface SpecListProps {
  specs: Spec[];
}

export function SpecList({ specs }: SpecListProps) {
  const rows = specs.filter((spec) => spec.label !== 'Model');
  if (rows.length === 0) return null;

  return (
    <dl className="border-t border-line">
      {rows.map((spec) => (
        <div
          key={`${spec.label}-${spec.value}`}
          className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-3"
        >
          <dt className="text-label-sm text-ink-mid">{spec.label}</dt>
          <dd className="text-body-sm text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
