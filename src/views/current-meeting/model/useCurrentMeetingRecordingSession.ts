'use client';

import { useState } from 'react';
import { useMeetingSse } from '@/features/meeting-sse';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import {
  useCompleteRecording,
  useMediaRecorder,
  useRecordingSessionStore,
  useStartRecording,
  useUpdateRecordingStatus,
  useUploadRecordingFile,
} from '@/features/recording';
import { useAppToast } from '@/shared/ui';

interface UseCurrentMeetingRecordingSessionParams {
  teamId: string;
  meetingId: number;
  isMeetingWaiting: boolean;
  isPreview: boolean;
  previewConnectionStatus: 'connected' | 'disconnected';
  isRecordingAcknowledged: boolean;
  onRecordingStarted: () => void;
}

export type CurrentMeetingConnectionStatus = 'connecting' | 'connected' | 'error';

export const useCurrentMeetingRecordingSession = ({
  teamId,
  meetingId,
  isMeetingWaiting,
  isPreview,
  previewConnectionStatus,
  isRecordingAcknowledged,
  onRecordingStarted,
}: UseCurrentMeetingRecordingSessionParams) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const startRecording = useStartRecording();
  const completeRecording = useCompleteRecording();
  const updateRecordingStatus = useUpdateRecordingStatus();
  const uploadRecordingFile = useUploadRecordingFile();
  const prepareMicrophone = useMediaRecorder((state) => state.prepare);
  const pauseBrowserRecording = useMediaRecorder((state) => state.pause);
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const flushForCompletion = useMediaRecorder((state) => state.flushForCompletion);
  const convertToMp4 = useMediaRecorder((state) => state.convertToMp4);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const recorderStatus = useMediaRecorder((state) => state.status);
  const activeRecording = useRecordingSessionStore((state) => state.activeRecording);
  const pendingUpload = useRecordingSessionStore((state) => state.pendingUpload);
  const operation = useRecordingSessionStore((state) => state.operation);
  const setActiveRecording = useRecordingSessionStore((state) => state.setActiveRecording);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const setPendingUpload = useRecordingSessionStore((state) => state.setPendingUpload);
  const markPendingUploadCompleted = useRecordingSessionStore(
    (state) => state.markPendingUploadCompleted,
  );
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const { statuses: sseStatuses } = useMeetingSse();
  const { connect, disconnect, statuses } = useRecordingWebSocket();
  const { showToast } = useAppToast();

  const recordingSessionId =
    !isPreview && activeRecording?.meetingId === meetingId
      ? activeRecording.recordingSessionId
      : null;
  const sseStatus = sseStatuses[String(meetingId)];
  const socketStatus = recordingSessionId === null ? undefined : statuses[recordingSessionId];
  const hasConnectionError =
    sseStatus === 'error' ||
    sseStatus === 'unconfigured' ||
    socketStatus === 'error' ||
    socketStatus === 'unconfigured';
  const connectionStatus: CurrentMeetingConnectionStatus = isPreview
    ? previewConnectionStatus === 'disconnected'
      ? 'error'
      : 'connected'
    : hasConnectionError
      ? 'error'
      : sseStatus === 'connected' && (recordingSessionId === null || socketStatus === 'connected')
        ? 'connected'
        : 'connecting';
  const isWaiting = isMeetingWaiting && recordingSessionId === null && !isCompleted;
  const isStartingRecording = operation === 'starting';
  const isUploadCompleted =
    pendingUpload?.recordingSessionId === recordingSessionId && pendingUpload.isCompleted;
  const canStartRecording =
    isWaiting &&
    activeRecording === null &&
    !isPreview &&
    connectionStatus === 'connected' &&
    !isStartingRecording;
  const canPauseResumeRecording =
    !isPreview &&
    recordingSessionId !== null &&
    connectionStatus === 'connected' &&
    (recorderStatus === 'recording' || recorderStatus === 'paused') &&
    !isCompleted &&
    !isUploadCompleted &&
    operation === 'idle';
  const canCompleteRecording =
    recordingSessionId !== null && !isCompleted && operation === 'idle' && !isPreview;

  const handleConfirmRecording = async () => {
    if (
      !isWaiting ||
      useRecordingSessionStore.getState().activeRecording !== null ||
      !isRecordingAcknowledged ||
      useRecordingSessionStore.getState().operation !== 'idle' ||
      isPreview
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
        onRecordingStarted();
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
      useRecordingSessionStore.getState().operation !== 'idle' ||
      isPreview
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

      const currentUpload = useRecordingSessionStore.getState().pendingUpload;
      const reusableUpload =
        currentUpload?.recordingSessionId === recordingSessionId ? currentUpload : null;

      if (!reusableUpload?.isCompleted) {
        const recordingBlob = await flushForCompletion();
        const convertedRecording = await convertToMp4(
          recordingBlob,
          `recording-${recordingSessionId}.mp4`,
        );

        await uploadRecordingFile.mutateAsync({
          recordingSessionId,
          ...convertedRecording,
          uploadTarget: reusableUpload ?? undefined,
          onUploadTargetCreated: (target) =>
            setPendingUpload({
              recordingSessionId,
              ...target,
              isCompleted: false,
            }),
        });
        markPendingUploadCompleted(recordingSessionId);
      }

      await completeRecording.mutateAsync(recordingSessionId);
    } catch {
      const currentUpload = useRecordingSessionStore.getState().pendingUpload;
      const uploadCompleted =
        currentUpload?.recordingSessionId === recordingSessionId && currentUpload.isCompleted;

      if (
        !uploadCompleted &&
        wasRecording &&
        useMediaRecorder.getState().recorder?.state === 'paused'
      ) {
        try {
          resumeBrowserRecording();
        } catch {
          showToast('브라우저 녹음을 다시 시작하지 못했습니다.', 'danger');
        }
      }
      showToast(
        useMediaRecorder.getState().conversionError ??
          (uploadCompleted
            ? '녹음을 종료하지 못했습니다. 다시 시도해주세요.'
            : '녹음 파일을 업로드하지 못했습니다. 다시 시도해주세요.'),
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
      useRecordingSessionStore.getState().operation !== 'idle'
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
    recordingSessionId,
    recorderStatus,
    operation,
    connectionStatus,
    isCompleted,
    isStartingRecording,
    canStartRecording,
    canPauseResumeRecording,
    canCompleteRecording,
    handleConfirmRecording,
    handlePauseResumeRecording,
    handleCompleteRecording,
  };
};
