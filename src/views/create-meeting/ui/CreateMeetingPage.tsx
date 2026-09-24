'use client';

import { Headphones, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateMeetingDialog } from './CreateMeetingDialog';

interface CreateMeetingPageProps {
  teamId: number;
}

export const CreateMeetingPage = ({ teamId }: CreateMeetingPageProps) => {
  const router = useRouter();
  const closeModal = () => router.replace(`/teams/${teamId}`);

  return (
    <div className="relative flex h-dvh min-h-[844px] flex-1 flex-col overflow-hidden bg-cool-50">
      <header className="shrink-0 border-b border-cool-200 bg-white px-5 pt-5 pb-4">
        <div className="flex h-10 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center text-cool-900">
            <Menu aria-hidden="true" className="size-5" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-bold text-cool-900">현재 회의</h1>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-cool-600">
            <span aria-hidden="true" className="size-2 rounded-full bg-cool-300" />
            연결 준비 중
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          <Headphones aria-hidden="true" className="size-7" strokeWidth={2.2} />
        </div>
        <p className="mt-5 text-base font-bold text-cool-900">회의 정보를 입력해주세요</p>
      </main>

      <CreateMeetingDialog teamId={teamId} onClose={closeModal} />
    </div>
  );
};
