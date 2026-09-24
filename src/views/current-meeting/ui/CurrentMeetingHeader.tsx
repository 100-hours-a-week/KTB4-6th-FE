'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { CurrentMeetingViewModel } from '../model/preview-meeting';
import type { CurrentMeetingConnectionStatus } from '../model/useCurrentMeetingRecordingSession';

interface CurrentMeetingHeaderProps {
  meeting: CurrentMeetingViewModel;
  isMenuDisabled: boolean;
  isWaiting: boolean;
  isPaused: boolean;
  isEnding: boolean;
  connectionStatus: CurrentMeetingConnectionStatus;
  isRecording: boolean;
  isCompleted: boolean;
  onMenuClick: () => void;
}

const MEETING_INFO_PANEL_ID = 'current-meeting-info';

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
  connectionStatus,
  isRecording,
  isCompleted,
  onMenuClick,
}: CurrentMeetingHeaderProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isDisconnected = connectionStatus === 'error';
  const isOvertime = meeting.elapsedSeconds > meeting.targetMinutes * 60;
  const connectionLabel =
    connectionStatus === 'connecting'
      ? '실시간 연결 중'
      : connectionStatus === 'connected'
        ? '실시간 연결됨'
        : '실시간 연결 오류';
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
            connectionStatus === 'error' ? 'text-danger' : 'text-cool-600',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-2 rounded-full',
              connectionStatus === 'connecting' && 'bg-brand-600 motion-safe:animate-pulse',
              connectionStatus === 'connected' && 'bg-success',
              connectionStatus === 'error' && 'bg-danger',
            )}
          />
          {connectionLabel}
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
            <button
              type="button"
              aria-controls={MEETING_INFO_PANEL_ID}
              aria-expanded={isInfoOpen}
              aria-label={isInfoOpen ? '회의 정보 접기' : '회의 정보 펼치기'}
              onClick={() => setIsInfoOpen((open) => !open)}
              className="-mr-1.5 flex size-8 items-center justify-center rounded-full text-cool-600 transition-colors hover:bg-cool-100"
            >
              {isInfoOpen ? (
                <ChevronUp aria-hidden="true" className="size-5" strokeWidth={2} />
              ) : (
                <ChevronDown aria-hidden="true" className="size-5" strokeWidth={2} />
              )}
            </button>
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

      {isInfoOpen && (
        <dl
          id={MEETING_INFO_PANEL_ID}
          className="motion-safe:animate-in motion-safe:fade-in mt-4 flex max-h-[40dvh] flex-col gap-3 overflow-y-auto border-t border-cool-100 pt-4 text-sm"
        >
          <div className="flex items-baseline gap-3">
            <dt className="shrink-0 font-semibold text-cool-900">회의 목표 시간</dt>
            <dd className="text-cool-700">{meeting.targetMinutes}분</dd>
          </div>
          <div>
            <dt className="font-semibold text-cool-900">회의 목적</dt>
            <dd className="mt-1 leading-6 break-words text-cool-700">{meeting.purpose}</dd>
          </div>
          <div>
            <dt className="font-semibold text-cool-900">비고</dt>
            <dd className="mt-1 leading-6 break-words text-cool-700">
              {meeting.note || <span className="text-cool-400">없음</span>}
            </dd>
          </div>
        </dl>
      )}
    </header>
  );
};
