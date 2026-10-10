'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { TeamDetailData } from '@/features/team-management';
import type { CurrentMeetingViewModel } from './current-meeting';
import type { useCurrentMeetingRecording } from './useCurrentMeetingRecording';
import type { useMeetingEndedNotice } from './useMeetingEndedNotice';
import type { useMeetingInfoEdit } from './useMeetingInfoEdit';
import type { useRecordingStartedNotice } from './useRecordingStartedNotice';

type LoadedRecordingState = Omit<ReturnType<typeof useCurrentMeetingRecording>, 'meeting'> & {
  meeting: CurrentMeetingViewModel;
};

export interface CurrentMeetingContextValue {
  teamId: string;
  meetingId: number;
  team: TeamDetailData | null;
  teamMemberCount: number | null;
  recording: LoadedRecordingState;
  meetingEndedNotice: ReturnType<typeof useMeetingEndedNotice>;
  meetingInfoEdit: ReturnType<typeof useMeetingInfoEdit>;
  recordingStartedNotice: ReturnType<typeof useRecordingStartedNotice>;
  openSidebar: () => void;
}

const CurrentMeetingContext = createContext<CurrentMeetingContextValue | null>(null);

interface CurrentMeetingProviderProps {
  value: CurrentMeetingContextValue;
  children: ReactNode;
}

export const CurrentMeetingProvider = ({ value, children }: CurrentMeetingProviderProps) => (
  <CurrentMeetingContext value={value}>{children}</CurrentMeetingContext>
);

export const useCurrentMeetingContext = () => {
  const context = useContext(CurrentMeetingContext);

  if (!context) {
    throw new Error('useCurrentMeetingContext는 CurrentMeetingProvider 안에서 사용해야 합니다.');
  }

  return context;
};
