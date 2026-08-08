import { ReactNode } from 'react';

interface BadgeProps {
  tone?: 'strong' | 'neutral' | 'danger';
  children: ReactNode;
}

/**
 * Monochrome by design. This system carries no accent colour, so badges
 * differentiate by border and weight, never by hue (except true danger).
 */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  const tones = {
    strong: 'border-ink text-ink',
    neutral: 'border-line-strong text-ink-mid',
    danger: 'border-danger text-danger',
  };

  return (
    <span
      className={`caps inline-block border px-2.5 py-1 text-label-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
