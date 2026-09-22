'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMeetingExit } from '@/features/meeting-sse';
import { getTeamDetail } from '@/features/team-management';
import { cn } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import { MeetingDeleteDialog } from './MeetingDeleteDialog';
import { MeetingMoreMenu } from './MeetingMoreMenu';

interface MeetingControlsProps {
  teamId: string;
  meetingId: string;
  isPreview: boolean;
  canCompleteRecording: boolean;
  canStartRecording: boolean;
  isCompleted: boolean;
  isWaiting: boolean;
  isRecorder: boolean;
  isPaused: boolean;
  isDisconnected: boolean;
  isEnding: boolean;
  isStartingRecording: boolean;
  onStartRecording: () => void;
  onCompleteRecording: () => void;
  recorderName: string;
}

export const MeetingControls = ({
  teamId,
  meetingId,
  isPreview,
  canCompleteRecording,
  canStartRecording,
  isCompleted,
  isWaiting,
  isRecorder,
  isPaused,
  isDisconnected,
  isEnding,
  isStartingRecording,
  onStartRecording,
  onCompleteRecording,
  recorderName,
}: MeetingControlsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { leave, remove } = useMeetingExit(meetingId);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const numericTeamId = Number(teamId);
  const { data: team } = useQuery({
    queryKey: ['teams', numericTeamId, 'detail'],
    queryFn: () => getTeamDetail(numericTeamId),
    enabled: !isPreview && Number.isSafeInteger(numericTeamId) && numericTeamId > 0,
  });
  const canDelete = !isPreview && team?.role === 'LEADER';

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

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await remove();
      void queryClient.invalidateQueries({ queryKey: ['home'] });
      router.replace(`/teams/${encodeURIComponent(teamId)}`);
    } catch {
      showToast('회의 삭제에 실패했습니다', 'danger');
      setIsDeleting(false);
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
            disabled={!canStartRecording}
            onClick={onStartRecording}
            className={cn(
              'h-12 rounded-xl px-2 text-sm font-semibold',
              isDisconnected || isEnding
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
              : isPaused
                ? '녹음 재개'
                : '일시 정지'}
          </button>
          <button
            type="button"
            disabled={isWaiting ? isPreview || isLeaving : !canCompleteRecording}
            onClick={isWaiting ? handleLeave : onCompleteRecording}
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
      ) : (
        <p className="flex h-12 min-w-0 items-center justify-center rounded-xl border border-cool-200 bg-cool-50 px-2 text-center text-xs text-cool-700">
          {participantMessage}
        </p>
      )}

      <MeetingMoreMenu
        canDelete={canDelete}
        isDeleting={isDeleting}
        isRecorder={isRecorder}
        isPreview={isPreview}
        isLeaving={isLeaving}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onLeave={handleLeave}
      />
      <MeetingDeleteDialog
        isDeleting={isDeleting}
        isOpen={isDeleteDialogOpen}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </footer>
  );
};
