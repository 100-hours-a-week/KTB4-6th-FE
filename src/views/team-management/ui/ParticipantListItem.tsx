'use client';

import { Menu } from '@base-ui/react/menu';
import { Crown, MoreVertical } from 'lucide-react';
import { useAppFrameElement } from '@/shared/lib';
import { Badge } from '@/shared/ui';
import type { Participant } from '../model/types';

interface ParticipantListItemProps {
  onDelegateClick: (participant: Participant) => void;
  order: number;
  participant: Participant;
  showManageAction: boolean;
}

export const ParticipantListItem = ({
  onDelegateClick,
  order,
  participant,
  showManageAction,
}: ParticipantListItemProps) => {
  const frame = useAppFrameElement();

  return (
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
        <Menu.Root>
          <Menu.Trigger
            aria-label={`${participant.name} 관리`}
            className="flex size-8 items-center justify-center rounded-full text-cool-400 transition-colors hover:bg-cool-100 hover:text-cool-900"
          >
            <MoreVertical className="size-4" strokeWidth={2} />
          </Menu.Trigger>

          <Menu.Portal container={frame}>
            <Menu.Positioner
              className="z-[75] outline-none"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <Menu.Popup className="min-w-[152px] rounded-xl border border-cool-100 bg-white py-1 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
                <Menu.Item
                  onClick={() => onDelegateClick(participant)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-cool-700 outline-none select-none data-highlighted:bg-cool-50"
                >
                  <Crown className="size-4" strokeWidth={2} />
                  팀장 위임
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )}
    </li>
  );
};
