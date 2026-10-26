'use client';

import { useState } from 'react';
import type { TranscriptEntry } from '../model/types';
import { SpeakerLinkDialog } from './SpeakerLinkDialog';

interface TranscriptSpeakerButtonProps {
  meetingId: number;
  entry: TranscriptEntry;
}

export const TranscriptSpeakerButton = ({ meetingId, entry }: TranscriptSpeakerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded text-left text-[13px] font-bold break-all text-cool-900"
      >
        {entry.speakerName}
      </button>
      {isOpen && <SpeakerLinkDialog meetingId={meetingId} entry={entry} onClose={closeDialog} />}
    </>
  );
};
