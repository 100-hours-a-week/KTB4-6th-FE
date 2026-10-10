'use client';

import { useCurrentMeetingContext } from '../model/current-meeting-context';
import { useCompleteRecordingDialog } from '../model/useCompleteRecordingDialog';
import { useMeetingDelete } from '../model/useMeetingDelete';
import { useMeetingLeave } from '../model/useMeetingLeave';
import { MeetingDeleteDialog } from './MeetingDeleteDialog';
import { MeetingManageNotice } from './MeetingManageNotice';
import { MeetingMoreMenu } from './MeetingMoreMenu';
import { ParticipantStatusMessage } from './ParticipantStatusMessage';
import { RecordingCompleteDialog } from './RecordingCompleteDialog';
import { RecordingControlButtons } from './RecordingControlButtons';

export const MeetingControls = () => {
  const { teamId, meetingId, team, recording, meetingInfoEdit } = useCurrentMeetingContext();
  const {
    meeting,
    canCompleteRecording,
    canStartRecording,
    startBlockedReason,
    canPauseResumeRecording,
    pauseResumeBlockedReason,
    isCompleted,
    isWaiting,
    isRecorder,
    isPaused,
    isDisconnected,
    isEnding,
    isStartingRecording,
    isUpdatingRecordingStatus,
    handleStartRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  } = recording;
  const isMeetingInProgress = !isWaiting && !isCompleted;
  const canDelete = team?.role === 'LEADER';
  const canEditInfo =
    isWaiting && (team?.role === 'LEADER' || team?.teamMemberId === meeting.createdByTeamMemberId);
  const { isLeaving, handleLeave } = useMeetingLeave({
    teamId,
    meetingId: String(meetingId),
  });
  const { isDeleting, isDeleteDialogOpen, setIsDeleteDialogOpen, handleDelete } = useMeetingDelete({
    teamId,
    meetingId: String(meetingId),
    canDelete,
  });
  const { isCompleteDialogOpen, setIsCompleteDialogOpen, handleCompleteRequest, handleComplete } =
    useCompleteRecordingDialog(handleCompleteRecording);

  return (
    <footer className="grid shrink-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-2 border-t border-cool-200 bg-white px-5 py-3">
      {isWaiting || isRecorder ? (
        <RecordingControlButtons
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
          onStartRecording={handleStartRecording}
          onPauseResumeRecording={handlePauseResumeRecording}
          onCompleteRecording={handleCompleteRequest}
          onLeave={handleLeave}
        />
      ) : (
        <ParticipantStatusMessage
          isEnding={isEnding}
          isCompleted={isCompleted}
          isDisconnected={isDisconnected}
          isPaused={isPaused}
          recorderName={meeting.recorderName}
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
          onDelete={() => setIsDeleteDialogOpen(true)}
          onEditInfo={meetingInfoEdit.handleEditInfo}
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
