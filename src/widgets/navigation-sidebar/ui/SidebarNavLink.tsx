import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { getSidebarNavItemClassName, SidebarNavItemContent } from './SidebarNavItem';

interface SidebarNavLinkProps {
  href: string;
  icon: ReactNode;
  isActive: boolean;
  label: string;
  onActiveClick: () => void;
}

export const SidebarNavLink = ({
  href,
  icon,
  isActive,
  label,
  onActiveClick,
}: SidebarNavLinkProps) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      return;
    }

    event.preventDefault();
    onActiveClick();
  };

  return (
    <Link href={href} onClick={handleClick} className={getSidebarNavItemClassName(isActive)}>
      <SidebarNavItemContent icon={icon} isActive={isActive} label={label} />
    </Link>
  );
};
