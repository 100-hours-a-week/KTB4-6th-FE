'use client';

import { useState, type ReactNode } from 'react';
import { useMeetingDeletedRedirect } from '@/features/home';
import { MeetingSseConnection } from '@/features/meeting-sse';
import { useTeamDetail, useTeamMembers } from '@/features/team-management';
import { useBeforeUnloadWarning, useWakeLock } from '@/shared/lib';
import { NavigationSidebar } from '@/widgets/navigation-sidebar';
import {
  CurrentMeetingProvider,
  type CurrentMeetingContextValue,
} from '../model/current-meeting-context';
import { useCurrentMeetingRecording } from '../model/useCurrentMeetingRecording';
import { useMeetingEndedNotice } from '../model/useMeetingEndedNotice';
import { useMeetingInfoEdit } from '../model/useMeetingInfoEdit';
import { useRecordingObjectLostAutoEnd } from '../model/useRecordingObjectLostAutoEnd';
import { useRecordingStartedNotice } from '../model/useRecordingStartedNotice';
import { useRecordingStatusSync } from '../model/useRecordingStatusSync';
import { CurrentMeetingDialogs } from './CurrentMeetingDialogs';
import { CurrentMeetingHeader } from './CurrentMeetingHeader';
import { CurrentMeetingLoadingState } from './CurrentMeetingLoadingState';
import { CurrentMeetingTabs, type CurrentMeetingTab } from './CurrentMeetingTabs';
import { MeetingChat } from './MeetingChat';
import { MeetingControls } from './MeetingControls';
import { MeetingEndingOverlay } from './MeetingEndingOverlay';
import { MeetingTranscript } from './MeetingTranscript';
import { RecordingObjectLostOverlay } from './RecordingObjectLostOverlay';
import { WaitingForRecordingNotice } from './WaitingForRecordingNotice';

interface CurrentMeetingPageProps {
  teamId: string;
  meetingId: number;
  completedView?: ReactNode;
}

export const CurrentMeetingPage = ({
  teamId,
  meetingId,
  completedView,
}: CurrentMeetingPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CurrentMeetingTab>('transcript');
  const numericTeamId = Number(teamId);
  const isValidTeamId = Number.isSafeInteger(numericTeamId) && numericTeamId > 0;
  const { data: team } = useTeamDetail(numericTeamId, {
    isEnabled: isValidTeamId,
  });
  const { data: teamMembers } = useTeamMembers(numericTeamId, {
    isEnabled: isValidTeamId,
  });
  const recording = useCurrentMeetingRecording({
    teamId,
    meetingId,
    myTeamMemberId: team?.teamMemberId ?? null,
  });
  useRecordingStatusSync(meetingId);
  const meetingEndedNotice = useMeetingEndedNotice({
    teamId,
    meetingId,
    isMeetingLoaded: recording.meeting !== null,
    hasCompleted: recording.isCompleted,
  });
  const redirectAfterMeetingDeleted = useMeetingDeletedRedirect(teamId);
  const recordingStartedNotice = useRecordingStartedNotice(meetingId);
  const meetingInfoEdit = useMeetingInfoEdit({ meetingId, meeting: recording.meeting });
  const { isOpen: isRecordingObjectLostNoticeOpen, isResuming: isResumingRecording } =
    useRecordingObjectLostAutoEnd({
      isRecorder: recording.isRecorder,
      isActivelyRecording: recording.isRecording || recording.isPaused,
      isCompleted: recording.isCompleted,
      isPausedByUser: recording.isPausedByUser,
    });
  useWakeLock(recording.isRecorder && (recording.isRecording || recording.isPaused));
  useBeforeUnloadWarning(recording.isRecorder && (recording.isRecording || recording.isPaused));

  if (
    recording.isServerCompleted &&
    completedView &&
    !meetingEndedNotice.isMeetingEndedNoticeOpen
  ) {
    return completedView;
  }
  if (!recording.meeting) {
    return (
      <CurrentMeetingLoadingState
        isPending={recording.isMeetingPending}
        teamHomeHref={`/teams/${encodeURIComponent(teamId)}`}
      />
    );
  }

  const contextValue: CurrentMeetingContextValue = {
    teamId,
    meetingId,
    team: team ?? null,
    teamMemberCount: teamMembers?.length ?? null,
    recording: { ...recording, meeting: recording.meeting },
    meetingEndedNotice,
    meetingInfoEdit,
    recordingStartedNotice,
    openSidebar: () => setIsSidebarOpen(true),
  };

  return (
    <CurrentMeetingProvider value={contextValue}>
      <div className="relative flex h-dvh min-h-[844px] flex-col bg-cool-50">
        {!recording.isCompleted && (
          <MeetingSseConnection
            meetingId={String(meetingId)}
            onMeetingDeleted={redirectAfterMeetingDeleted}
          />
        )}
        <CurrentMeetingHeader />

        {!recording.isWaiting && (
          <CurrentMeetingTabs activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {recording.isWaiting ? (
          <WaitingForRecordingNotice />
        ) : activeTab === 'chat' ? (
          <MeetingChat />
        ) : (
          <MeetingTranscript />
        )}

        {(recording.isWaiting || activeTab === 'transcript') && <MeetingControls />}

        <CurrentMeetingDialogs />

        {team && (
          <NavigationSidebar
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            teamId={numericTeamId}
            teamName={team.name}
          />
        )}

        {recording.isEnding && <MeetingEndingOverlay />}
        {isRecordingObjectLostNoticeOpen && (
          <RecordingObjectLostOverlay isResuming={isResumingRecording} />
        )}
      </div>
    </CurrentMeetingProvider>
  );
};
