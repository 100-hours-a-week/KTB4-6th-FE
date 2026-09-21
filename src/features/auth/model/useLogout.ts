'use client';

import { useMutation } from '@tanstack/react-query';
import { requestLogout } from '../api/request-logout';

export const useLogout = () => useMutation({ mutationFn: requestLogout });
