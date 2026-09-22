'use client';

import { useMutation } from '@tanstack/react-query';
import { startRecording } from '../api/start-recording';

export const useStartRecording = () =>
  useMutation({
    mutationFn: startRecording,
  });
