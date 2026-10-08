import { Menu, Search } from 'lucide-react';

interface MeetingListHeaderProps {
  teamName: string;
  isMenuDisabled: boolean;
  onMenuClick: () => void;
  isSearchOpen?: boolean;
  onSearchClick?: () => void;
}

export const MeetingListHeader = ({
  teamName,
  isMenuDisabled,
  onMenuClick,
  isSearchOpen = false,
  onSearchClick,
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
      <span className="min-h-5 truncate text-sm text-cool-500">{teamName}</span>
    </div>
    {onSearchClick && (
      <button
        type="button"
        aria-label="회의 검색"
        aria-expanded={isSearchOpen}
        onClick={onSearchClick}
        className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100 aria-expanded:bg-cool-100"
      >
        <Search className="size-5" strokeWidth={2} />
      </button>
    )}
  </header>
);
