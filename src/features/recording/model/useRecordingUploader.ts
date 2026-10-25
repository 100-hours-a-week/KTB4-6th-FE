'use client';

import { useEffect } from 'react';
import { resumeRecordingUploads, useRecordingUploadStore } from './recording-uploader';

export const useRecordingUploader = () => {
  useEffect(() => {
    resumeRecordingUploads();
  }, []);

  return useRecordingUploadStore((state) => state.uploadingSessionIds.length > 0);
};
