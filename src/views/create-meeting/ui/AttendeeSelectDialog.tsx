'use client';

import { useEffect, useRef } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Check, X } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';
import type { AttendeeMember, useAttendeeSelection } from '../model/useAttendeeSelection';
import { AttendeeMembersErrorState, AttendeeMembersLoadingState } from './AttendeeMemberStates';
import { CustomAttendeeInput } from './CustomAttendeeInput';

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
  const {
    status,
    isRetrying,
    retry,
    members,
    selectedTeamMemberIds,
    selectedCount,
    maxCount,
    isFull,
    toggleMember,
    customNames,
    customMaxCount,
    canAddCustomName,
    addCustomName,
    removeCustomName,
  } = selection;
  const selectedMembers = selectedTeamMemberIds
    .map((teamMemberId) => members.find((member) => member.teamMemberId === teamMemberId))
    .filter((member) => member !== undefined);
  const chipListRef = useRef<HTMLDivElement>(null);
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
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/45" />
        <Dialog.Popup className="absolute inset-x-5 top-[72px] bottom-[68px] z-[90] flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_20px_48px_rgba(20,34,56,0.24)] outline-none">
          <div className="relative shrink-0 border-b border-cool-100 px-6 pt-9 pb-4 text-center">
            <Dialog.Title className="text-xl font-bold text-cool-900">
              회의 참여자 선택
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-cool-600 tabular-nums">
              <span className="font-bold text-brand-600">{selectedCount}</span>/{maxCount}명 선택
            </Dialog.Description>
            <Dialog.Close
              aria-label="회의 생성 취소"
              className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-50"
            >
              <X className="size-5" strokeWidth={2} />
            </Dialog.Close>
            <div
              ref={chipListRef}
              className="-mx-6 mt-4 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <ul aria-label="선택한 참여자" className="mx-auto flex w-max gap-2">
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
                {customNames.map((name) => (
                  <li
                    key={`custom-${name}`}
                    className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-cool-200 bg-white pr-1.5 pl-4 text-sm font-semibold whitespace-nowrap text-cool-900"
                  >
                    {name}
                    <span className="text-xs font-medium text-cool-500">직접</span>
                    <button
                      type="button"
                      aria-label={`${name} 삭제`}
                      onClick={() => removeCustomName(name)}
                      className="flex size-6 items-center justify-center rounded-full text-cool-500 hover:bg-cool-100"
                    >
                      <X aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {status === 'loading' && <AttendeeMembersLoadingState />}
            {status === 'error' && (
              <AttendeeMembersErrorState isRetrying={isRetrying} onRetry={retry} />
            )}
            {status === 'success' && (
              <>
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
              </>
            )}

            <CustomAttendeeInput
              customNames={customNames}
              maxCount={customMaxCount}
              canAdd={canAddCustomName}
              onAdd={addCustomName}
            />
          </div>

          <div className="flex shrink-0 gap-3 border-t border-cool-200 bg-white px-6 py-5">
            <button
              type="button"
              onClick={onCancel}
              className="h-14 flex-1 rounded-xl border border-cool-200 text-base font-semibold text-cool-700 transition-colors hover:bg-cool-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={status !== 'success'}
              className="h-14 flex-1 rounded-xl bg-brand-600 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-cool-200 disabled:text-cool-400"
            >
              다음
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
