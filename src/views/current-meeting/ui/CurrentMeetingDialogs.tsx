import type { CreateMeetingFormValues } from '@/features/meeting';
import { MeetingInfoDialog } from '@/widgets/meeting-info-form';
import { InsufficientCreditDialog } from './InsufficientCreditDialog';
import { MeetingEditNoticeDialog } from './MeetingEditNoticeDialog';
import { MeetingEndedDialog } from './MeetingEndedDialog';
import { RecordingStartDialog } from './RecordingStartDialog';
import { RecordingStartedDialog } from './RecordingStartedDialog';

interface CurrentMeetingDialogsProps {
  isRecordingAcknowledged: boolean;
  isStartDialogOpen: boolean;
  isStartingRecording: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
  onConfirmRecording: () => void;
  onStartDialogOpenChange: (open: boolean) => void;

  isInsufficientCreditDialogOpen: boolean;
  onInsufficientCreditDialogOpenChange: (open: boolean) => void;

  isRecordingStartedNoticeOpen: boolean;
  onRecordingStartedNoticeOpenChange: (open: boolean) => void;

  isMeetingEndedNoticeOpen: boolean;
  onGoToResult: () => void;
  onGoHome: () => void;

  isEditNoticeOpen: boolean;
  onConfirmEditNotice: () => void;
  onEditNoticeOpenChange: (open: boolean) => void;

  isEditFormOpen: boolean;
  editFormInitialValues: CreateMeetingFormValues | null;
  isEditFormSubmitting: boolean;
  editFormSubmitError: string | null;
  onSubmitEditForm: (values: CreateMeetingFormValues) => void;
  onCloseEditForm: () => void;
}

/** 현재 회의 화면에서 상태에 따라 열리는 다이얼로그를 한곳에 모아 둔다. */
export const CurrentMeetingDialogs = ({
  isRecordingAcknowledged,
  isStartDialogOpen,
  isStartingRecording,
  onAcknowledgedChange,
  onConfirmRecording,
  onStartDialogOpenChange,
  isInsufficientCreditDialogOpen,
  onInsufficientCreditDialogOpenChange,
  isRecordingStartedNoticeOpen,
  onRecordingStartedNoticeOpenChange,
  isMeetingEndedNoticeOpen,
  onGoToResult,
  onGoHome,
  isEditNoticeOpen,
  onConfirmEditNotice,
  onEditNoticeOpenChange,
  isEditFormOpen,
  editFormInitialValues,
  isEditFormSubmitting,
  editFormSubmitError,
  onSubmitEditForm,
  onCloseEditForm,
}: CurrentMeetingDialogsProps) => (
  <>
    <RecordingStartDialog
      isAcknowledged={isRecordingAcknowledged}
      isOpen={isStartDialogOpen}
      isStarting={isStartingRecording}
      onAcknowledgedChange={onAcknowledgedChange}
      onConfirm={onConfirmRecording}
      onOpenChange={onStartDialogOpenChange}
    />
    <InsufficientCreditDialog
      isOpen={isInsufficientCreditDialogOpen}
      onOpenChange={onInsufficientCreditDialogOpenChange}
    />
    <RecordingStartedDialog
      isOpen={isRecordingStartedNoticeOpen}
      onOpenChange={onRecordingStartedNoticeOpenChange}
    />
    <MeetingEndedDialog
      isOpen={isMeetingEndedNoticeOpen}
      onConfirm={onGoToResult}
      onGoHome={onGoHome}
    />
    <MeetingEditNoticeDialog
      isOpen={isEditNoticeOpen}
      onConfirm={onConfirmEditNotice}
      onOpenChange={onEditNoticeOpenChange}
    />
    {isEditFormOpen && editFormInitialValues && (
      <MeetingInfoDialog
        initialValues={editFormInitialValues}
        isSubmitting={isEditFormSubmitting}
        submitError={editFormSubmitError}
        onSubmit={onSubmitEditForm}
        onClose={onCloseEditForm}
      />
    )}
  </>
);
