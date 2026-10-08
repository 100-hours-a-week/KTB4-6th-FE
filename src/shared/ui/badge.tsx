import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib';

const badgeVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        brand: 'bg-brand-100 text-brand-600',
        brandSolid: 'bg-brand-600 text-white',
        success: 'bg-success-bg text-success',
        warning: 'bg-warning-bg text-warning',
        danger: 'bg-danger-bg text-danger',
        outline: 'border border-cool-200 text-cool-600',
        neutral: 'bg-cool-100 text-cool-600',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
