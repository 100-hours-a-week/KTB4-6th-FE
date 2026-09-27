export type TeamMemberRole = 'leader' | 'member';

export type MeetingListLoadMoreStatus = 'idle' | 'loading' | 'error';

export type MeetingListStatus = 'success' | 'loading' | 'error';

export interface Meeting {
  id: number;
  title: string;
  status: 'waiting' | 'in_progress' | 'completed';
  startedAtLabel: string;
  durationLabel?: string;
}
