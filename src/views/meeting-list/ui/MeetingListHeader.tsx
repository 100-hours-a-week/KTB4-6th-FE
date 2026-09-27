import { Menu } from 'lucide-react';

interface MeetingListHeaderProps {
  /** 팀 정보를 불러오기 전에는 빈 문자열이다 */
  teamName: string;
  isMenuDisabled: boolean;
  onMenuClick: () => void;
}

export const MeetingListHeader = ({
  teamName,
  isMenuDisabled,
  onMenuClick,
}: MeetingListHeaderProps) => (
  <header className="flex items-center border-b border-cool-200 bg-white px-5 py-4">
    <button
      type="button"
      aria-label="메뉴 열기"
      disabled={isMenuDisabled}
      onClick={onMenuClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100 disabled:opacity-50"
    >
      <Menu className="size-5" strokeWidth={2} />
    </button>
    <div className="ml-2 flex min-w-0 flex-col">
      <h1 className="text-lg font-bold tracking-tight text-cool-900">회의 목록</h1>
      {/* 팀 이름이 오기 전에도 높이를 유지해 이름이 나타날 때 헤더가 흔들리지 않게 한다 */}
      <span className="min-h-5 truncate text-sm text-cool-500">{teamName}</span>
    </div>
  </header>
);
