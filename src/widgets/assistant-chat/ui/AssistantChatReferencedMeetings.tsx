'use client';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { useMeetingDetail } from '@/features/meeting';
import { formatMeetingDate } from '../model/format-meeting-date';

interface ReferencedMeetingLinkProps {
  meetingId: number;
  teamId: number;
  onMeetingLinkClick: () => void;
}

const ReferencedMeetingLink = ({
  meetingId,
  teamId,
  onMeetingLinkClick,
}: ReferencedMeetingLinkProps) => {
  const { data: meeting, isPending } = useMeetingDetail(meetingId);

  if (isPending) {
    return (
      <li
        aria-hidden="true"
        className="h-10 rounded-xl border border-cool-200 bg-cool-100 motion-safe:animate-pulse"
      />
    );
  }

  if (!meeting) return null;

  return (
    <li>
      <Link
        href={`/teams/${teamId}/meetings/${meeting.meetingId}`}
        replace
        onClick={onMeetingLinkClick}
        className="flex min-h-10 items-center gap-2 rounded-xl border border-cool-200 bg-white px-3 text-[13px] transition-colors hover:border-brand-200 hover:bg-brand-50/40"
      >
        <FileText aria-hidden="true" className="size-4 shrink-0 text-cool-400" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate font-medium text-cool-900">{meeting.title}</span>
        <span className="shrink-0 text-xs text-cool-500">
          {formatMeetingDate(meeting.startedAt ?? meeting.scheduledAt)}
        </span>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-cool-400"
          strokeWidth={1.8}
        />
      </Link>
    </li>
  );
};

interface AssistantChatReferencedMeetingsProps {
  meetingIds: number[];
  teamId: number;
  onMeetingLinkClick: () => void;
}

export const AssistantChatReferencedMeetings = ({
  meetingIds,
  teamId,
  onMeetingLinkClick,
}: AssistantChatReferencedMeetingsProps) => (
  <section aria-label="참고한 회의" className="flex w-full max-w-[94%] flex-col gap-1.5">
    <h3 className="text-[11.5px] leading-none font-semibold text-cool-500">참고한 회의</h3>
    <ul className="flex flex-col gap-1">
      {meetingIds.map((meetingId) => (
        <ReferencedMeetingLink
          key={meetingId}
          meetingId={meetingId}
          teamId={teamId}
          onMeetingLinkClick={onMeetingLinkClick}
        />
      ))}
    </ul>
  </section>
);
