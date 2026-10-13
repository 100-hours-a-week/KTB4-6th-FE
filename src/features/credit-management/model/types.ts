export type CreditLedgerType = 'EARN' | 'USE' | 'RESTORE';

export type CreditLedgerSourceType =
  'AI_CHAT' | 'AI_SUMMARY' | 'AI_REPORT' | 'RECORDING' | 'SCHEDULE';

export interface CreditLedgerData {
  ledgerId: number;
  type: CreditLedgerType;
  sourceType: CreditLedgerSourceType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export interface CreditLedgerListData {
  ledgers: CreditLedgerData[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface CreditLedgerListParams {
  cursor?: number;
  size?: number;
}

interface CreditLedgerApiErrorPayload {
  code: string;
  message: string;
}

export interface CreditLedgerListResponse {
  success: boolean;
  data: CreditLedgerListData | null;
  error: CreditLedgerApiErrorPayload | null;
}
