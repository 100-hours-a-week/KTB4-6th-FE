'use client';

import { Copy, Users } from 'lucide-react';
import { useCopyToClipboard } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import type { TeamSummary } from '../model/types';

interface TeamSummaryCardProps {
  team: TeamSummary;
}

export const TeamSummaryCard = ({ team }: TeamSummaryCardProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const { showToast } = useAppToast();

  const handleCopyInviteCode = async () => {
    const isSuccess = await copyToClipboard(team.inviteCode);

    if (isSuccess) {
      showToast('초대 코드가 복사되었습니다', 'success');
    } else {
      showToast('초대 코드 복사에 실패했습니다.\n다시 시도해주세요.', 'danger');
    }
  };

  return (
    <section className="mx-5 rounded-2xl border border-cool-100 bg-white p-5 shadow-[0_1px_2px_rgba(20,34,56,0.04)]">
      <h1 className="text-xl font-bold tracking-[-0.02em] text-cool-900">{team.name}</h1>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-cool-50 px-4 py-3">
        <div className="flex items-center gap-1.5 text-cool-900">
          <Users className="size-4" strokeWidth={2} />
          <span className="text-sm font-semibold">{team.memberCount}</span>
        </div>

        <div aria-hidden="true" className="h-8 w-px bg-cool-200" />

        <div className="flex flex-1 items-center justify-between gap-2">
          <div>
            <p className="text-xs text-cool-500">초대코드</p>
            <p className="text-sm font-semibold tracking-wide text-cool-900">{team.inviteCode}</p>
          </div>
          <button
            type="button"
            aria-label="초대 코드 복사"
            onClick={handleCopyInviteCode}
            className="flex size-8 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-900"
          >
            <Copy className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 divide-x divide-cool-100 border-t border-cool-100 pt-4">
        <div>
          <p className="text-xs text-cool-500">누적 회의</p>
          <p className="mt-1 text-base font-bold text-cool-900">{team.totalMeetingCount}회</p>
        </div>
        <div className="pl-4">
          <p className="text-xs text-cool-500">총 회의 시간</p>
          <p className="mt-1 text-base font-bold text-cool-900">{team.totalDurationLabel}</p>
        </div>
      </div>
    </section>
  );
};
