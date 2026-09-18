import type { Participant, TeamMemberRole } from '../model/types';
import { ParticipantListItem } from './ParticipantListItem';

interface ParticipantListSectionProps {
  role: TeamMemberRole;
  participants: Participant[];
}

export const ParticipantListSection = ({ role, participants }: ParticipantListSectionProps) => (
  <section className="mt-6 px-5">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-cool-900">참여자 목록</h2>
      <span className="text-sm text-cool-500">{participants.length}명</span>
    </div>

    <ul className="mt-2">
      {participants.map((participant, index) => (
        <ParticipantListItem
          key={participant.id}
          order={index + 1}
          participant={participant}
          showManageAction={role === 'leader' && !participant.isMe}
        />
      ))}
    </ul>
  </section>
);
