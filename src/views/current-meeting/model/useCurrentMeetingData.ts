'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCurrentMeetingState,
  type TranscriptCreatedEventData,
  useMeetingSse,
} from '@/features/meeting-sse';
import {
  getMeetingPreview,
  mockMeetingInfo,
  type CurrentMeetingViewModel,
  type TranscriptSegment,
} from './preview-meeting';

const toTranscriptSegment = (transcript: TranscriptCreatedEventData): TranscriptSegment => ({
  id: String(transcript.transcriptSegmentId),
  speakerNumber: null,
  startedAtSeconds: Math.floor(transcript.startedAtMs / 1000),
  text: transcript.text,
});

interface UseCurrentMeetingDataParams {
  meetingId: number;
  previewState?: string;
}

/** 회의 정보 조회 결과(또는 개발용 미리보기)와 실시간 녹취를 화면용 회의 모델로 만든다. */
export const useCurrentMeetingData = ({ meetingId, previewState }: UseCurrentMeetingDataParams) => {
  const { transcriptsByMeetingId } = useMeetingSse();
  const isPreview = previewState !== undefined;
  const currentMeetingQuery = useQuery({
    queryKey: ['meetings', meetingId, 'current-state'],
    queryFn: () => getCurrentMeetingState(meetingId),
    enabled: !isPreview,
  });
  const meeting: CurrentMeetingViewModel | null = isPreview
    ? getMeetingPreview(previewState)
    : currentMeetingQuery.data
      ? {
          title: currentMeetingQuery.data.title,
          recorderName: currentMeetingQuery.data.recorderName,
          participantCount: currentMeetingQuery.data.participantCount,
          participantLimit: 5,
          targetMinutes: currentMeetingQuery.data.targetMinutes,
          ...mockMeetingInfo,
          elapsedSeconds: 0,
          recordingStatus:
            currentMeetingQuery.data.meetingStatus === 'WAITING'
              ? 'waiting'
              : currentMeetingQuery.data.recordingStatus === 'PAUSED'
                ? 'paused'
                : 'recording',
          connectionStatus: 'connected',
          transcripts: (transcriptsByMeetingId[String(meetingId)] ?? []).map(toTranscriptSegment),
        }
      : null;

  return {
    meeting,
    isMeetingPending: !isPreview && currentMeetingQuery.isPending,
    isServerCompleted: currentMeetingQuery.data?.meetingStatus === 'COMPLETED',
  };
};
