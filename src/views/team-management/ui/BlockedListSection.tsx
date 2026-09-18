import { Info } from 'lucide-react';
import type { BlockedMember } from '../model/types';
import { BlockedListItem } from './BlockedListItem';

interface BlockedListSectionProps {
  blockedMembers: BlockedMember[];
}

export const BlockedListSection = ({ blockedMembers }: BlockedListSectionProps) => (
  <section className="mt-6 px-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <h2 className="text-base font-bold text-cool-900">차단 목록</h2>
        <button
          type="button"
          aria-label="차단 목록 설명"
          className="flex size-5 items-center justify-center text-cool-400"
        >
          <Info className="size-4" strokeWidth={2} />
        </button>
      </div>
      <span className="text-sm text-cool-500">{blockedMembers.length}명</span>
    </div>

    {blockedMembers.length === 0 ? (
      <div className="mt-3 flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-cool-200 bg-white px-4 text-center">
        <p className="text-sm text-cool-500">차단된 참여자가 없어요.</p>
      </div>
    ) : (
      <ul className="mt-2">
        {blockedMembers.map((member, index) => (
          <BlockedListItem key={member.id} order={index + 1} member={member} />
        ))}
      </ul>
    )}
  </section>
);
