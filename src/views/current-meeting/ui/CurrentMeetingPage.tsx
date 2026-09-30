'use client';

import { useState, type ReactNode } from 'react';
import { useMeetingDeletedRedirect } from '@/features/home';
import { MeetingSseConnection } from '@/features/meeting-sse';
import { useTeamDetail, useTeamMembers } from '@/features/team-management';
import { useBeforeUnloadWarning, useWakeLock } from '@/shared/lib';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { useCurrentMeetingRecording } from '../model/useCurrentMeetingRecording';
import { useMeetingEndedNotice } from '../model/useMeetingEndedNotice';
import { useMeetingInfoEdit } from '../model/useMeetingInfoEdit';
import { useRecordingObjectLostAutoEnd } from '../model/useRecordingObjectLostAutoEnd';
import { useRecordingStartedNotice } from '../model/useRecordingStartedNotice';
import { useRecordingStatusSync } from '../model/useRecordingStatusSync';
import { CurrentMeetingDialogs } from './CurrentMeetingDialogs';
import { CurrentMeetingHeader } from './CurrentMeetingHeader';
import { CurrentMeetingLoadingState } from './CurrentMeetingLoadingState';
import { MeetingControls } from './MeetingControls';
import { MeetingEndingOverlay } from './MeetingEndingOverlay';
import { MeetingTranscript } from './MeetingTranscript';
import { RecordingObjectLostOverlay } from './RecordingObjectLostOverlay';
import { WaitingForRecordingNotice } from './WaitingForRecordingNotice';

interface CurrentMeetingPageProps {
  teamId: string;
  meetingId: number;
  previewState?: string;
  previewRole?: 'recorder' | 'participant';
  /** 회의가 종료 상태이면 현재 회의 대신 보여줄 화면 (views끼리는 import할 수 없어 라우트가 넘긴다) */
  completedView?: ReactNode;
}

