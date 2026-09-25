'use client';

import { useState } from 'react';
import type { TranscriptEntry } from '../model/preview-meeting-transcript';
import { SpeakerLinkDialog } from './SpeakerLinkDialog';

interface TranscriptSpeakerButtonProps {
  meetingId: number;
  entry: TranscriptEntry;
  /** 개발 환경 전용 미리보기이면 연결 정보를 조회하지 않는다. */
  isPreview: boolean;
}

/** 전사 항목의 발화자 이름. 누르면 발화자를 팀 멤버와 연결하는 모달이 열린다. */
export const TranscriptSpeakerButton = ({
  meetingId,
  entry,
  isPreview,
}: TranscriptSpeakerButtonProps) => {
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
      {isOpen && (
        <SpeakerLinkDialog
          meetingId={meetingId}
          entry={entry}
          isPreview={isPreview}
          onClose={closeDialog}
        />
      )}
    </>
  );
};
