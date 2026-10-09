import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getTeamHomePath } from '@/features/home';

interface CreditManagementPageProps {
  teamId: number;
}

export const CreditManagementPage = ({ teamId }: CreditManagementPageProps) => (
  <div className="flex h-dvh min-h-[844px] flex-col bg-white">
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-cool-200 bg-white px-3">
      <Link
        href={getTeamHomePath(teamId)}
        aria-label="홈으로 이동"
        className="flex size-10 items-center justify-center rounded-full text-cool-900 transition-colors hover:bg-cool-100"
      >
        <ChevronLeft className="size-6" strokeWidth={2} />
      </Link>
      <h1 className="text-lg font-bold tracking-tight text-cool-900">크레딧</h1>
    </header>
    <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20 text-center">
      <h2 className="text-[17px] font-bold tracking-tight text-cool-900">준비 중이에요</h2>
      <p className="mt-1.5 text-sm text-cool-600">크레딧 내역은 곧 이곳에서 확인할 수 있어요</p>
    </div>
  </div>
);
