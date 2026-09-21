import { apiClient } from '@/shared/api';

import { toWithdrawApiError } from '../model/errors';

export const withdraw = async (): Promise<void> => {
  try {
    await apiClient.delete('/api/v1/users/me');
  } catch (error) {
    throw toWithdrawApiError(error);
  }
};
