'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMeetingExit } from '@/features/meeting-sse';
import { cn } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import { MeetingMoreMenu } from './MeetingMoreMenu';

interface MeetingControlsProps {
  teamId: string;
  meetingId: string;
  isPreview: boolean;
  isWaiting: boolean;
  isRecorder: boolean;
  isPaused: boolean;
  isDisconnected: boolean;
  isEnding: boolean;
  recorderName: string;
}

export const MeetingControls = ({
  teamId,
  meetingId,
  isPreview,
  isWaiting,
  isRecorder,
  isPaused,
  isDisconnected,
  isEnding,
  recorderName,
}: MeetingControlsProps) => {
  const router = useRouter();
  const { showToast } = useAppToast();
  const { leave } = useMeetingExit(meetingId);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    if (isLeaving) return;

    setIsLeaving(true);
    try {
      await leave();
      router.replace(`/teams/${encodeURIComponent(teamId)}`);
    } catch {
      showToast('회의 나가기에 실패했습니다', 'danger');
      setIsLeaving(false);
    }
  };

  const participantMessage = isEnding
    ? '회의 종료 처리 중입니다'
    : isDisconnected
      ? '서버 연결이 끊어졌습니다'
      : isPaused
        ? recorderName + '님이 녹음을 일시정지했습니다'
        : recorderName + '님이 녹음을 진행 중입니다';

  return (
    <footer className="grid shrink-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 border-t border-cool-200 bg-white px-5 py-3">
      {isWaiting || isRecorder ? (
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <button
            type="button"
            disabled
            className={cn(
              'h-12 rounded-xl px-2 text-sm font-semibold',
              isDisconnected || isEnding
                ? 'border border-cool-200 bg-white text-cool-400'
                : isWaiting || isPaused
                  ? 'bg-brand-600 text-white'
                  : 'border border-cool-200 bg-white text-cool-700',
            )}
          >
            {isWaiting ? '녹음 시작' : isPaused ? '녹음 재개' : '일시 정지'}
          </button>
          <button
            type="button"
            disabled={!isWaiting || isPreview || isLeaving}
            onClick={isWaiting ? handleLeave : undefined}
            className={cn(
              'h-12 rounded-xl px-2 text-sm font-semibold',
              isWaiting
                ? 'border border-cool-200 bg-white text-cool-700'
                : isDisconnected || isEnding
                  ? 'bg-cool-200 text-cool-400'
                  : 'bg-danger text-white',
            )}
          >
            {isWaiting
              ? isLeaving
                ? '나가는 중...'
                : '회의 나가기'
              : isEnding
                ? '종료 중...'
                : '회의 종료'}
          </button>
        </div>
      ) : (
        <p className="flex h-12 min-w-0 items-center justify-center rounded-xl border border-cool-200 bg-cool-50 px-2 text-center text-xs text-cool-700">
          {participantMessage}
        </p>
      )}

      <MeetingMoreMenu
        isRecorder={isRecorder}
        isPreview={isPreview}
        isLeaving={isLeaving}
        onLeave={handleLeave}
      />
    </footer>
  );
};
