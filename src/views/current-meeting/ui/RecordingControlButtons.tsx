'use client';

import { cn } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import {
  RECORDING_BLOCKED_TOASTS,
  type RecordingBlockedReason,
} from '../model/blocked-action-toasts';

interface RecordingControlButtonsProps {
  isPreview: boolean;
  isWaiting: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isDisconnected: boolean;
  isEnding: boolean;
  isLeaving: boolean;
  isStartingRecording: boolean;
  isUpdatingRecordingStatus: boolean;
  canStartRecording: boolean;
  startBlockedReason: RecordingBlockedReason | null;
  canPauseResumeRecording: boolean;
  pauseResumeBlockedReason: RecordingBlockedReason | null;
  canCompleteRecording: boolean;
  onStartRecording: () => void;
  onPauseResumeRecording: () => void;
  onCompleteRecording: () => void;
  onLeave: () => void;
}

/** 대기 중에는 녹음 시작·회의 나가기, 녹음 중에는 일시정지·재개·회의 종료 버튼을 보여준다. */
export const RecordingControlButtons = ({
  isPreview,
  isWaiting,
  isPaused,
  isCompleted,
  isDisconnected,
  isEnding,
  isLeaving,
  isStartingRecording,
  isUpdatingRecordingStatus,
  canStartRecording,
  startBlockedReason,
  canPauseResumeRecording,
  pauseResumeBlockedReason,
  canCompleteRecording,
  onStartRecording,
  onPauseResumeRecording,
  onCompleteRecording,
  onLeave,
}: RecordingControlButtonsProps) => {
  const { showToast } = useAppToast();
  const isPrimaryBlocked = isWaiting ? !canStartRecording : !canPauseResumeRecording;
  const primaryBlockedReason = isWaiting ? startBlockedReason : pauseResumeBlockedReason;

  // 막힌 버튼도 눌리게 두고, 사유가 있으면 토스트로 알린다.
  const handlePrimaryClick = () => {
    if (isPrimaryBlocked) {
      if (primaryBlockedReason) {
        const { message, variant } = RECORDING_BLOCKED_TOASTS[primaryBlockedReason];
        showToast(message, variant);
      }
      return;
    }

    if (isWaiting) onStartRecording();
    else onPauseResumeRecording();
  };

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2">
      <button
        type="button"
        aria-disabled={isPrimaryBlocked}
        onClick={handlePrimaryClick}
        className={cn(
          'h-12 rounded-xl px-2 text-sm font-semibold',
          isPrimaryBlocked
            ? 'border border-cool-200 bg-white text-cool-400'
            : isWaiting || isPaused
              ? 'bg-brand-600 text-white'
              : 'border border-cool-200 bg-white text-cool-700',
        )}
      >
        {isWaiting
          ? isStartingRecording
            ? '시작 중...'
            : '녹음 시작'
          : isUpdatingRecordingStatus
            ? '처리 중...'
            : isPaused
              ? '녹음 재개'
              : '일시 정지'}
      </button>
      <button
        type="button"
        disabled={isWaiting ? isPreview || isLeaving || isStartingRecording : !canCompleteRecording}
        onClick={isWaiting ? onLeave : onCompleteRecording}
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
            : isCompleted
              ? '종료됨'
              : '회의 종료'}
      </button>
    </div>
  );
};
