'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Badge, useAppToast } from '@/shared/ui';
import type { Meeting } from '../model/types';

interface MeetingListItemProps {
  meeting: Meeting;
  teamId: number;
}

export const MeetingListItem = ({ meeting, teamId }: MeetingListItemProps) => {
  const router = useRouter();
  const { showToast } = useAppToast();
  const isInProgress = meeting.status === 'in_progress';
  const isWaiting = meeting.status === 'waiting';
  const isJoinable = isInProgress || isWaiting;

  const handleClick = () => {
    if (isJoinable) {
      router.push(`/teams/${teamId}/meetings/${meeting.id}`);
      return;
    }

    showToast('종료된 회의입니다', 'danger');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors',
        isInProgress
          ? 'border-cool-100 border-l-4 border-l-danger hover:bg-danger-bg/40'
          : 'border-cool-100 hover:bg-cool-50',
      )}
    >
      {isInProgress ? (
        <span aria-hidden="true" className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger/60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
        </span>
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cool-50 text-cool-400">
          <FileText className="size-4" strokeWidth={2} />
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'truncate text-[15px] font-semibold',
              isInProgress ? 'text-cool-900' : 'text-cool-700',
            )}
          >
            {meeting.title}
          </span>
          <Badge variant={isInProgress ? 'danger' : 'success'}>
            {isInProgress ? '진행 중' : isWaiting ? '대기 중' : '완료'}
          </Badge>
        </span>
        <span className="truncate text-xs text-cool-500">
          {isInProgress || isWaiting ? meeting.scheduledAtLabel : meeting.dateLabel}
        </span>
      </span>

      {!isInProgress && !isWaiting ? (
        <span className="shrink-0 text-sm font-medium text-cool-600">{meeting.durationLabel}</span>
      ) : null}
    </button>
  );
};
