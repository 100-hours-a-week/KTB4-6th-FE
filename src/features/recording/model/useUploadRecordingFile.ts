'use client';

import { useMutation } from '@tanstack/react-query';
import {
  createAudioFileUploadUrl,
  type AudioFileUploadTarget,
} from '../api/create-audio-file-upload-url';
import { completeAudioFileUpload } from '../api/complete-audio-file-upload';
import { uploadAudioFile } from '../api/upload-audio-file';

interface UploadRecordingFileParams {
  recordingSessionId: number;
  file: File;
  durationMs: number;
  uploadTarget?: AudioFileUploadTarget;
  onUploadTargetCreated?: (target: AudioFileUploadTarget) => void;
}

const uploadRecordingFile = async ({
  recordingSessionId,
  file,
  durationMs,
  uploadTarget,
  onUploadTargetCreated,
}: UploadRecordingFileParams): Promise<void> => {
  const target = uploadTarget ?? (await createAudioFileUploadUrl(recordingSessionId, file.type));

  if (!uploadTarget) onUploadTargetCreated?.(target);

  await uploadAudioFile(target.uploadUrl, file);
  await completeAudioFileUpload({
    audioFileId: target.audioFileId,
    fileSizeBytes: file.size,
    durationMs,
  });
};

export const useUploadRecordingFile = () =>
  useMutation({
    mutationFn: uploadRecordingFile,
  });
