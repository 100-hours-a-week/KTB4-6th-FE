export type CompletedMeetingPreviewState = 'completed' | 'audio-expired';

export interface CompletedMeetingViewModel {
  title: string;
  startedAt: string;
  endedAt: string;
  /** 음성 파일이 만료되기까지 남은 일수. 이미 만료됐으면 null */
  audioRemainingDays: number | null;
}

// TODO: 회의 상세 응답(GET /api/v1/meetings/{meetingId})과 음성 파일 조회 응답으로 교체한다.
const baseMeeting = {
  title: '9월 스프린트 계획',
  startedAt: '2026-08-25T10:00:00+09:00',
  endedAt: '2026-08-25T13:00:00+09:00',
};

const previews: Record<CompletedMeetingPreviewState, CompletedMeetingViewModel> = {
  completed: { ...baseMeeting, audioRemainingDays: 42 },
  'audio-expired': { ...baseMeeting, audioRemainingDays: null },
};

/** 개발 환경 전용 ?preview= 값이 종료 회의 미리보기 상태이면 그 상태를, 아니면 undefined를 돌려준다. */
export const parseCompletedMeetingPreview = (
  value: string | string[] | undefined,
): CompletedMeetingPreviewState | undefined =>
  (Object.keys(previews) as CompletedMeetingPreviewState[]).find((state) => state === value);

export const getCompletedMeetingPreview = (state: CompletedMeetingPreviewState) => previews[state];
