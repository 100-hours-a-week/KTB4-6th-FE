'use client';

import { useState } from 'react';
import { withWaGwa } from '@/shared/lib';
import { useAppToast } from '@/shared/ui';
import { mockTeamMembers } from '../model/preview-team-members';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { TeamMemberLinkDialog } from './TeamMemberLinkDialog';

interface TranscriptSpeakerButtonProps {
  entry: TranscriptEntry;
}

/** 전사 항목의 발화자 이름. 누르면 발화자를 팀 멤버와 연결하는 모달이 열린다. */
export const TranscriptSpeakerButton = ({ entry }: TranscriptSpeakerButtonProps) => {
  const { showToast } = useAppToast();
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);

  // TODO: 발화자 연결 API가 생기면 연결 저장 요청으로 교체한다. (같은 발화자의 모든 발화에 반영)
  const handleConnect = (name: string) => {
    closeDialog();
    showToast(`발화자가 ${withWaGwa(name)} 연결되었습니다`, 'success');
  };

  // TODO: 발화자 연결 API가 생기면 연결 해제 요청으로 교체한다.
  const handleUnlink = () => {
    closeDialog();
    showToast('발화자 연결이 해제되었습니다', 'success');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded text-left text-[13px] font-bold break-all text-cool-900"
      >
        {entry.speakerName}
      </button>
      {isOpen && (
        <TeamMemberLinkDialog
          speakerLabel={entry.speakerName}
          members={mockTeamMembers}
          currentLink={
            entry.isSpeakerLinked
              ? { name: entry.speakerName, memberId: entry.linkedMemberId }
              : null
          }
          onConnect={handleConnect}
          onUnlink={handleUnlink}
          onClose={closeDialog}
        />
      )}
    </>
  );
};
