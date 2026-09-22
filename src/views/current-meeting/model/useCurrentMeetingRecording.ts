'use client';

import { useEffect, useState } from 'react';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import {
  useCompleteRecording,
  useMediaRecorder,
  useStartRecording,
  useUpdateRecordingStatus,
} from '@/features/recording';
import { useAppToast } from '@/shared/ui';
import { getMeetingPreview } from './preview-meeting';

interface UseCurrentMeetingRecordingParams {
  meetingId: number;
  previewState?: string;
  previewRole: 'recorder' | 'participant';
}

export const useCurrentMeetingRecording = ({
  meetingId,
  previewState,
  previewRole,
}: UseCurrentMeetingRecordingParams) => {
  const [recordingSessionId, setRecordingSessionId] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isRecordingAcknowledged, setIsRecordingAcknowledged] = useState(false);
  const [isPreparingMicrophone, setIsPreparingMicrophone] = useState(false);
  const startRecording = useStartRecording();
  const completeRecording = useCompleteRecording();
  const updateRecordingStatus = useUpdateRecordingStatus();
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const startBrowserRecording = useMediaRecorder((state) => state.start);
  const pauseBrowserRecording = useMediaRecorder((state) => state.pause);
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const { connect, disconnect, statuses } = useRecordingWebSocket();
  const { showToast } = useAppToast();
  const meeting = getMeetingPreview(previewState);

  const isWaiting = meeting.recordingStatus === 'waiting' && recordingSessionId === null;
  const isPaused =
    previewState === undefined ? recorderStatus === 'paused' : meeting.recordingStatus === 'paused';
  const isEnding = meeting.recordingStatus === 'ending' || completeRecording.isPending;
  const socketStatus = recordingSessionId === null ? undefined : statuses[recordingSessionId];
  const isDisconnected =
    meeting.connectionStatus === 'disconnected' ||
    socketStatus === 'error' ||
    socketStatus === 'unconfigured';
  const isRecording =
    (previewState === undefined
      ? recorderStatus === 'recording'
      : meeting.recordingStatus === 'recording') &&
    !isDisconnected &&
    !isCompleted;
  const isRecorder = previewRole === 'recorder' || recordingSessionId !== null;
  const isStartingRecording = startRecording.isPending || isPreparingMicrophone;
  const canPauseResumeRecording =
    previewState === undefined &&
    recordingSessionId !== null &&
    socketStatus === 'connected' &&
    (recorderStatus === 'recording' || recorderStatus === 'paused') &&
    !isCompleted &&
    !completeRecording.isPending &&
    !updateRecordingStatus.isPending;

  useEffect(() => {
    if (previewState !== undefined || recordingSessionId === null) return;

    if (socketStatus === 'connected' && recorderStatus === 'ready') {
      try {
        startBrowserRecording();
      } catch {
        disconnect(recordingSessionId);
        releaseMicrophone();
        showToast('브라우저 녹음을 시작하지 못했습니다.', 'danger');
      }
    }

    if (
      (socketStatus === 'error' || socketStatus === 'unconfigured') &&
      recorderStatus === 'ready'
    ) {
      releaseMicrophone();
    }
  }, [
    disconnect,
    previewState,
    recorderStatus,
    recordingSessionId,
    releaseMicrophone,
    showToast,
    socketStatus,
    startBrowserRecording,
  ]);

  const handleStartRecording = () => {
    if (!isWaiting || previewState !== undefined || startRecording.isPending) return;
    setIsStartDialogOpen(true);
  };

  const handleStartDialogOpenChange = (open: boolean) => {
    setIsStartDialogOpen(open);
    if (!open) setIsRecordingAcknowledged(false);
  };

  const handleConfirmRecording = async () => {
    if (
      !isWaiting ||
      !isRecordingAcknowledged ||
      isPreparingMicrophone ||
      startRecording.isPending ||
      previewState !== undefined
    ) {
      return;
    }

    setIsPreparingMicrophone(true);
    try {
      const audioFormat = await prepareMicrophone();
      setIsPreparingMicrophone(false);

      startRecording.mutate(meetingId, {
        onSuccess: (startedSessionId) => {
          setRecordingSessionId(startedSessionId);
          connect(startedSessionId, audioFormat);
          handleStartDialogOpenChange(false);
        },
        onError: () => {
          releaseMicrophone();
          showToast('녹음을 시작하지 못했습니다. 다시 시도해주세요.', 'danger');
        },
      });
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? '마이크 권한을 허용해야 녹음을 시작할 수 있습니다.'
          : '마이크를 사용할 수 없습니다. 장치와 브라우저 권한을 확인해주세요.';
      showToast(message, 'danger');
      setIsPreparingMicrophone(false);
    }
  };

  const handleCompleteRecording = () => {
    if (
      recordingSessionId === null ||
      isCompleted ||
      completeRecording.isPending ||
      updateRecordingStatus.isPending ||
      previewState !== undefined
    ) {
      return;
    }

    completeRecording.mutate(recordingSessionId, {
      onSuccess: () => {
        disconnect(recordingSessionId);
        releaseMicrophone();
        setIsCompleted(true);
      },
      onError: () => showToast('녹음을 종료하지 못했습니다. 다시 시도해주세요.', 'danger'),
    });
  };

  const handlePauseResumeRecording = () => {
    if (!canPauseResumeRecording || recordingSessionId === null) return;

    const shouldPause = recorderStatus === 'recording';
    const recorder = useMediaRecorder.getState().recorder;
    if (recorder?.state !== (shouldPause ? 'recording' : 'paused')) {
      showToast('브라우저 녹음 상태를 확인할 수 없습니다.', 'danger');
      return;
    }

    updateRecordingStatus.mutate(
      { recordingSessionId, status: shouldPause ? 'PAUSED' : 'RECORDING' },
      {
        onSuccess: () => {
          try {
            if (shouldPause) pauseBrowserRecording();
            else resumeBrowserRecording();
          } catch {
            showToast('브라우저 녹음 상태를 변경하지 못했습니다.', 'danger');
          }
        },
        onError: () => showToast('녹음 상태를 변경하지 못했습니다. 다시 시도해주세요.', 'danger'),
      },
    );
  };

  return {
    meeting,
    isWaiting,
    isPaused,
    isEnding,
    isDisconnected,
    isRecording,
    isRecorder,
    isCompleted,
    isStartDialogOpen,
    isRecordingAcknowledged,
    isStartingRecording,
    isUpdatingRecordingStatus: updateRecordingStatus.isPending,
    canStartRecording:
      isWaiting && previewState === undefined && !isStartingRecording && !isStartDialogOpen,
    canPauseResumeRecording,
    canCompleteRecording:
      recordingSessionId !== null &&
      !isCompleted &&
      !completeRecording.isPending &&
      !updateRecordingStatus.isPending &&
      previewState === undefined,
    setIsRecordingAcknowledged,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
