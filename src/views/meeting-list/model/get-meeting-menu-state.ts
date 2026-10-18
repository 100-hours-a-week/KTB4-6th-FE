import type { Meeting, MeetingMenuState, TeamMemberRole } from './type';

interface GetMeetingMenuStateParams {
  meeting: Pick<Meeting, 'status' | 'createdByTeamMemberId'>;
  viewerRole: TeamMemberRole;
  viewerTeamMemberId: number | null;
}

const HIDDEN_MENU_STATE: MeetingMenuState = {
  isVisible: false,
  editInfo: 'hidden',
  rename: 'hidden',
  delete: 'hidden',
};

export const getMeetingMenuState = ({
  meeting,
  viewerRole,
  viewerTeamMemberId,
}: GetMeetingMenuStateParams): MeetingMenuState => {
  const isLeader = viewerRole === 'leader';
  const isCreator =
    viewerTeamMemberId !== null &&
    meeting.createdByTeamMemberId !== null &&
    viewerTeamMemberId === meeting.createdByTeamMemberId;

  if (!isLeader && !isCreator) return HIDDEN_MENU_STATE;

  switch (meeting.status) {
    case 'scheduled':
    case 'waiting':
      return {
        isVisible: true,
        editInfo: 'enabled',
        rename: 'hidden',
        delete: isLeader ? 'enabled' : 'hidden',
      };
    case 'in_progress':
      return {
        isVisible: true,
        editInfo: 'locked',
        rename: 'hidden',
        delete: isLeader ? 'locked' : 'hidden',
      };
    case 'completed':
      return {
        isVisible: true,
        editInfo: 'hidden',
        rename: 'enabled',
        delete: isLeader ? 'enabled' : 'hidden',
      };
  }
};
