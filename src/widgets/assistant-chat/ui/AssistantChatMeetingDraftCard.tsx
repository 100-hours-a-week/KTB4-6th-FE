import type { ReactNode } from 'react';
import { CalendarPlus } from 'lucide-react';
import { cn } from '@/shared/lib';
import { formatMeetingDateTime } from '../model/format-meeting-date';
import type { AssistantChatMeetingDraft, AssistantChatMeetingDraftStatus } from '../model/types';
import { AssistantChatMeetingDraftActions } from './AssistantChatMeetingDraftActions';

const UNKNOWN_MEMBER_NAME = '알 수 없는 팀원';

interface AssistantChatMeetingDraftCardProps {
  draft: AssistantChatMeetingDraft;
  status: AssistantChatMeetingDraftStatus;
  errorMessage?: string;
  memberNames: ReadonlyMap<number, string>;
  onConfirm: () => void;
}

const DraftRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="text-cool-500">{label}</dt>
    <dd className="min-w-0 font-medium break-keep text-cool-900 [overflow-wrap:anywhere]">
      {children}
    </dd>
  </>
);

export const AssistantChatMeetingDraftCard = ({
  draft,
  status,
  errorMessage,
  memberNames,
  onConfirm,
}: AssistantChatMeetingDraftCardProps) => {
  const isInactive = status === 'expired';

  return (
    <section
      aria-label="회의 초안"
      className="w-full max-w-[94%] overflow-hidden rounded-2xl border border-cool-200 bg-white"
    >
      <div className={cn(isInactive && 'opacity-50')}>
        <h3 className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 text-[13px] leading-none font-semibold text-cool-900">
          <CalendarPlus aria-hidden="true" className="size-4 text-brand-600" strokeWidth={1.8} />
          회의 초안
        </h3>
        <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 px-4 pb-3.5 text-[13px] leading-[1.45]">
          <DraftRow label="회의 이름">{draft.title}</DraftRow>
          <DraftRow label="목적">{draft.purpose}</DraftRow>
          {draft.note && <DraftRow label="비고">{draft.note}</DraftRow>}
          <DraftRow label="예정 시각">{formatMeetingDateTime(draft.scheduledAt)}</DraftRow>
          <DraftRow label="목표 시간">{draft.targetDurationMinutes}분</DraftRow>
          <DraftRow label="참석자">
            <ul className="flex flex-wrap gap-1">
              {draft.attendeeTeamMemberIds.map((teamMemberId) => (
                <li
                  key={`member-${teamMemberId}`}
                  className="rounded-full bg-cool-100 px-2 py-0.5 text-xs font-medium text-cool-700"
                >
                  {memberNames.get(teamMemberId) ?? UNKNOWN_MEMBER_NAME}
                </li>
              ))}
              {draft.customAttendeeNames.map((name) => (
                <li
                  key={`custom-${name}`}
                  className="rounded-full border border-cool-200 px-2 py-0.5 text-xs font-medium text-cool-600"
                >
                  {name}
                </li>
              ))}
            </ul>
          </DraftRow>
        </dl>
      </div>
      <div className="flex border-t border-cool-100 px-3 py-2.5">
        <AssistantChatMeetingDraftActions
          status={status}
          errorMessage={errorMessage}
          onConfirm={onConfirm}
        />
      </div>
    </section>
  );
};
