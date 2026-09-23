'use client';

import { useState } from 'react';
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
  teamId: string;
  meetingId: number;
  previewState?: string;
  previewRole: 'recorder' | 'participant';
}

export const useCurrentMeetingRecording = ({
  teamId,
  meetingId,
  previewState,
  previewRole,
}: UseCurrentMeetingRecordingParams) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isRecordingAcknowledged, setIsRecordingAcknowledged] = useState(false);
  const startRecording = useStartRecording();
  const completeRecording = useCompleteRecording();
  const updateRecordingStatus = useUpdateRecordingStatus();
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const pauseBrowserRecording = useMediaRecorder((state) => state.pause);
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const flushForCompletion = useMediaRecorder((state) => state.flushForCompletion);
  const convertToMp4 = useMediaRecorder((state) => state.convertToMp4);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const activeRecording = useMediaRecorder((state) => state.activeRecording);
  const operation = useMediaRecorder((state) => state.operation);
  const setActiveRecording = useMediaRecorder((state) => state.setActiveRecording);
  const clearActiveRecording = useMediaRecorder((state) => state.clearActiveRecording);
  const setOperation = useMediaRecorder((state) => state.setOperation);
  const { connect, disconnect, statuses } = useRecordingWebSocket();
  const { showToast } = useAppToast();
  const meeting = getMeetingPreview(previewState);
  const recordingSessionId =
    previewState === undefined && activeRecording?.meetingId === meetingId
      ? activeRecording.recordingSessionId
      : null;

  const isWaiting =
    meeting.recordingStatus === 'waiting' && recordingSessionId === null && !isCompleted;
  const isPaused =
    previewState === undefined
      ? recordingSessionId !== null && recorderStatus === 'paused'
      : meeting.recordingStatus === 'paused';
  const isEnding =
    meeting.recordingStatus === 'ending' ||
    (recordingSessionId !== null && operation === 'finishing');
  const socketStatus = recordingSessionId === null ? undefined : statuses[recordingSessionId];
  const isDisconnected =
    meeting.connectionStatus === 'disconnected' ||
    socketStatus === 'error' ||
    socketStatus === 'unconfigured';
  const isRecording =
    (previewState === undefined
      ? recordingSessionId !== null && recorderStatus === 'recording'
      : meeting.recordingStatus === 'recording') &&
    !isDisconnected &&
    !isCompleted;
  const isRecorder = previewRole === 'recorder' || recordingSessionId !== null;
  const isStartingRecording = operation === 'starting';
  const canPauseResumeRecording =
    previewState === undefined &&
    recordingSessionId !== null &&
    socketStatus === 'connected' &&
    (recorderStatus === 'recording' || recorderStatus === 'paused') &&
    !isCompleted &&
    operation === 'idle';

  const handleStartRecording = () => {
    if (!isWaiting || activeRecording || previewState !== undefined || operation !== 'idle') return;
    setIsStartDialogOpen(true);
  };

  const handleStartDialogOpenChange = (open: boolean) => {
    setIsStartDialogOpen(open);
    if (!open) setIsRecordingAcknowledged(false);
  };

  const handleConfirmRecording = async () => {
    if (
      !isWaiting ||
      useMediaRecorder.getState().activeRecording !== null ||
      !isRecordingAcknowledged ||
      useMediaRecorder.getState().operation !== 'idle' ||
      previewState !== undefined
    ) {
      return;
    }

    setOperation('starting');
    try {
      const audioFormat = await prepareMicrophone();

      try {
        const startedSessionId = await startRecording.mutateAsync(meetingId);
        setActiveRecording({
          teamId,
          meetingId,
          recordingSessionId: startedSessionId,
          startedAt: Date.now(),
        });
        connect(startedSessionId, audioFormat);
        handleStartDialogOpenChange(false);
      } catch {
        releaseMicrophone();
        showToast('녹음을 시작하지 못했습니다. 다시 시도해주세요.', 'danger');
      }
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? '마이크 권한을 허용해야 녹음을 시작할 수 있습니다.'
          : '마이크를 사용할 수 없습니다. 장치와 브라우저 권한을 확인해주세요.';
      showToast(message, 'danger');
    } finally {
      setOperation('idle');
    }
  };

  const handleCompleteRecording = async () => {
    if (
      recordingSessionId === null ||
      isCompleted ||
      useMediaRecorder.getState().operation !== 'idle' ||
      previewState !== undefined
    ) {
      return;
    }

    setOperation('finishing');
    const recorder = useMediaRecorder.getState().recorder;
    const wasRecording = recorder?.state === 'recording';

    try {
      if (!recorder || recorder.state === 'inactive') {
        throw new Error('종료할 브라우저 녹음이 없습니다.');
      }

      const recordingBlob = await flushForCompletion();
      await convertToMp4(recordingBlob, `recording-${recordingSessionId}.mp4`);
      await completeRecording.mutateAsync(recordingSessionId);
    } catch {
      if (wasRecording && useMediaRecorder.getState().recorder?.state === 'paused') {
        try {
          resumeBrowserRecording();
        } catch {
          showToast('브라우저 녹음을 다시 시작하지 못했습니다.', 'danger');
        }
      }
      showToast(
        useMediaRecorder.getState().conversionError ??
          '녹음을 종료하지 못했습니다. 다시 시도해주세요.',
        'danger',
      );
      setOperation('idle');
      return;
    }

    try {
      releaseMicrophone();
    } catch {
      showToast('녹음은 종료됐지만 브라우저 녹음 정리에 실패했습니다.', 'danger');
    } finally {
      disconnect(recordingSessionId);
      clearActiveRecording(recordingSessionId);
      setIsCompleted(true);
      setOperation('idle');
    }
  };

  const handlePauseResumeRecording = async () => {
    if (
      !canPauseResumeRecording ||
      recordingSessionId === null ||
      useMediaRecorder.getState().operation !== 'idle'
    )
      return;

    const shouldPause = recorderStatus === 'recording';
    const recorder = useMediaRecorder.getState().recorder;
    if (recorder?.state !== (shouldPause ? 'recording' : 'paused')) {
      showToast('브라우저 녹음 상태를 확인할 수 없습니다.', 'danger');
      return;
    }

    setOperation('updating');
    try {
      await updateRecordingStatus.mutateAsync({
        recordingSessionId,
        status: shouldPause ? 'PAUSED' : 'RECORDING',
      });
    } catch {
      showToast('녹음 상태를 변경하지 못했습니다. 다시 시도해주세요.', 'danger');
      setOperation('idle');
      return;
    }

    try {
      if (shouldPause) pauseBrowserRecording();
      else resumeBrowserRecording();
    } catch {
      showToast('브라우저 녹음 상태를 변경하지 못했습니다.', 'danger');
    } finally {
      setOperation('idle');
    }
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
    isUpdatingRecordingStatus: operation === 'updating',
    canStartRecording:
      isWaiting &&
      activeRecording === null &&
      previewState === undefined &&
      !isStartingRecording &&
      !isStartDialogOpen,
    canPauseResumeRecording,
    canCompleteRecording:
      recordingSessionId !== null &&
      !isCompleted &&
      operation === 'idle' &&
      previewState === undefined,
    setIsRecordingAcknowledged,
    handleStartRecording,
    handleStartDialogOpenChange,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
