'use client';

import Link from 'next/link';
import { AudioWaveform, ChevronRight, FileText } from 'lucide-react';
import type { MeetingChatCitation } from '@/features/meeting-chat';
import { cn } from '@/shared/lib';
import { useCurrentMeetingContext } from '../model/current-meeting-context';

const citationDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const formatCitationDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '날짜 정보 없음';

  const parts = Object.fromEntries(
    citationDateFormatter
      .formatToParts(date)
      .map(({ type, value: partValue }) => [type, partValue]),
  );

  return `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
};

const getCitationKey = (citation: MeetingChatCitation, index: number) =>
  citation.sourceType === 'transcript'
    ? `transcript-${citation.meetingId}-${citation.segmentId}-${index}`
    : `summary-${citation.meetingId}-${citation.summaryId}-${index}`;

const getCompletedMeetingHref = (teamId: string, citation: MeetingChatCitation) => {
  const meetingPath = `/teams/${encodeURIComponent(teamId)}/meetings/${citation.meetingId}`;

  return citation.sourceType === 'transcript'
    ? `${meetingPath}?tab=transcript&segmentId=${citation.segmentId}`
    : `${meetingPath}?tab=summary`;
};

interface CitationContentProps {
  citation: MeetingChatCitation;
  isCurrentMeeting: boolean;
}

const CitationContent = ({ citation, isCurrentMeeting }: CitationContentProps) => {
  const isTranscript = citation.sourceType === 'transcript';
  const sourceLabel = isTranscript ? '녹취' : '회의 요약';
  const dateLabel = isCurrentMeeting ? '현재 회의' : formatCitationDate(citation.meetingStartedAt);

  return (
    <>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          isTranscript ? 'bg-brand-100 text-brand-600' : 'bg-success-bg text-success',
        )}
      >
        {isTranscript ? (
          <AudioWaveform aria-hidden="true" className="size-5" strokeWidth={2} />
        ) : (
          <FileText aria-hidden="true" className="size-5" strokeWidth={2} />
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-cool-900">
          {citation.meetingTitle}
        </span>
        <span className="mt-0.5 block truncate text-xs text-cool-500">
          {dateLabel} · {sourceLabel}
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-cool-400" strokeWidth={2} />
    </>
  );
};

interface ChatCitationListProps {
  citations: MeetingChatCitation[];
}

export const ChatCitationList = ({ citations }: ChatCitationListProps) => {
  const { meetingId, teamId, navigateToTranscriptSegment } = useCurrentMeetingContext();

  if (citations.length === 0) return null;

  return (
    <section
      aria-label="답변 근거"
      className="mt-3 overflow-hidden rounded-2xl border border-cool-200"
    >
      <h4 className="px-4 py-2.5 text-xs font-semibold text-cool-600">근거 {citations.length}</h4>
      <ul className="divide-y divide-cool-200 border-t border-cool-200">
        {citations.map((citation, index) => {
          const isCurrentTranscript =
            citation.sourceType === 'transcript' && citation.meetingId === meetingId;
          const content = (
            <CitationContent
              citation={citation}
              isCurrentMeeting={citation.meetingId === meetingId}
            />
          );
          const itemClassName =
            'flex w-full items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-cool-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset';

          return (
            <li key={getCitationKey(citation, index)}>
              {isCurrentTranscript ? (
                <button
                  type="button"
                  onClick={() => navigateToTranscriptSegment(citation.segmentId)}
                  className={itemClassName}
                >
                  {content}
                </button>
              ) : (
                <Link href={getCompletedMeetingHref(teamId, citation)} className={itemClassName}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
