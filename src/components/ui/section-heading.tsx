import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeading({ title, subtitle, action }: SectionHeadingProps) {
  return (
    <div className="mb-9 flex items-baseline justify-between gap-6 border-b border-line pb-4">
      <div>
        <h2 className="caps text-label text-ink">{title}</h2>
        {subtitle && (
          <p className="mt-2 max-w-[52ch] text-body-sm text-ink-mid">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
