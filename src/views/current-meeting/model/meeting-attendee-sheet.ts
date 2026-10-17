import type { MeetingAttendeeData } from '@/entities/meeting-attendee';
import type { TeamMemberData } from '@/features/team-management';

export interface TeamAttendeeItem {
  key: string;
  name: string;
  caption: string | null;
  isMe: boolean;
}

export interface CustomAttendeeItem {
  key: string;
  name: string;
}

const getCaption = (isMe: boolean, role: TeamMemberData['role'] | undefined) => {
  const roleLabel = role === 'LEADER' ? '팀장' : role === 'MEMBER' ? '팀원' : null;

  if (isMe) return roleLabel ? `나 · ${roleLabel}` : '나';
  return roleLabel;
};

export const toMeetingAttendeeSheet = (
  attendees: MeetingAttendeeData[],
  teamMembers: TeamMemberData[],
  myTeamMemberId: number | null,
) => {
  const teamAttendees: TeamAttendeeItem[] = attendees
    .filter((attendee) => attendee.type === 'TEAM_MEMBER')
    .map((attendee, index) => {
      const isMe = attendee.teamMemberId !== null && attendee.teamMemberId === myTeamMemberId;
      const role = teamMembers.find(
        (member) => member.teamMemberId === attendee.teamMemberId,
      )?.role;

      return {
        key: `member-${attendee.teamMemberId ?? index}`,
        name: attendee.name,
        caption: getCaption(isMe, role),
        isMe,
      };
    })
    .sort((a, b) => Number(b.isMe) - Number(a.isMe));

  const customAttendees: CustomAttendeeItem[] = attendees
    .filter((attendee) => attendee.type === 'CUSTOM')
    .map((attendee, index) => ({ key: `custom-${index}-${attendee.name}`, name: attendee.name }));

  return { teamAttendees, customAttendees };
};
