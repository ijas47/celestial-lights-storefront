import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'ember' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: never;
}

export function buttonClasses(
  variant: ButtonVariant = 'ember',
  size: ButtonSize = 'md'
): string {
  const baseClasses = 'font-medium rounded-pill transition-all';

  const variantClasses = {
    ember: 'btn-ember',
    ghost: 'bg-transparent hover:bg-night-700',
    outline: 'border border-line-strong hover:border-ember-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
}

export function Button({
  variant = 'ember',
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
