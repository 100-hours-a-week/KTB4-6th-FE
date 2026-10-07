export type TeamMemberRole = 'leader' | 'member';

export type MeetingListLoadMoreStatus = 'idle' | 'loading' | 'error';

export type MeetingListStatus = 'success' | 'loading' | 'error';

export type MeetingMenuItemState = 'hidden' | 'enabled' | 'locked';

export interface MeetingMenuState {
  isVisible: boolean;
  editInfo: MeetingMenuItemState;
  rename: MeetingMenuItemState;
  delete: MeetingMenuItemState;
}

export interface Meeting {
  id: number;
  createdByTeamMemberId: number | null;
  title: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed';
  time: string;
  subLabel?: string;
}

export interface MeetingMenuActions {
  onRename: () => void;
  onDelete: () => void;
}

export interface TodayMeetings {
  label: string;
  meetingCount: number;
  /** 진행 중 회의는 한 번에 하나뿐이다 */
  inProgressMeeting?: Meeting;
  otherMeetings: Meeting[];
}

export interface MeetingDateGroup {
  date: string;
  /** 올해는 `09.22 (화)`, 다른 해는 `2025.09.22 (월)` */
  label: string;
  meetingCount: number;
  meetings: Meeting[];
}
