'use client';

import type { RecordingBlockedReason } from '../model/blocked-action-toasts';
import { useCompleteRecordingDialog } from '../model/useCompleteRecordingDialog';
import { useMeetingDelete } from '../model/useMeetingDelete';
import { useMeetingLeave } from '../model/useMeetingLeave';
import { MeetingDeleteDialog } from './MeetingDeleteDialog';
import { MeetingManageNotice } from './MeetingManageNotice';
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
  const { isLeaving, handleLeave } = useMeetingLeave({ teamId, meetingId });
  const { isDeleting, isDeleteDialogOpen, setIsDeleteDialogOpen, handleDelete } = useMeetingDelete({
    teamId,
    meetingId,
    canDelete,
  });
  const { isCompleteDialogOpen, setIsCompleteDialogOpen, handleCompleteRequest, handleComplete } =
    useCompleteRecordingDialog(onCompleteRecording);

  return (
    <footer className="grid shrink-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 border-t border-cool-200 bg-white px-5 py-3">
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

      {isMeetingInProgress && !isRecorder ? (
        <MeetingManageNotice />
      ) : (
        <MeetingMoreMenu
          canDelete={canDelete}
          canEditInfo={canEditInfo}
          isMeetingInProgress={isMeetingInProgress}
          isDeleting={isDeleting}
          isRecorder={isRecorder}
          isPreview={isPreview}
          isLeaving={isLeaving}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onLeave={handleLeave}
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
