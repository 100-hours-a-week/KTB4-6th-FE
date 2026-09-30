import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib';

interface OnboardingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'outline';
}

export const OnboardingActionButton = ({
  children,
  className,
  disabled,
  isLoading = false,
  variant = 'primary',
  ...props
}: OnboardingActionButtonProps) => {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      className={cn(
        'flex h-14 w-full items-center justify-center rounded-2xl border text-base font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-300',
        isDisabled
          ? 'pointer-events-none border-cool-200 bg-cool-200 text-cool-400'
          : variant === 'primary'
            ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
            : 'border-brand-600 bg-white text-brand-600 hover:bg-brand-50 active:bg-brand-100',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? '처리 중...' : children}
    </button>
  );
};
