'use client';

import { cn } from '@/shared/lib';
import type { RecordingBlockedReason } from '../model/blocked-action-toasts';
import { useCompleteRecordingDialog } from '../model/useCompleteRecordingDialog';
import { useMeetingControlActions } from '../model/useMeetingControlActions';
import { MeetingDeleteDialog } from './MeetingDeleteDialog';
import { MeetingMoreMenu } from './MeetingMoreMenu';
import { ParticipantStatusMessage } from './ParticipantStatusMessage';
import { RecordingCompleteDialog } from './RecordingCompleteDialog';
import { RecordingControlButtons } from './RecordingControlButtons';

interface MeetingControlsProps {
  teamId: string;
  meetingId: string;
  isPreview: boolean;
  canDelete: boolean;
  canEditInfo: boolean;
  canCompleteRecording: boolean;
  canStartRecording: boolean;
  startBlockedReason: RecordingBlockedReason | null;
  canPauseResumeRecording: boolean;
  pauseResumeBlockedReason: RecordingBlockedReason | null;
  isMeetingInProgress: boolean;
  isCompleted: boolean;
  isWaiting: boolean;
  isRecorder: boolean;
  isPaused: boolean;
  isDisconnected: boolean;
  isEnding: boolean;
  isStartingRecording: boolean;
  isUpdatingRecordingStatus: boolean;
  onStartRecording: () => void;
  onPauseResumeRecording: () => void;
  onCompleteRecording: () => void;
  onEditInfo: () => void;
  recorderName: string;
}

export const MeetingControls = ({
  teamId,
  meetingId,
  isPreview,
  canDelete,
  canEditInfo,
  canCompleteRecording,
  canStartRecording,
  startBlockedReason,
  canPauseResumeRecording,
  pauseResumeBlockedReason,
  isMeetingInProgress,
  isCompleted,
  isWaiting,
  isRecorder,
  isPaused,
  isDisconnected,
  isEnding,
  isStartingRecording,
  isUpdatingRecordingStatus,
  onStartRecording,
  onPauseResumeRecording,
  onCompleteRecording,
  onEditInfo,
  recorderName,
}: MeetingControlsProps) => {
  const {
    isLeaving,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleLeave,
    handleDelete,
    handleDeleteRequest,
    handleLeaveRequest,
  } = useMeetingControlActions({ teamId, meetingId, canDelete, isMeetingInProgress });
  const { isCompleteDialogOpen, setIsCompleteDialogOpen, handleCompleteRequest, handleComplete } =
    useCompleteRecordingDialog(onCompleteRecording);

  // 진행자는 나가기 항목이 없어서, 삭제 권한도 없으면 더보기 메뉴에 담을 항목이 없다.
  const hasMoreMenu = !isRecorder || canDelete;

  return (
    <footer
      className={cn(
        'grid shrink-0 items-center gap-2 border-t border-cool-200 bg-white px-5 py-3',
        hasMoreMenu ? 'grid-cols-[minmax(0,1fr)_36px]' : 'grid-cols-1',
      )}
    >
      {isWaiting || isRecorder ? (
        <RecordingControlButtons
          isPreview={isPreview}
          isWaiting={isWaiting}
          isPaused={isPaused}
          isCompleted={isCompleted}
          isDisconnected={isDisconnected}
          isEnding={isEnding}
          isLeaving={isLeaving}
          isStartingRecording={isStartingRecording}
          isUpdatingRecordingStatus={isUpdatingRecordingStatus}
          canStartRecording={canStartRecording}
          startBlockedReason={startBlockedReason}
          canPauseResumeRecording={canPauseResumeRecording}
          pauseResumeBlockedReason={pauseResumeBlockedReason}
          canCompleteRecording={canCompleteRecording}
          onStartRecording={onStartRecording}
          onPauseResumeRecording={onPauseResumeRecording}
          onCompleteRecording={handleCompleteRequest}
          onLeave={handleLeave}
        />
      ) : (
        <ParticipantStatusMessage
          isEnding={isEnding}
          isCompleted={isCompleted}
          isDisconnected={isDisconnected}
          isPaused={isPaused}
          recorderName={recorderName}
        />
      )}

      {hasMoreMenu && (
        <MeetingMoreMenu
          canDelete={canDelete}
          canEditInfo={canEditInfo}
          isDeleting={isDeleting}
          isRecorder={isRecorder}
          isPreview={isPreview}
          isLeaving={isLeaving}
          onDelete={handleDeleteRequest}
          onLeave={handleLeaveRequest}
          onEditInfo={onEditInfo}
        />
      )}
      <MeetingDeleteDialog
        isDeleting={isDeleting}
        isOpen={isDeleteDialogOpen}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <RecordingCompleteDialog
        isOpen={isCompleteDialogOpen}
        onConfirm={handleComplete}
        onOpenChange={setIsCompleteDialogOpen}
      />
    </footer>
  );
};
