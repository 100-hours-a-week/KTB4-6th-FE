'use client';

import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { useSpeakerLinkData } from '../model/useSpeakerLinkData';
import { SpeakerMappingStateDialog } from './SpeakerMappingStateDialog';
import { TeamMemberLinkDialog } from './TeamMemberLinkDialog';

interface SpeakerLinkDialogProps {
  meetingId: number;
  entry: TranscriptEntry;
  isPreview: boolean;
  onConnect: (name: string) => void;
  onUnlink: () => void;
  onClose: () => void;
}

/**
 * 전사 발화의 발화자를 팀 멤버와 연결하는 모달.
 * 열릴 때 발화자의 연결 상태와 참석자 목록을 조회하고, 조회가 끝나면 연결 상태에 맞는 선택 상태로 보여준다.
 */
export const SpeakerLinkDialog = ({
  meetingId,
  entry,
  isPreview,
  onConnect,
  onUnlink,
  onClose,
}: SpeakerLinkDialogProps) => {
  const { status, data, retry } = useSpeakerLinkData({ meetingId, entry, isPreview });

  if (status === 'ready') {
    return (
      <TeamMemberLinkDialog
        speakerLabel={data.speakerLabel}
        members={data.members}
        currentLink={data.currentLink}
        onConnect={onConnect}
        onUnlink={onUnlink}
        onClose={onClose}
      />
    );
  }

  return <SpeakerMappingStateDialog status={status} onRetry={retry} onClose={onClose} />;
};
