'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Info } from 'lucide-react';
import { useReleaseTeamBlock, useTeamBlocksData } from '@/features/team-management';
import { useAppFrameElement } from '@/shared/lib';
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
  const frame = useAppFrameElement();
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
          <Popover.Root>
            <Popover.Trigger
              aria-label="차단 목록 설명"
              className="flex size-5 items-center justify-center rounded-full text-cool-400 transition-colors hover:text-cool-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              <Info className="size-4" strokeWidth={2} />
            </Popover.Trigger>
            <Popover.Portal container={frame}>
              <Popover.Positioner
                className="z-[75] outline-none"
                side="bottom"
                align="start"
                sideOffset={8}
                alignOffset={-60}
              >
                <Popover.Popup className="w-[330px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-cool-900 px-5 py-5 text-left shadow-[0_8px_24px_rgba(20,34,56,0.24)] outline-none">
                  <Popover.Arrow className="size-3 rotate-45 bg-cool-900 data-[side=bottom]:-top-1.5 data-[side=left]:-right-1.5 data-[side=right]:-left-1.5 data-[side=top]:-bottom-1.5" />
                  <Popover.Title className="text-base font-bold text-white">
                    차단 설명
                  </Popover.Title>
                  <Popover.Description className="mt-5 text-sm leading-6 text-cool-300">
                    참여자를 강퇴하면 자동 차단됩니다.
                    <br />
                    차단된 사람은 초대코드 입력해도 팀에 입장이 불가능합니다.
                  </Popover.Description>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
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
