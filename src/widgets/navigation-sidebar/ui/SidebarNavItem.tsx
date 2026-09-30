import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface SidebarNavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  isActive?: boolean;
  label: string;
  trailing?: ReactNode;
}

export const SidebarNavItem = forwardRef<HTMLButtonElement, SidebarNavItemProps>(
  ({ className, icon, isActive = false, label, trailing, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition-colors',
        isActive ? 'bg-cool-100 font-semibold text-cool-900' : 'text-cool-700 hover:bg-cool-50',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'flex size-5 items-center justify-center',
          isActive ? 'text-cool-900' : 'text-cool-400',
        )}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {trailing}
    </button>
  ),
);

SidebarNavItem.displayName = 'SidebarNavItem';
