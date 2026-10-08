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
  state: MeetingMenuState;
  onEditInfo?: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export interface TodayMeetings {
  label: string;
  meetingCount: number;
  inProgressMeeting?: Meeting;
  otherMeetings: Meeting[];
}

export interface MeetingSearchResultsData {
  keyword: string;
  status: MeetingListStatus;
  meetings: Meeting[];
  hasMore: boolean;
  loadMoreStatus: MeetingListLoadMoreStatus;
  loadMore: () => void;
}

export interface MeetingDateGroup {
  date: string;
  label: string;
  meetingCount: number;
  meetings: Meeting[];
}
