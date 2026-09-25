export const COMPLETED_MEETING_TABS = ['summary', 'transcript'] as const;

export type CompletedMeetingTab = (typeof COMPLETED_MEETING_TABS)[number];

export const DEFAULT_COMPLETED_MEETING_TAB: CompletedMeetingTab = 'summary';

/** 주소의 tab 값이 알려진 탭이 아니면 기본 탭(요약)으로 본다. */
export const parseCompletedMeetingTab = (value: string | string[] | undefined) =>
  COMPLETED_MEETING_TABS.find((tab) => tab === value) ?? DEFAULT_COMPLETED_MEETING_TAB;
