import { mockBlockedMembers, mockParticipants, mockTeamInfo } from '../model/mock';
import type { TeamMemberRole } from '../model/types';
import { BlockedListSection } from './BlockedListSection';
import { ParticipantListSection } from './ParticipantListSection';
import { TeamInfoSection } from './TeamInfoSection';
import { TeamManagementHeader } from './TeamManagementHeader';

interface TeamManagementPageProps {
  role: TeamMemberRole;
}

export const TeamManagementPage = ({ role }: TeamManagementPageProps) => {
  const isLeader = role === 'leader';

  return (
    <div className="flex min-h-[844px] flex-1 flex-col bg-cool-50">
      <TeamManagementHeader />

      <div className="flex-1 overflow-y-auto">
        <TeamInfoSection role={role} team={mockTeamInfo} />
        <ParticipantListSection role={role} participants={mockParticipants} />
        {isLeader && <BlockedListSection blockedMembers={mockBlockedMembers} />}
      </div>

      <footer className="shrink-0">
        {role === 'leader' ? (
          <div />
        ) : (
          <div /> // 팀장: 팀 삭제하기 / 팀원: 나가기 — 서브 이슈 2에서 채움
        )}
      </footer>
    </div>
  );
};
