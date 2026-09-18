import { MoreVertical } from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { Participant } from '../model/types';

interface ParticipantListItemProps {
  order: number;
  participant: Participant;
  showManageAction: boolean;
}

export const ParticipantListItem = ({
  order,
  participant,
  showManageAction,
}: ParticipantListItemProps) => (
  <li className="flex items-center gap-3 border-b border-cool-100 py-3 last:border-b-0">
    <span className="w-4 text-sm text-cool-400">{order}</span>
    <span className="flex size-8 items-center justify-center rounded-full bg-cool-100 text-sm font-semibold text-cool-700">
      {participant.avatarInitial}
    </span>
    <span className="flex-1 truncate text-[15px] font-medium text-cool-900">
      {participant.name}
    </span>

    <div className="flex items-center gap-1.5">
      {participant.isTeamLeader && <Badge variant="neutral">팀장</Badge>}
      {participant.isMe && <Badge variant="outline">나</Badge>}
    </div>

    {showManageAction && (
      <button
        type="button"
        aria-label={`${participant.name} 관리`}
        className="flex size-8 items-center justify-center rounded-full text-cool-400 transition-colors hover:bg-cool-100 hover:text-cool-900"
      >
        <MoreVertical className="size-4" strokeWidth={2} />
      </button>
    )}
  </li>
);
