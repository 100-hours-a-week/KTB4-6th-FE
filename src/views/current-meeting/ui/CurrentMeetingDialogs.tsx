import { MeetingInfoDialog } from '@/widgets/meeting-info-form';
import { useCurrentMeetingContext } from '../model/current-meeting-context';
import { InsufficientCreditDialog } from './InsufficientCreditDialog';
import { MeetingEditNoticeDialog } from './MeetingEditNoticeDialog';
import { MeetingEndedDialog } from './MeetingEndedDialog';
import { RecordingStartDialog } from './RecordingStartDialog';
import { RecordingStartedDialog } from './RecordingStartedDialog';

export const CurrentMeetingDialogs = () => {
  const { recording, meetingEndedNotice, meetingInfoEdit, recordingStartedNotice } =
    useCurrentMeetingContext();

  return (
    <>
      <RecordingStartDialog
        isAcknowledged={recording.isRecordingAcknowledged}
        isOpen={recording.isStartDialogOpen}
        isStarting={recording.isStartingRecording}
        onAcknowledgedChange={recording.setIsRecordingAcknowledged}
        onConfirm={recording.handleConfirmRecording}
        onOpenChange={recording.handleStartDialogOpenChange}
      />
      <InsufficientCreditDialog
        isOpen={recording.isInsufficientCreditDialogOpen}
        onOpenChange={recording.setIsInsufficientCreditDialogOpen}
      />
      <RecordingStartedDialog
        isOpen={recordingStartedNotice.isRecordingStartedNoticeOpen}
        onOpenChange={recordingStartedNotice.setIsRecordingStartedNoticeOpen}
      />
      <MeetingEndedDialog
        isOpen={meetingEndedNotice.isMeetingEndedNoticeOpen}
        onConfirm={meetingEndedNotice.goToResult}
        onGoHome={meetingEndedNotice.goHome}
      />
      <MeetingEditNoticeDialog
        isOpen={meetingInfoEdit.isEditNoticeOpen}
        onConfirm={meetingInfoEdit.handleConfirmEditNotice}
        onOpenChange={meetingInfoEdit.setIsEditNoticeOpen}
      />
      {meetingInfoEdit.isEditFormOpen && meetingInfoEdit.editFormInitialValues && (
        <MeetingInfoDialog
          initialValues={meetingInfoEdit.editFormInitialValues}
          isSubmitting={meetingInfoEdit.isSubmitting}
          submitError={meetingInfoEdit.submitError}
          onSubmit={meetingInfoEdit.handleSubmitEditForm}
          onClose={meetingInfoEdit.handleCloseEditForm}
        />
      )}
    </>
  );
};
