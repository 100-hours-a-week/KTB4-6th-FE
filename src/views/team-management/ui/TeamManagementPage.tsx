'use client';

import { mockBlockedMembers } from '../model/mock';
import { useTeamManagementPageData } from '../model/useTeamManagementPageData';
import { BlockedListSection } from './BlockedListSection';
import { ParticipantListSection } from './ParticipantListSection';
import { TeamDeleteAction } from './TeamDeleteAction';
import { TeamInfoSection } from './TeamInfoSection';
import { TeamLeaveAction } from './TeamLeaveAction';
import { TeamManagementContentSkeleton } from './TeamManagementContentSkeleton';
import { TeamManagementErrorState } from './TeamManagementErrorState';
import { TeamManagementHeader } from './TeamManagementHeader';

interface TeamManagementPageProps {
  teamId: number;
}

export const TeamManagementPage = ({ teamId }: TeamManagementPageProps) => {
  const { status, role, team, participants, refetch, removeParticipant } =
    useTeamManagementPageData(teamId);
  const isLeader = role === 'leader';

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <TeamManagementHeader />

      <div className="flex-1 overflow-y-auto">
        {status === 'loading' ? (
          <TeamManagementContentSkeleton />
        ) : status === 'error' || !role || !team ? (
          <TeamManagementErrorState />
        ) : (
          <>
            <TeamInfoSection role={role} team={team} teamId={teamId} />
            <ParticipantListSection
              role={role}
              participants={participants}
              teamId={teamId}
              onLeaderDelegated={refetch}
              onMemberKicked={removeParticipant}
            />
            {isLeader && <BlockedListSection blockedMembers={mockBlockedMembers} />}
          </>
        )}
      </div>

      {status === 'success' && role && team && (
        <footer className="shrink-0">
          {isLeader ? (
            <TeamDeleteAction hasActiveMeeting={team.hasActiveMeeting} />
          ) : (
            <TeamLeaveAction hasActiveMeeting={team.hasActiveMeeting} />
          )}
        </footer>
      )}
    </div>
  );
};
