'use client';

import { useMutation } from '@tanstack/react-query';
import { updateRecordingStatus } from '../api/update-recording-status';

export const useUpdateRecordingStatus = () =>
  useMutation({
    mutationFn: updateRecordingStatus,
  });
