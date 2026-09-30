'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';
import { useReleaseTeamBlock, useTeamBlocksData } from '@/features/team-management';
import { useAppToast } from '@/shared/ui';
import { mapBlockedMembers } from '../model/map-team-management-data';
import { teamManagementToastMessages } from '../model/toast-messages';
import type { BlockedMember } from '../model/types';
import { BlockedListItem } from './BlockedListItem';
import { BlockReleaseDialog } from './BlockReleaseDialog';

interface BlockedListSectionProps {
  teamId: number;
}

export const BlockedListSection = ({ teamId }: BlockedListSectionProps) => {
  const { status, blocks } = useTeamBlocksData(teamId);
  const [releaseTarget, setReleaseTarget] = useState<BlockedMember | null>(null);
  const { showToast } = useAppToast();
  const releaseTeamBlockMutation = useReleaseTeamBlock(teamId);

  const blockedMembers = mapBlockedMembers(blocks);

  const handleReleaseConfirm = () => {
    if (!releaseTarget) return;

    releaseTeamBlockMutation.mutate(Number(releaseTarget.id), {
      onSuccess: () => {
        const { text, variant } = teamManagementToastMessages.blockReleaseSuccess;
        showToast(text, variant);
      },
      onError: () => {
        const { text, variant } = teamManagementToastMessages.blockReleaseFailure;
        showToast(text, variant);
      },
    });
  };

  return (
    <section className="mt-6 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-base font-bold text-cool-900">차단 목록</h2>
          <button
            type="button"
            aria-label="차단 목록 설명"
            className="flex size-5 items-center justify-center text-cool-400"
          >
            <Info className="size-4" strokeWidth={2} />
          </button>
        </div>
        <span className="text-sm text-cool-500">{blockedMembers.length}명</span>
      </div>

      {status === 'loading' ? (
        <div className="mt-3 flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
          <p className="text-sm text-cool-500">차단 목록을 불러오는 중이에요.</p>
        </div>
      ) : status === 'error' ? (
        <div className="mt-3 flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
          <p className="text-sm text-cool-500">차단 목록을 불러오지 못했어요.</p>
        </div>
      ) : blockedMembers.length === 0 ? (
        <div className="mt-3 flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
          <p className="text-sm text-cool-500">차단된 참여자가 없어요.</p>
        </div>
      ) : (
        <ul className="mt-2">
          {blockedMembers.map((member, index) => (
            <BlockedListItem
              key={member.id}
              order={index + 1}
              member={member}
              onReleaseClick={setReleaseTarget}
            />
          ))}
        </ul>
      )}

      <BlockReleaseDialog
        isOpen={releaseTarget !== null}
        onConfirm={handleReleaseConfirm}
        onOpenChange={(open) => {
          if (!open) setReleaseTarget(null);
        }}
        memberName={releaseTarget?.name ?? ''}
      />
    </section>
  );
};
