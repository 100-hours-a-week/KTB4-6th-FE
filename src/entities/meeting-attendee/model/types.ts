export type MeetingAttendeeType = 'TEAM_MEMBER' | 'CUSTOM';

export interface MeetingAttendeeData {
  teamMemberId: number | null;
  name: string;
  type: MeetingAttendeeType;
}
