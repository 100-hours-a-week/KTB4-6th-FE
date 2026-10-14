'use client';

import { useEffect, useRef } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Check, X } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';
import type { AttendeeMember, useAttendeeSelection } from '../model/useAttendeeSelection';

type AttendeeSelection = ReturnType<typeof useAttendeeSelection>;

interface AttendeeSelectDialogProps {
  selection: AttendeeSelection;
  onCancel: () => void;
  onNext: () => void;
}

const getMemberCaption = (member: AttendeeMember) => {
  if (member.isMe) return member.isLeader ? '나 · 팀장' : '나';
  return member.isLeader ? '팀장' : null;
};

export const AttendeeSelectDialog = ({
  selection,
  onCancel,
  onNext,
}: AttendeeSelectDialogProps) => {
  const frame = useAppFrameElement();
  const { members, selectedTeamMemberIds, selectedCount, maxCount, isFull, toggleMember } =
    selection;
  const selectedMembers = selectedTeamMemberIds
    .map((teamMemberId) => members.find((member) => member.teamMemberId === teamMemberId))
    .filter((member) => member !== undefined);
  const chipListRef = useRef<HTMLUListElement>(null);
  const previousCountRef = useRef(selectedCount);

  useEffect(() => {
    const chipList = chipListRef.current;
    const hasAdded = selectedCount > previousCountRef.current;
    previousCountRef.current = selectedCount;

    if (hasAdded && chipList) {
      chipList.scrollTo({ left: chipList.scrollWidth, behavior: 'smooth' });
    }
  }, [selectedCount]);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] flex max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <div className="shrink-0 border-b border-cool-100 px-6 pt-6 pb-4">
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-xl font-bold tracking-tight text-cool-900">
                회의 참여자 선택
              </Dialog.Title>
              <span
                aria-label={`${maxCount}명 중 ${selectedCount}명 선택`}
                className="rounded-lg bg-cool-100 px-2.5 py-1 text-sm tabular-nums"
              >
                <span className="font-bold text-cool-900">{selectedCount}</span>
                <span className="text-brand-500">/{maxCount}</span>
              </span>
            </div>
            <Dialog.Description className="mt-2 text-sm text-cool-600">
              나를 포함해 최대 {maxCount}명까지 선택할 수 있어요.
            </Dialog.Description>

            <ul
              ref={chipListRef}
              aria-label="선택한 참여자"
              className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {selectedMembers.map((member) => (
                <li
                  key={member.teamMemberId}
                  className={cn(
                    'flex h-9 shrink-0 items-center gap-1 rounded-full border text-sm font-semibold whitespace-nowrap',
                    member.isMe
                      ? 'border-brand-200 bg-brand-50 px-4 text-brand-700'
                      : 'border-cool-200 bg-white pr-1.5 pl-4 text-cool-900',
                  )}
                >
                  {member.name}
                  {!member.isMe && (
                    <button
                      type="button"
                      aria-label={`${member.name} 선택 해제`}
                      onClick={() => toggleMember(member.teamMemberId)}
                      className="flex size-6 items-center justify-center rounded-full text-cool-500 hover:bg-cool-100"
                    >
                      <X aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <p className="text-[13px] text-cool-500">팀원 {members.length}명</p>
            <ul className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3">
              {members.map((member) => {
                const isSelected = selectedTeamMemberIds.includes(member.teamMemberId);
                const isDisabled = member.isMe || (isFull && !isSelected);
                const caption = getMemberCaption(member);

                return (
                  <li key={member.teamMemberId}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isDisabled}
                      onClick={() => toggleMember(member.teamMemberId)}
                      className={cn(
                        'flex w-full flex-col items-center gap-1.5 rounded-xl py-1 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none',
                        isDisabled && !isSelected && 'opacity-40',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'relative flex size-12 items-center justify-center rounded-full text-base font-semibold',
                          isSelected ? 'bg-brand-500 text-white' : 'bg-cool-100 text-brand-700',
                        )}
                      >
                        {member.name.charAt(0)}
                        {isSelected && (
                          <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-brand-500">
                            <Check className="size-3 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span className="flex max-w-full flex-col items-center">
                        <span
                          className={cn(
                            'max-w-full truncate text-sm',
                            isSelected ? 'font-semibold text-cool-900' : 'text-cool-700',
                          )}
                        >
                          {member.name}
                        </span>
                        {caption && <span className="text-xs text-brand-600">{caption}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid shrink-0 grid-cols-[2fr_3fr] gap-3 border-t border-cool-100 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="h-14 rounded-2xl border border-cool-200 bg-white text-base font-semibold text-cool-900 hover:bg-cool-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={selectedCount === 0}
              className="h-14 rounded-2xl bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:bg-cool-200 disabled:text-cool-500"
            >
              다음
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
