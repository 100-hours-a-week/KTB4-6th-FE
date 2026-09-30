'use client';

import { useMutation } from '@tanstack/react-query';
import { sendBugReport } from '../api/send-bug-report';

export const useSendBugReport = () => useMutation({ mutationFn: sendBugReport });
