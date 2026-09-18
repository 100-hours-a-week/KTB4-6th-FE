import { Button } from '@/shared/ui';
import type { BlockedMember } from '../model/types';

interface BlockedListItemProps {
  order: number;
  member: BlockedMember;
}

export const BlockedListItem = ({ order, member }: BlockedListItemProps) => (
  <li className="flex items-center gap-3 border-b border-cool-100 py-3 last:border-b-0">
    <span className="w-4 text-sm text-cool-400">{order}</span>
    <span className="flex size-8 items-center justify-center rounded-full bg-cool-100 text-sm font-semibold text-cool-700">
      {member.avatarInitial}
    </span>
    <span className="flex-1 truncate text-[15px] font-medium text-cool-900">{member.name}</span>

    <Button variant="outline" size="sm">
      해제
    </Button>
  </li>
);
