import { Menu } from 'lucide-react';

interface MeetingListHeaderProps {
  teamName: string;
  onMenuClick: () => void;
}

export const MeetingListHeader = ({ teamName, onMenuClick }: MeetingListHeaderProps) => (
  <header className="flex items-center border-b border-cool-200 bg-white px-5 py-4">
    <button
      type="button"
      aria-label="메뉴 열기"
      onClick={onMenuClick}
      className="flex size-9 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100"
    >
      <Menu className="size-5" strokeWidth={2} />
    </button>
    <div className="ml-2 flex flex-col">
      <h1 className="text-lg font-bold tracking-tight text-cool-900">회의 목록</h1>
      <span className="text-sm text-cool-500">{teamName}</span>
    </div>
  </header>
);
