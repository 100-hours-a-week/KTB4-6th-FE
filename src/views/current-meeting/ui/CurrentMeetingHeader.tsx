import { ChevronDown, Menu } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { CurrentMeetingViewModel } from '../model/preview-meeting';

interface CurrentMeetingHeaderProps {
  meeting: CurrentMeetingViewModel;
  isMenuDisabled: boolean;
  isWaiting: boolean;
  isPaused: boolean;
  isEnding: boolean;
  isDisconnected: boolean;
  isRecording: boolean;
  isCompleted: boolean;
  onMenuClick: () => void;
}

const formatElapsed = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

export const CurrentMeetingHeader = ({
  meeting,
  isMenuDisabled,
  isWaiting,
  isPaused,
  isEnding,
  isDisconnected,
  isRecording,
  isCompleted,
  onMenuClick,
}: CurrentMeetingHeaderProps) => {
  const isOvertime = meeting.elapsedSeconds > meeting.targetMinutes * 60;
  const statusLabel = isCompleted
    ? '종료됨'
    : isDisconnected
      ? '연결 끊김'
      : isEnding
        ? '종료 중'
        : isPaused
          ? '일시정지'
          : isRecording
            ? '녹음 중'
            : '대기 중';

  return (
    <header className="shrink-0 border-b border-cool-200 bg-white px-5 pt-5 pb-4">
      <div className="flex h-10 items-center gap-2">
        <button
          type="button"
          aria-label="메뉴 열기"
          disabled={isMenuDisabled}
          onClick={onMenuClick}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900 disabled:text-cool-400"
        >
          <Menu className="size-5" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-cool-900">현재 회의</h1>
        <span
          className={cn(
            'ml-auto flex items-center gap-1.5 whitespace-nowrap text-xs',
            isDisconnected ? 'text-danger' : 'text-cool-600',
          )}
        >
          <span
            aria-hidden="true"
            className={cn('size-2 rounded-full', isDisconnected ? 'bg-danger' : 'bg-success')}
          />
          {isDisconnected ? '서버 연결 끊김' : '서버 연결 됨'}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-cool-900">{meeting.title}</h2>
          <p className="mt-1 text-sm text-cool-500">
            참여자 {meeting.participantCount} / {meeting.participantLimit}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold',
                isDisconnected || isRecording
                  ? 'bg-danger-bg text-danger'
                  : isWaiting
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-cool-100 text-cool-700',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-1.5',
                  isPaused || isEnding ? 'rounded-[1px] bg-cool-600' : 'rounded-full',
                  isDisconnected || isRecording ? 'bg-danger' : isWaiting ? 'bg-brand-600' : '',
                )}
              />
              {statusLabel}
            </span>
            <ChevronDown aria-hidden="true" className="size-5 text-cool-600" strokeWidth={2} />
          </div>
          {!isWaiting && (
            <span
              className={cn(
                'font-mono text-xs font-semibold whitespace-nowrap tabular-nums',
                isOvertime ? 'text-amber-700' : 'text-cool-600',
              )}
            >
              {formatElapsed(meeting.elapsedSeconds)} / {meeting.targetMinutes}분
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
