'use client';

import { flushRecordingChunks } from './useRecordingChunkBuffer';
import { readOpfsPartFilesInOrder, removeOpfsPartFiles } from './opfs-recording-parts';
import { useMediaRecorder } from './useMediaRecorder';
import { useRecordingSessionStore } from './useRecordingSessionStore';
import { useUploadRecordingFile } from './useUploadRecordingFile';

/**
 * OPFS에 쌓인 이 세션의 part 파일들을 번호 순서대로 읽어 병합·변환한 뒤 업로드하고,
 * 성공하면 part 파일을 정리한다.
 *
 * recorder가 살아있는지는 신경 쓰지 않는다 — 살아있는 recorder에서 마지막 chunk까지
 * 마저 흘려보내야 하는지(회의를 정상 종료하는 경우)는 호출하는 쪽 책임이고, 이미
 * 업로드가 끝났는지 확인해 다시 부를지 말지 정하는 것도 호출하는 쪽 책임이다.
 */
export const useUploadPendingRecordingParts = () => {
  const convertToMp4 = useMediaRecorder((state) => state.convertToMp4);
  const uploadRecordingFile = useUploadRecordingFile();
  const setPendingUpload = useRecordingSessionStore((state) => state.setPendingUpload);
  const markPendingUploadCompleted = useRecordingSessionStore(
    (state) => state.markPendingUploadCompleted,
  );

  return async (recordingSessionId: number) => {
    const currentUpload = useRecordingSessionStore.getState().pendingUpload;
    const reusableUpload =
      currentUpload?.recordingSessionId === recordingSessionId ? currentUpload : null;

    // 지금까지 예약된 OPFS 쓰기가 전부 끝날 때까지 기다린 다음 세션 전체의 part 파일을 읽는다.
    await flushRecordingChunks();
    // recorder만 만들어지고 chunk가 하나도 안 쓰인 part는 0바이트로 남는다(재연결 실패 등).
    // 빈 파일이 하나라도 섞이면 ffmpeg 병합이 통째로 실패하므로 여기서 걸러낸다.
    const parts = (await readOpfsPartFilesInOrder(recordingSessionId)).filter(
      (part) => part.size > 0,
    );
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
  };
};
