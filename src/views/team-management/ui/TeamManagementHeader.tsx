import { Menu } from 'lucide-react';

interface TeamManagementHeaderProps {
  isMenuDisabled: boolean;
  onMenuClick: () => void;
}

export const TeamManagementHeader = ({
  isMenuDisabled,
  onMenuClick,
}: TeamManagementHeaderProps) => (
  <header className="flex items-center px-5 py-4">
    <button
      type="button"
      aria-label="메뉴 열기"
      disabled={isMenuDisabled}
      onClick={onMenuClick}
      className="flex size-9 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100 disabled:opacity-50"
    >
      <Menu className="size-5" strokeWidth={2} />
    </button>
    <span className="ml-2 text-lg font-bold tracking-tight text-cool-900">팀 페이지</span>
  </header>
);
