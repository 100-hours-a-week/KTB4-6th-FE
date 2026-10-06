export type TeamMemberRole = 'leader' | 'member';

export type MeetingListLoadMoreStatus = 'idle' | 'loading' | 'error';

export type MeetingListStatus = 'success' | 'loading' | 'error';

export interface Meeting {
  id: number;
  title: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed';
  /** `11:00`. 시작 전 회의는 예정 시각, 그 외는 시작 시각 */
  time: string;
  /** `28분 진행` 또는 `목표 30분` */
  subLabel?: string;
}

export interface MeetingDateGroup {
  date: string;
  /** 올해는 `09.22 (화)`, 다른 해는 `2025.09.22 (월)` */
  label: string;
  meetingCount: number;
  meetings: Meeting[];
}
