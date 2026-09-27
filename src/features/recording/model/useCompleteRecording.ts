'use client';

import { useMutation } from '@tanstack/react-query';
import { completeRecording } from '../api/complete-recording';

export const useCompleteRecording = () =>
  useMutation({
    mutationFn: completeRecording,
  });
