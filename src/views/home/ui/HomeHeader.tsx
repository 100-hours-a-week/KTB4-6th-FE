import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { getTeamHomePath } from '@/features/home';

interface HomeHeaderProps {
  teamId: number;
  hasUnreadNotification: boolean;
  onMenuClick: () => void;
}

export const HomeHeader = ({ teamId, hasUnreadNotification, onMenuClick }: HomeHeaderProps) => (
  <header className="flex items-center px-5 py-4">
    <button
      type="button"
      aria-label="메뉴 열기"
      onClick={onMenuClick}
      className="flex size-9 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100"
    >
      <Menu className="size-5" strokeWidth={2} />
    </button>
    <span className="font-display ml-2 text-lg font-bold tracking-tight text-cool-900">Meety</span>
    <Link
      href={`${getTeamHomePath(teamId)}/notifications`}
      aria-label={hasUnreadNotification ? '알림, 읽지 않은 알림 있음' : '알림'}
      className="relative ml-auto flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100"
    >
      <Bell className="size-5" strokeWidth={2} />
      {hasUnreadNotification && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-cool-50"
        />
      )}
    </Link>
  </header>
);
