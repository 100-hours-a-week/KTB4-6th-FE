'use client';

import {
  flushRecordingChunks,
  readOpfsPartFilesInOrder,
  removeOpfsPartFiles,
  useCompleteRecording,
  useMediaRecorder,
  useRecordingSessionStore,
  useUploadRecordingFile,
} from '@/features/recording';
import { useRecordingWebSocket } from '@/features/recording-websocket';
import { useAppToast } from '@/shared/ui';

interface UseCompleteRecordingFlowParams {
  recordingSessionId: number | null;
  isCompleted: boolean;
  isPreview: boolean;
  onCompleted: () => void;
}

/** 녹음 마무리 → mp4 변환 → 파일 업로드 → 녹음 종료 요청 → 마이크·소켓 정리 순서로 회의를 종료한다. */
export const useCompleteRecordingFlow = ({
  recordingSessionId,
  isCompleted,
  isPreview,
  onCompleted,
}: UseCompleteRecordingFlowParams) => {
  const completeRecording = useCompleteRecording();
  const uploadRecordingFile = useUploadRecordingFile();
  const resumeBrowserRecording = useMediaRecorder((state) => state.resume);
  const flushForCompletion = useMediaRecorder((state) => state.flushForCompletion);
  const convertToMp4 = useMediaRecorder((state) => state.convertToMp4);
  const releaseMicrophone = useMediaRecorder((state) => state.release);
  const clearActiveRecording = useRecordingSessionStore((state) => state.clearActiveRecording);
  const setPendingUpload = useRecordingSessionStore((state) => state.setPendingUpload);
  const markPendingUploadCompleted = useRecordingSessionStore(
    (state) => state.markPendingUploadCompleted,
  );
  const setOperation = useRecordingSessionStore((state) => state.setOperation);
  const { disconnect } = useRecordingWebSocket();
  const { showToast } = useAppToast();

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
        // 마지막 chunk까지 recorder에서 흘려보내고(반환 Blob은 안 씀), OPFS에 그 chunk까지
        // 쓰기가 끝날 때까지 기다린 다음, 세션 전체의 part 파일을 순서대로 읽어 합친다.
        await flushForCompletion();
        await flushRecordingChunks();
        const parts = await readOpfsPartFilesInOrder(recordingSessionId);
        if (parts.length === 0) throw new Error('저장된 녹음 파일이 없습니다.');

        const convertedRecording = await convertToMp4(parts, `recording-${recordingSessionId}.mp4`);

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
        await removeOpfsPartFiles(recordingSessionId).catch(() => {
          // OPFS 정리 실패는 회의 종료 자체를 막을 이유가 아니다.
        });
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
            ? '회의를 종료하지 못했습니다. 다시 시도해주세요.'
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
      onCompleted();
      setOperation('idle');
    }
  };

  return handleCompleteRecording;
};
