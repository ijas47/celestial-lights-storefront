import { ReactNode } from 'react';

interface BadgeProps {
  tone?: 'ember' | 'neutral' | 'danger';
  children: ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  const toneClasses = {
    ember: 'bg-ember-500/20 text-ember-300',
    neutral: 'bg-night-700 text-text-mid',
    danger: 'bg-danger/20 text-danger',
  };

  return (
    <span className={`inline-block px-2 py-1 rounded-pill text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
