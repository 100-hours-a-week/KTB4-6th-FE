'use client';

import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Plus, X } from 'lucide-react';
import { cn, useAppFrameElement, withWaGwa } from '@/shared/lib';
import type { TeamMember } from '../model/preview-team-members';

const CUSTOM_NAME_MAX_LENGTH = 8;

type LinkSelection = { type: 'member'; memberId: string } | { type: 'custom' } | null;

interface CurrentLink {
  name: string;
  /** 팀 멤버와 연결된 경우의 멤버 ID. 직접 입력한 별칭이면 없음 */
  memberId?: string;
}

interface TeamMemberLinkDialogProps {
  /** 연결되지 않은 발화자의 이름(`발화자 N`) */
  speakerLabel: string;
  members: TeamMember[];
  /** 이미 연결된 발화자라면 현재 연결 정보 */
  currentLink: CurrentLink | null;
  onConnect: (name: string) => void;
  onUnlink: () => void;
  onClose: () => void;
}

interface MemberOptionProps {
  name: string;
  value: string;
  isChecked: boolean;
  avatar: ReactNode;
  onSelect: () => void;
  radioName: string;
}

const MemberOption = ({
  name,
  value,
  isChecked,
  avatar,
  onSelect,
  radioName,
}: MemberOptionProps) => (
  <label
    className={cn(
      'flex h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand-300',
      isChecked ? 'border-brand-200 bg-brand-100' : 'border-cool-200 bg-white',
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        isChecked ? 'bg-brand-200 text-brand-700' : 'bg-cool-100 text-cool-500',
      )}
    >
      {avatar}
    </span>
    <span
      className={cn('text-sm', isChecked ? 'font-bold text-cool-900' : 'font-medium text-cool-900')}
    >
      {name}
    </span>
    <input
      type="radio"
      name={radioName}
      value={value}
      checked={isChecked}
      onChange={onSelect}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={cn(
        'ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-2',
        isChecked ? 'border-brand-600' : 'border-cool-300',
      )}
    >
      {isChecked && <span className="size-2.5 rounded-full bg-brand-600" />}
    </span>
  </label>
);

/**
 * 전사의 발화자를 팀 멤버 또는 직접 입력한 이름·별칭과 연결하는 모달.
 * 이미 연결된 발화자는 현재 연결을 선택한 상태로 열리고, 연결을 해제할 수 있다.
 */
export const TeamMemberLinkDialog = ({
  speakerLabel,
  members,
  currentLink,
  onConnect,
  onUnlink,
  onClose,
}: TeamMemberLinkDialogProps) => {
  const frame = useAppFrameElement();
  const radioName = useId();
  const [selection, setSelection] = useState<LinkSelection>(() => {
    if (!currentLink) return null;
    return currentLink.memberId
      ? { type: 'member', memberId: currentLink.memberId }
      : { type: 'custom' };
  });
  const [customName, setCustomName] = useState(
    currentLink && !currentLink.memberId ? currentLink.name : '',
  );

  const selectedMember =
    selection?.type === 'member'
      ? members.find((member) => member.id === selection.memberId)
      : undefined;
  const trimmedCustomName = customName.trim();
  const connectName =
    selection?.type === 'custom' ? trimmedCustomName : (selectedMember?.name ?? '');
  const canConnect = connectName !== '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canConnect) onConnect(connectName);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal container={frame}>
        <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/40" />
        <Dialog.Popup className="absolute top-1/2 left-1/2 z-[90] flex max-h-[calc(100%-3rem)] w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(20,34,56,0.2)] outline-none">
          <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-5 pt-5">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-bold text-cool-900">
                  팀 멤버 연결
                </Dialog.Title>
                <Dialog.Close
                  aria-label="닫기"
                  className="-mr-1.5 flex size-8 items-center justify-center rounded-lg text-cool-600 hover:bg-cool-50"
                >
                  <X aria-hidden="true" className="size-5" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="mt-2 text-sm leading-5 text-cool-600">
                {currentLink
                  ? `현재 ${withWaGwa(currentLink.name)} 연결되어 있어요.`
                  : `${withWaGwa(speakerLabel)} 연결할 팀 멤버를 선택하세요.`}
              </Dialog.Description>
            </div>

            <div
              role="radiogroup"
              aria-label="연결할 팀 멤버"
              className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 pb-4"
            >
              {members.map((member) => (
                <MemberOption
                  key={member.id}
                  radioName={radioName}
                  value={member.id}
                  name={member.name}
                  avatar={member.name.charAt(0)}
                  isChecked={selection?.type === 'member' && selection.memberId === member.id}
                  onSelect={() => setSelection({ type: 'member', memberId: member.id })}
                />
              ))}
              <MemberOption
                radioName={radioName}
                value="custom"
                name="직접 입력"
                avatar={<Plus aria-hidden="true" className="size-4" strokeWidth={2} />}
                isChecked={selection?.type === 'custom'}
                onSelect={() => setSelection({ type: 'custom' })}
              />
              {selection?.type === 'custom' && (
                <input
                  autoFocus
                  aria-label="이름 또는 별칭"
                  value={customName}
                  maxLength={CUSTOM_NAME_MAX_LENGTH}
                  placeholder="이름 또는 별칭 입력"
                  onChange={(event) => setCustomName(event.target.value)}
                  className="h-12 w-full shrink-0 rounded-xl border border-cool-200 bg-cool-50 px-4 text-sm text-cool-900 transition-colors outline-none placeholder:text-cool-400 focus:border-brand-600"
                />
              )}
            </div>

            <div className="shrink-0 border-t border-cool-100 px-5 pt-3 pb-5">
              {currentLink && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onUnlink}
                    className="py-1.5 text-sm font-semibold text-danger"
                  >
                    연결 해제
                  </button>
                </div>
              )}
              <div className={cn('grid grid-cols-2 gap-2', currentLink ? 'mt-1' : 'mt-2')}>
                <Dialog.Close className="h-12 rounded-xl border border-cool-200 text-sm font-semibold text-cool-700 transition-colors hover:bg-cool-50">
                  취소
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={!canConnect}
                  className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-cool-100 disabled:text-cool-400"
                >
                  연결
                </button>
              </div>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