export const CurrentMeetingPage = ({
  teamId,
  meetingId,
  previewState,
  previewRole = 'recorder',
  completedView,
}: CurrentMeetingPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const numericTeamId = Number(teamId);
  const isPreview = previewState !== undefined;
  const { data: team } = useTeamDetail(numericTeamId, {
    isEnabled: !isPreview && Number.isSafeInteger(numericTeamId) && numericTeamId > 0,
  });
  const { data: teamMembers } = useTeamMembers(numericTeamId, {
    isEnabled: !isPreview && Number.isSafeInteger(numericTeamId) && numericTeamId > 0,
  });
  const {
    meeting,
    isMeetingPending,
    isWaiting,
    isPaused,
    isEnding,
    connectionStatus,
    isDisconnected,
    isRecording,
    isRecorder,
    isCompleted,
    isServerCompleted,
    isStartDialogOpen,
    isRecordingAcknowledged,
    isInsufficientCreditDialogOpen,
    isStartingRecording,
    isUpdatingRecordingStatus,
    canStartRecording,
    startBlockedReason,
    canPauseResumeRecording,
    pauseResumeBlockedReason,
    canCompleteRecording,
    setIsRecordingAcknowledged,
    setIsInsufficientCreditDialogOpen,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  } = useCurrentMeetingRecording({
    teamId,
    meetingId,
    previewState,
    previewRole,
    myTeamMemberId: team?.teamMemberId ?? null,
  });
  useRecordingStatusSync({ meetingId, isPreview });
  const { isMeetingEndedNoticeOpen, goToResult, goHome } = useMeetingEndedNotice({
    teamId,
    meetingId,
    isPreview,
    isMeetingLoaded: meeting !== null,
    hasCompleted: isCompleted,
  });
  const redirectAfterMeetingDeleted = useMeetingDeletedRedirect(teamId);
  const { isRecordingStartedNoticeOpen, setIsRecordingStartedNoticeOpen } =
    useRecordingStartedNotice({ meetingId, isPreview });
  const {
    isEditNoticeOpen,
    isEditFormOpen,
    editFormInitialValues,
    isSubmitting: isEditFormSubmitting,
    submitError: editFormSubmitError,
    setIsEditNoticeOpen,
    handleEditInfo,
    handleConfirmEditNotice,
    handleSubmitEditForm,
    handleCloseEditForm,
  } = useMeetingInfoEdit({ meetingId, meeting });
  const { isOpen: isRecordingObjectLostNoticeOpen } = useRecordingObjectLostAutoEnd({
    isPreview,
    isRecorder,
    isActivelyRecording: isRecording || isPaused,
    isCompleted,
  });
  // 녹음자의 화면이 꺼져서 녹음 객체가 소실되는 걸 막는다.
  useWakeLock(!isPreview && isRecorder && (isRecording || isPaused));
  // 녹음자가 실수로 새로고침·탭을 닫아 녹음 객체를 잃는 걸 막는다.
  useBeforeUnloadWarning(!isPreview && isRecorder && (isRecording || isPaused));

  // 종료 안내 모달에서 이동을 고르기 전에는 현재 회의 화면을 유지한다.
  if (isServerCompleted && completedView && !isMeetingEndedNoticeOpen) return completedView;

  if (!meeting) {
    return <CurrentMeetingLoadingState isPending={isMeetingPending} />;
  }

  return (
    <div className="relative flex h-dvh min-h-[844px] flex-col bg-cool-50">
      {!isPreview && !isCompleted && (
        <MeetingSseConnection
          meetingId={String(meetingId)}
          onMeetingDeleted={redirectAfterMeetingDeleted}
        />
      )}
      <CurrentMeetingHeader
        meeting={meeting}
        teamMemberCount={teamMembers?.length ?? null}
        isMenuDisabled={!team}
        isWaiting={isWaiting}
        isPaused={isPaused}
        isEnding={isEnding}
        connectionStatus={connectionStatus}
        isRecording={isRecording}
        isCompleted={isCompleted}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      {isWaiting ? (
        <WaitingForRecordingNotice />
      ) : (
        <MeetingTranscript
          segments={meeting.transcripts}
          isRecording={isRecording}
          isPaused={isPaused}
        />
      )}

      <MeetingControls
        teamId={teamId}
        meetingId={String(meetingId)}
        isPreview={isPreview}
        canDelete={!isPreview && team?.role === 'LEADER'}
        canEditInfo={
          isWaiting &&
          !isPreview &&
          (team?.role === 'LEADER' || team?.teamMemberId === meeting.createdByTeamMemberId)
        }
        onEditInfo={handleEditInfo}
        isWaiting={isWaiting}
        isRecorder={isRecorder}
        isPaused={isPaused}
        isDisconnected={isDisconnected}
        isEnding={isEnding}
        isStartingRecording={isStartingRecording}
        isUpdatingRecordingStatus={isUpdatingRecordingStatus}
        canStartRecording={canStartRecording}
        startBlockedReason={startBlockedReason}
        onStartRecording={handleStartRecording}
        canPauseResumeRecording={canPauseResumeRecording}
        pauseResumeBlockedReason={pauseResumeBlockedReason}
        isMeetingInProgress={!isWaiting && !isCompleted}
        onPauseResumeRecording={handlePauseResumeRecording}
        canCompleteRecording={canCompleteRecording}
        isCompleted={isCompleted}
        onCompleteRecording={handleCompleteRecording}
        recorderName={meeting.recorderName}
      />

      <CurrentMeetingDialogs
        isRecordingAcknowledged={isRecordingAcknowledged}
        isStartDialogOpen={isStartDialogOpen}
        isStartingRecording={isStartingRecording}
        onAcknowledgedChange={setIsRecordingAcknowledged}
        onConfirmRecording={handleConfirmRecording}
        onStartDialogOpenChange={handleStartDialogOpenChange}
        isInsufficientCreditDialogOpen={isInsufficientCreditDialogOpen}
        onInsufficientCreditDialogOpenChange={setIsInsufficientCreditDialogOpen}
        isRecordingStartedNoticeOpen={isRecordingStartedNoticeOpen}
        onRecordingStartedNoticeOpenChange={setIsRecordingStartedNoticeOpen}
        isMeetingEndedNoticeOpen={isMeetingEndedNoticeOpen}
        onGoToResult={goToResult}
        onGoHome={goHome}
        isEditNoticeOpen={isEditNoticeOpen}
        onConfirmEditNotice={handleConfirmEditNotice}
        onEditNoticeOpenChange={setIsEditNoticeOpen}
        isEditFormOpen={isEditFormOpen}
        editFormInitialValues={editFormInitialValues}
        isEditFormSubmitting={isEditFormSubmitting}
        editFormSubmitError={editFormSubmitError}
        onSubmitEditForm={handleSubmitEditForm}
        onCloseEditForm={handleCloseEditForm}
      />

      {team && (
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          teamId={numericTeamId}
          teamName={team.name}
        />
      )}

      {isEnding && <MeetingEndingOverlay />}
      {isRecordingObjectLostNoticeOpen && <RecordingObjectLostOverlay />}
    </div>
  );
};
