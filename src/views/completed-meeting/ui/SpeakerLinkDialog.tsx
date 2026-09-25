'use client';

import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { useSpeakerLinkData } from '../model/useSpeakerLinkData';
import { useSpeakerLinking } from '../model/useSpeakerLinking';
import { SpeakerMappingStateDialog } from './SpeakerMappingStateDialog';
import { TeamMemberLinkDialog } from './TeamMemberLinkDialog';

interface SpeakerLinkDialogProps {
  meetingId: number;
  entry: TranscriptEntry;
  isPreview: boolean;
  onClose: () => void;
}

/**
 * 전사 발화의 발화자를 팀 멤버와 연결하는 모달.
 * 열릴 때 발화자의 연결 상태와 참석자 목록을 조회하고, 조회가 끝나면 연결 상태에 맞는 선택 상태로 보여준다.
 * 연결·해제를 저장하면 모달을 닫고, 저장에 실패하면 열어 둔 채 다시 시도할 수 있다.
 */
export const SpeakerLinkDialog = ({
  meetingId,
  entry,
  isPreview,
  onClose,
}: SpeakerLinkDialogProps) => {
  const { status, data, retry } = useSpeakerLinkData({ meetingId, entry, isPreview });
  const { isSaving, connect, unlink } = useSpeakerLinking({ meetingId, isPreview });

  if (status === 'ready') {
    return (
      <TeamMemberLinkDialog
        speakerLabel={data.speakerLabel}
        members={data.members}
        currentLink={data.currentLink}
        isSubmitting={isSaving}
        onConnect={async (selection) => {
          if (await connect(data.speakerId, selection)) onClose();
        }}
        onUnlink={async () => {
          if (await unlink(data.speakerId)) onClose();
        }}
        onClose={onClose}
      />
    );
  }

  return <SpeakerMappingStateDialog status={status} onRetry={retry} onClose={onClose} />;
};
