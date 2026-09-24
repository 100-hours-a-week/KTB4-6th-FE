'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Headphones, LoaderCircle } from 'lucide-react';
import { MeetingSseConnection } from '@/features/meeting-sse';
import { getTeamDetail } from '@/features/team-management';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import { useCurrentMeetingRecording } from '../model/useCurrentMeetingRecording';
import { CurrentMeetingHeader } from './CurrentMeetingHeader';
import { MeetingControls } from './MeetingControls';
import { MeetingTranscript } from './MeetingTranscript';
import { RecordingStartDialog } from './RecordingStartDialog';

interface CurrentMeetingPageProps {
  teamId: string;
  meetingId: number;
  previewState?: string;
  previewRole?: 'recorder' | 'participant';
}

export const CurrentMeetingPage = ({
  teamId,
  meetingId,
  previewState,
  previewRole = 'recorder',
}: CurrentMeetingPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const numericTeamId = Number(teamId);
  const isPreview = previewState !== undefined;
  const { data: team } = useQuery({
    queryKey: ['teams', numericTeamId, 'detail'],
    queryFn: () => getTeamDetail(numericTeamId),
    enabled: !isPreview && Number.isSafeInteger(numericTeamId) && numericTeamId > 0,
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
    isStartDialogOpen,
    isRecordingAcknowledged,
    isStartingRecording,
    isUpdatingRecordingStatus,
    canStartRecording,
    startBlockedReason,
    canPauseResumeRecording,
    pauseResumeBlockedReason,
    canCompleteRecording,
    setIsRecordingAcknowledged,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  } = useCurrentMeetingRecording({ teamId, meetingId, previewState, previewRole });

  if (!meeting) {
    return (
      <div className="flex h-dvh min-h-[844px] flex-1 items-center justify-center bg-cool-50 px-6 text-center">
        <div>
          {isMeetingPending && (
            <LoaderCircle
              aria-hidden="true"
              className="mx-auto size-7 text-brand-600 motion-safe:animate-spin"
              strokeWidth={2}
            />
          )}
          <p className="mt-4 text-sm text-cool-600">
            {isMeetingPending ? '회의 정보를 불러오는 중입니다' : '회의 정보를 불러오지 못했습니다'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh min-h-[844px] flex-1 flex-col bg-cool-50">
      {!isPreview && !isCompleted && (
        <MeetingSseConnection meetingId={String(meetingId)} teamId={teamId} />
      )}
      <CurrentMeetingHeader
        meeting={meeting}
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
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Headphones aria-hidden="true" className="size-7" strokeWidth={2.2} />
          </div>
          <p className="mt-5 text-base font-bold text-cool-900">
            녹음 시작을 눌러 회의를 기록해주세요
          </p>
          <p className="mt-4 text-sm leading-6 text-cool-600">
            참여자 누구나 녹음을 시작할 수 있어요.
            <br />
            시작한 사람이 일시정지와 종료를 관리합니다.
          </p>
        </main>
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

      <RecordingStartDialog
        isAcknowledged={isRecordingAcknowledged}
        isOpen={isStartDialogOpen}
        isStarting={isStartingRecording}
        onAcknowledgedChange={setIsRecordingAcknowledged}
        onConfirm={handleConfirmRecording}
        onOpenChange={handleStartDialogOpenChange}
      />

      {team && (
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          teamId={numericTeamId}
          teamName={team.name}
        />
      )}

      {isEnding && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 px-6 text-center"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-7 text-brand-600 motion-safe:animate-spin"
            strokeWidth={2}
          />
          <p className="mt-4 text-base font-bold text-cool-900">회의를 종료하고 있습니다</p>
          <p className="mt-3 text-sm text-cool-600">녹음과 녹취 내용을 저장하는 중이에요</p>
        </div>
      )}
    </div>
  );
};
