'use client';

import { useState } from 'react';

/** 녹음 시작 안내 모달의 열림 여부와 안내 확인 체크 상태를 관리한다. */
export const useRecordingStartDialog = () => {
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isRecordingAcknowledged, setIsRecordingAcknowledged] = useState(false);

  const handleStartDialogOpenChange = (open: boolean) => {
    setIsStartDialogOpen(open);
    if (!open) setIsRecordingAcknowledged(false);
  };

  return {
    isStartDialogOpen,
    isRecordingAcknowledged,
    setIsRecordingAcknowledged,
    handleStartDialogOpenChange,
  };
};
