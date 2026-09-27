export type TeamMemberRole = 'leader' | 'member';

export interface Meeting {
  id: number;
  title: string;
  status: 'waiting' | 'in_progress' | 'completed';
  startedAtLabel: string;
  durationLabel?: string;
}
