import { Menu } from 'lucide-react';

export const HomeHeader = () => (
  <header className="flex items-center px-5 py-4">
    <button
      type="button"
      aria-label="메뉴 열기"
      className="flex size-9 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100"
    >
      <Menu className="size-5" strokeWidth={2} />
    </button>
    <span className="font-display ml-2 text-lg font-bold tracking-tight text-cool-900">Meety</span>
  </header>
);
