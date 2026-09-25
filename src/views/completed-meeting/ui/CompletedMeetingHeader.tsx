import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib';
import { formatMeetingPeriod } from '../model/format-meeting-period';
import type {
  CompletedMeetingViewerRole,
  CompletedMeetingViewModel,
} from '../model/preview-completed-meeting';
import { CompletedMeetingMoreMenu } from './CompletedMeetingMoreMenu';

interface CompletedMeetingHeaderProps {
  meeting: CompletedMeetingViewModel;
  viewerRole: CompletedMeetingViewerRole;
  isMenuDisabled: boolean;
  onMenuClick: () => void;
}

export const CompletedMeetingHeader = ({
  meeting,
  viewerRole,
  isMenuDisabled,
  onMenuClick,
}: CompletedMeetingHeaderProps) => {
  const isAudioExpired = meeting.audioRemainingDays === null;

  return (
    <div className="flex items-start gap-2 px-5 pt-5 pb-4">
      <button
        type="button"
        aria-label="메뉴 열기"
        disabled={isMenuDisabled}
        onClick={onMenuClick}
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900 disabled:text-cool-400"
      >
        <Menu className="size-5" strokeWidth={2} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold text-cool-900">{meeting.title}</h1>
        <p className="mt-1 text-xs whitespace-nowrap text-cool-500">
          {formatMeetingPeriod(meeting.startedAt, meeting.endedAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] whitespace-nowrap text-cool-500">음성 파일 저장 기한</span>
          <span
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-semibold',
              isAudioExpired ? 'bg-cool-100 text-cool-500' : 'bg-brand-100 text-brand-600',
            )}
          >
            {isAudioExpired ? '만료됨' : `${meeting.audioRemainingDays}일 남음`}
          </span>
        </div>
        <CompletedMeetingMoreMenu
          meetingTitle={meeting.title}
          viewerRole={viewerRole}
          audioRemainingDays={meeting.audioRemainingDays}
        />
      </div>
    </div>
  );
};
