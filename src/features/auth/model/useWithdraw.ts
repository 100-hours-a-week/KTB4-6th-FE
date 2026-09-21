'use client';

import { useMutation } from '@tanstack/react-query';
import { withdraw } from '../api/withdraw';

export const useWithdraw = () => useMutation({ mutationFn: withdraw });
