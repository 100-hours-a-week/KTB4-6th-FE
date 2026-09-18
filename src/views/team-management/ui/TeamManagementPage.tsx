import { mockBlockedMembers, mockParticipants, mockTeamInfo } from '../model/mock';
import type { TeamMemberRole, TeamPageStatus } from '../model/types';
import { BlockedListSection } from './BlockedListSection';
import { ParticipantListSection } from './ParticipantListSection';
import { TeamDeleteAction } from './TeamDeleteAction';
import { TeamInfoSection } from './TeamInfoSection';
import { TeamLeaveAction } from './TeamLeaveAction';
import { TeamManagementContentSkeleton } from './TeamManagementContentSkeleton';
import { TeamManagementErrorState } from './TeamManagementErrorState';
import { TeamManagementHeader } from './TeamManagementHeader';

interface TeamManagementPageProps {
  role: TeamMemberRole;
  status: TeamPageStatus;
}

export const TeamManagementPage = ({ role, status }: TeamManagementPageProps) => {
  const isLeader = role === 'leader';

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <TeamManagementHeader />

      <div className="flex-1 overflow-y-auto">
        {status === 'loading' ? (
          <TeamManagementContentSkeleton />
        ) : status === 'error' ? (
          <TeamManagementErrorState />
        ) : (
          <>
            <TeamInfoSection role={role} team={mockTeamInfo} />
            <ParticipantListSection role={role} participants={mockParticipants} />
            {isLeader && <BlockedListSection blockedMembers={mockBlockedMembers} />}
          </>
        )}
      </div>

      <footer className="shrink-0">
        {isLeader ? (
          <TeamDeleteAction hasActiveMeeting={mockTeamInfo.hasActiveMeeting} />
        ) : (
          <TeamLeaveAction hasActiveMeeting={mockTeamInfo.hasActiveMeeting} />
        )}
      </footer>
    </div>
  );
};
