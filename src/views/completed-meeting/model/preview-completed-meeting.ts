import { mockTranscriptEntries, type TranscriptEntry } from './preview-meeting-transcript';

export type CompletedMeetingPreviewState =
  | 'completed'
  | 'summary-generating'
  | 'summary-failed'
  | 'transcript-empty'
  | 'audio-expired'
  | 'credit-short';

export type CompletedMeetingViewerRole = 'leader' | 'member';

export type MeetingSummaryStatus = 'generating' | 'completed' | 'failed';

export interface CompletedMeetingViewModel {
  title: string;
  summaryStatus: MeetingSummaryStatus;
  /** 팀이 보유한 크레딧 */
  teamCredits: number;
  transcriptEntries: TranscriptEntry[];
  startedAt: string;
  endedAt: string;
  /** 음성 파일이 만료되기까지 남은 일수. 이미 만료됐으면 null */
  audioRemainingDays: number | null;
  audioDurationSeconds: number;
}

// TODO: 회의 상세 응답(GET /api/v1/meetings/{meetingId}), 음성 파일 조회 응답, 팀 크레딧 조회 응답으로 교체한다.
const baseMeeting = {
  title: '9월 스프린트 계획',
  summaryStatus: 'completed' as const,
  teamCredits: 10,
  transcriptEntries: mockTranscriptEntries,
  startedAt: '2026-08-25T10:00:00+09:00',
  endedAt: '2026-08-25T13:00:00+09:00',
  audioDurationSeconds: 1753,
};

const previews: Record<CompletedMeetingPreviewState, CompletedMeetingViewModel> = {
  completed: { ...baseMeeting, audioRemainingDays: 42 },
  'summary-generating': { ...baseMeeting, summaryStatus: 'generating', audioRemainingDays: 42 },
  'summary-failed': { ...baseMeeting, summaryStatus: 'failed', audioRemainingDays: 42 },
  'transcript-empty': { ...baseMeeting, transcriptEntries: [], audioRemainingDays: 42 },
  'audio-expired': { ...baseMeeting, audioRemainingDays: null },
  'credit-short': { ...baseMeeting, teamCredits: 1, audioRemainingDays: 42 },
};

/** 개발 환경 전용 ?preview= 값이 종료 회의 미리보기 상태이면 그 상태를, 아니면 undefined를 돌려준다. */
export const parseCompletedMeetingPreview = (
  value: string | string[] | undefined,
): CompletedMeetingPreviewState | undefined =>
  (Object.keys(previews) as CompletedMeetingPreviewState[]).find((state) => state === value);

export const getCompletedMeetingPreview = (state: CompletedMeetingPreviewState) => previews[state];

/** 개발 환경 전용 ?role= 값이 member이면 팀원, 아니면 팀장으로 본다. */
export const parseCompletedMeetingViewerRole = (
  value: string | string[] | undefined,
): CompletedMeetingViewerRole => (value === 'member' ? 'member' : 'leader');
