import { ChevronDown, Headphones, LoaderCircle, Menu, MoreVertical } from 'lucide-react';
import { cn } from '@/shared/lib';
import { getMeetingPreview } from '../model/preview-meeting';
import { MeetingTranscript } from './MeetingTranscript';

interface CurrentMeetingPageProps {
  previewState?: string;
}

const formatElapsed = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');

export const CurrentMeetingPage = ({ previewState }: CurrentMeetingPageProps) => {
  const meeting = getMeetingPreview(previewState);
  const isWaiting = meeting.recordingStatus === 'waiting';
  const isPaused = meeting.recordingStatus === 'paused';
  const isEnding = meeting.recordingStatus === 'ending';
  const isDisconnected = meeting.connectionStatus === 'disconnected';
  const isRecording = meeting.recordingStatus === 'recording' && !isDisconnected;
  const isOvertime = meeting.elapsedSeconds > meeting.targetMinutes * 60;

  const statusLabel = isDisconnected
    ? '연결 끊김'
    : isEnding
      ? '종료 중'
      : isPaused
        ? '일시정지'
        : isRecording
          ? '녹음 중'
          : '대기 중';

  return (
    <div className="relative flex h-dvh min-h-[844px] flex-1 flex-col bg-cool-50">
      <header className="shrink-0 border-b border-cool-200 bg-white px-5 pt-5 pb-4">
        <div className="flex h-10 items-center gap-2">
          <button
            type="button"
            aria-label="메뉴 열기"
            disabled
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-cool-900"
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

      {isWaiting ? (
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Headphones aria-hidden="true" className="size-7" strokeWidth={2.2} />
          </div>
          <p className="mt-5 text-base font-bold text-cool-900">
            녹음 시작을 눌러 회의를 기록해주세요
          </p>
          <p className="mt-4 text-sm leading-6 text-cool-600">
            참여자 누구나 녹음을 시작할 수 있어요.
            <br />
            시작한 사람이 일시정지와 종료를 관리합니다.
          </p>
        </main>
      ) : (
        <MeetingTranscript
          segments={meeting.transcripts}
          isRecording={isRecording}
          isPaused={isPaused}
        />
      )}

      <footer className="grid shrink-0 grid-cols-[1fr_1fr_36px] items-center gap-2 border-t border-cool-200 bg-white px-5 py-3">
        <button
          type="button"
          disabled
          className={cn(
            'h-12 rounded-xl px-2 text-sm font-semibold',
            isWaiting || isPaused
              ? 'bg-brand-600 text-white'
              : isDisconnected || isEnding
                ? 'border border-cool-200 bg-white text-cool-400'
                : 'border border-cool-200 bg-white text-cool-700',
          )}
        >
          {isWaiting ? '녹음 시작' : isPaused ? '녹음 재개' : '일시 정지'}
        </button>
        <button
          type="button"
          disabled
          className={cn(
            'h-12 rounded-xl px-2 text-sm font-semibold',
            isWaiting
              ? 'border border-cool-200 bg-white text-cool-700'
              : isDisconnected || isEnding
                ? 'bg-cool-200 text-cool-400'
                : 'bg-danger text-white',
          )}
        >
          {isWaiting ? '회의 나가기' : isEnding ? '종료 중...' : '회의 종료'}
        </button>
        <button
          type="button"
          aria-label="더 보기"
          disabled
          className="flex size-9 items-center justify-center text-cool-600"
        >
          <MoreVertical className="size-5" strokeWidth={2} />
        </button>
      </footer>

      {isEnding && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-7 text-brand-600 motion-safe:animate-spin"
            strokeWidth={2}
          />
          <p className="mt-4 text-base font-bold text-cool-900">회의를 종료하고 있습니다</p>
          <p className="mt-3 text-sm text-cool-600">녹음과 녹취 내용을 저장하는 중이에요</p>
        </div>
      )}
    </div>
  );
};
