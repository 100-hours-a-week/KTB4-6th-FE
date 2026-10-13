import type {
  CreditLedgerData,
  CreditLedgerListData,
  CreditLedgerSourceType,
  CreditLedgerType,
} from '@/features/credit-management';

const CREDIT_LEDGER_TYPE_LABELS: Record<CreditLedgerType, string> = {
  EARN: '적립',
  USE: '사용',
  RESTORE: '복구',
};

const CREDIT_LEDGER_SOURCE_LABELS: Record<CreditLedgerSourceType, string> = {
  AI_CHAT: 'AI 채팅',
  AI_SUMMARY: 'AI 요약',
  AI_REPORT: 'AI 리포트',
  RECORDING: '회의 녹음',
  SCHEDULE: '정기 크레딧',
};

const creditLedgerDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const formatCreditAmount = (amount: number) => {
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount.toLocaleString('ko-KR')}`;
};

export interface CreditLedgerViewModel {
  id: number;
  title: string;
  amountLabel: string;
  balanceAfterLabel: string;
  createdAt: string;
  createdAtLabel: string;
  isIncrease: boolean;
}

const toCreditLedgerViewModel = (ledger: CreditLedgerData): CreditLedgerViewModel => ({
  id: ledger.ledgerId,
  title: `${CREDIT_LEDGER_SOURCE_LABELS[ledger.sourceType]} ${CREDIT_LEDGER_TYPE_LABELS[ledger.type]}`,
  amountLabel: formatCreditAmount(ledger.amount),
  balanceAfterLabel: ledger.balanceAfter.toLocaleString('ko-KR'),
  createdAt: ledger.createdAt,
  createdAtLabel: creditLedgerDateFormatter.format(new Date(ledger.createdAt)),
  isIncrease: ledger.amount > 0,
});

export const toCreditLedgerViewModels = (pages: CreditLedgerListData[]) =>
  pages.flatMap((page) => page.ledgers.map(toCreditLedgerViewModel));
