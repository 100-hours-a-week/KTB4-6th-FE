import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getTeamHomePath } from '@/features/home';

interface NotificationsHeaderProps {
  teamId: number;
  isReadAllDisabled: boolean;
  onReadAllClick: () => void;
}

export const NotificationsHeader = ({
  teamId,
  isReadAllDisabled,
  onReadAllClick,
}: NotificationsHeaderProps) => (
  <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-cool-200 bg-white px-3">
    <Link
      href={getTeamHomePath(teamId)}
      aria-label="홈으로 이동"
      className="flex size-10 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100"
    >
      <ChevronLeft className="size-6" strokeWidth={2} />
    </Link>
    <h1 className="text-lg font-bold tracking-tight text-cool-900">알림</h1>
    <button
      type="button"
      disabled={isReadAllDisabled}
      onClick={onReadAllClick}
      className="justify-self-end rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:text-cool-400 disabled:hover:bg-transparent"
    >
      모두 읽음
    </button>
  </header>
);
