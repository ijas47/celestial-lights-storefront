import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'solid' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: never;
}

export function buttonClasses(
  variant: ButtonVariant = 'solid',
  size: ButtonSize = 'md'
): string {
  const base = 'inline-flex items-center justify-center';

  const variants = {
    solid: 'btn-solid',
    ghost: 'caps text-label text-ink hover:opacity-60 transition-opacity',
    outline:
      'caps text-label border border-ink text-ink transition-colors hover:bg-ink hover:text-ink-inverse',
  };

  const sizes = {
    sm: 'px-4 py-2 text-label-sm',
    md: 'px-6 py-3 text-label',
    lg: 'px-8 py-4 text-label',
  };

  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export function Button({
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${buttonClasses(variant, size)} ${className || ''}`}
      {...props}
    />
  );
}
