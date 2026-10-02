'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMeetingTranscript } from '@/features/meeting';
import {
  getCurrentMeetingQueryKey,
  getCurrentMeetingState,
  useMeetingSse,
} from '@/features/meeting-sse';
import { mergeTranscriptSegments } from './merge-transcript-segments';
import { useElapsedSeconds } from './useElapsedSeconds';
import { getMeetingPreview, type CurrentMeetingViewModel } from './preview-meeting';

interface UseCurrentMeetingDataParams {
  meetingId: number;
  previewState?: string;
}

/** 회의 정보 조회 결과(또는 개발용 미리보기)와 과거·실시간 녹취를 합쳐 화면용 회의 모델로 만든다. */
export const useCurrentMeetingData = ({ meetingId, previewState }: UseCurrentMeetingDataParams) => {
  const { transcriptsByMeetingId } = useMeetingSse();
  const isPreview = previewState !== undefined;
  const currentMeetingQuery = useQuery({
    queryKey: getCurrentMeetingQueryKey(meetingId),
    queryFn: () => getCurrentMeetingState(meetingId),
    enabled: !isPreview,
  });
  // 늦게 입장하거나 새로고침한 참여자도 그전까지의 발화를 볼 수 있도록 과거 전사를 조회한다.
  const transcriptHistoryQuery = useMeetingTranscript(meetingId, { isEnabled: !isPreview });
  // 과거 전사 조회가 끝나기 전까지는, 그 사이 SSE로 들어오는 실시간 전사를 화면에 보여주지
  // 않고 기다린다. 안 그러면 조회 결과가 나중에 도착해 이미 보이던 목록 위쪽에 끼워
  // 넣어지면서 "새 녹취 도착" 하이라이트·스크롤이 엉뚱하게 반응한다. 한 번 끝나면(성공이든
  // 실패든) 계속 true로 두고, 이후 재조회가 걸려도 이미 보여준 걸 다시 숨기지 않는다.
  const [hasSettledTranscriptHistory, setHasSettledTranscriptHistory] = useState(
    isPreview || !transcriptHistoryQuery.isPending,
  );
  if (!hasSettledTranscriptHistory && !isPreview && !transcriptHistoryQuery.isPending) {
    setHasSettledTranscriptHistory(true);
  }
  const elapsedSeconds = useElapsedSeconds({
    recordingStatus: currentMeetingQuery.data?.recordingStatus ?? null,
    startedAt: currentMeetingQuery.data?.recordingStartedAt ?? null,
    pausedAt: currentMeetingQuery.data?.recordingPausedAt ?? null,
    totalPausedDurationMs: currentMeetingQuery.data?.recordingTotalPausedDurationMs ?? null,
  });
  const meeting: CurrentMeetingViewModel | null = isPreview
    ? getMeetingPreview(previewState)
    : currentMeetingQuery.data
      ? {
          title: currentMeetingQuery.data.title,
          recorderName: currentMeetingQuery.data.recorderName,
          participantCount: currentMeetingQuery.data.participantCount,
          targetMinutes: currentMeetingQuery.data.targetMinutes,
          purpose: currentMeetingQuery.data.purpose,
          note: currentMeetingQuery.data.note,
          createdByTeamMemberId: currentMeetingQuery.data.createdByTeamMemberId,
          recordingStartedByTeamMemberId: currentMeetingQuery.data.recordingStartedByTeamMemberId,
          recordingSessionId: currentMeetingQuery.data.recordingSessionId,
          recordingStartedAt: currentMeetingQuery.data.recordingStartedAt,
          elapsedSeconds,
          recordingStatus:
            currentMeetingQuery.data.meetingStatus === 'WAITING'
              ? 'waiting'
              : currentMeetingQuery.data.recordingStatus === 'PAUSED'
                ? 'paused'
                : 'recording',
          connectionStatus: 'connected',
          transcripts: hasSettledTranscriptHistory
            ? mergeTranscriptSegments(
                transcriptHistoryQuery.data ?? [],
                transcriptsByMeetingId[String(meetingId)] ?? [],
              )
            : [],
        }
      : null;

  return {
    meeting,
    isMeetingPending: !isPreview && currentMeetingQuery.isPending,
    isServerCompleted: currentMeetingQuery.data?.meetingStatus === 'COMPLETED',
    isTranscriptHistoryPending: !isPreview && !hasSettledTranscriptHistory,
    isTranscriptHistoryError: !isPreview && transcriptHistoryQuery.isError,
  };
};
