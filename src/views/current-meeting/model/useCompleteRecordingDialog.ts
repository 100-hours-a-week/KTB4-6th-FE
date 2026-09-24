'use client';

import { useState } from 'react';

/** 회의 종료 확인 모달의 열림 여부를 관리하고, 확인하면 모달을 닫은 뒤 종료 흐름을 실행한다. */
export const useCompleteRecordingDialog = (onComplete: () => void) => {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  const handleCompleteRequest = () => setIsCompleteDialogOpen(true);

  const handleComplete = () => {
    setIsCompleteDialogOpen(false);
    onComplete();
  };

  return { isCompleteDialogOpen, setIsCompleteDialogOpen, handleCompleteRequest, handleComplete };
};
