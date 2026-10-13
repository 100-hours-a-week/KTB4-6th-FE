import { apiClient } from '@/shared/api';
import type {
  CreditLedgerListData,
  CreditLedgerListParams,
  CreditLedgerListResponse,
} from '../model/types';

const DEFAULT_CREDIT_LEDGER_PAGE_SIZE = 10;

export const getCreditLedgers = async (
  teamId: number,
  params: CreditLedgerListParams = {},
  signal?: AbortSignal,
): Promise<CreditLedgerListData> => {
  const { cursor, size = DEFAULT_CREDIT_LEDGER_PAGE_SIZE } = params;
  const response = await apiClient.get<CreditLedgerListResponse>(
    `/api/v1/teams/${teamId}/credit-ledgers`,
    { params: { cursor, size }, signal },
  );
  const result = response.data;

  if (!result.success || !result.data) {
    throw new Error('크레딧 원장을 조회하지 못했습니다.');
  }

  return result.data;
};
