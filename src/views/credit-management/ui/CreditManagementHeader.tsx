import { Menu } from 'lucide-react';

interface CreditManagementHeaderProps {
  isMenuDisabled: boolean;
  onMenuClick: () => void;
}

export const CreditManagementHeader = ({
  isMenuDisabled,
  onMenuClick,
}: CreditManagementHeaderProps) => (
  <header className="flex shrink-0 items-center border-b border-cool-200 bg-white px-5 py-4">
    <button
      type="button"
      aria-label="메뉴 열기"
      disabled={isMenuDisabled}
      onClick={onMenuClick}
      className="flex size-9 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100 disabled:opacity-50"
    >
      <Menu className="size-5" strokeWidth={2} />
    </button>
    <h1 className="ml-2 text-lg font-bold tracking-tight text-cool-900">크레딧 내역</h1>
  </header>
);
