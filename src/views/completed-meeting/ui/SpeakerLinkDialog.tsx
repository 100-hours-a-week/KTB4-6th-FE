'use client';

import type { TranscriptEntry } from '../model/types';
import { useSpeakerLinkData } from '../model/useSpeakerLinkData';
import { useSpeakerLinking } from '../model/useSpeakerLinking';
import { SpeakerMappingStateDialog } from './SpeakerMappingStateDialog';
import { TeamMemberLinkDialog } from './TeamMemberLinkDialog';

interface SpeakerLinkDialogProps {
  meetingId: number;
  entry: TranscriptEntry;
  onClose: () => void;
}

export const SpeakerLinkDialog = ({ meetingId, entry, onClose }: SpeakerLinkDialogProps) => {
  const { status, data, retry } = useSpeakerLinkData({ meetingId, entry });
  const { isSaving, connect, unlink } = useSpeakerLinking({ meetingId });

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
