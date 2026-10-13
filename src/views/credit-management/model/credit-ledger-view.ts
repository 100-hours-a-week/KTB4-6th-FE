import type {
  CreditLedgerData,
  CreditLedgerListData,
  CreditLedgerSourceType,
} from '@/features/credit-management';

const CREDIT_LEDGER_SOURCE_LABELS: Record<CreditLedgerSourceType, string> = {
  AI_CHAT: 'AI 채팅 질의응답',
  AI_SUMMARY: 'AI 요약 재생성',
  AI_REPORT: 'AI 리포트 생성',
  RECORDING: '회의 진행',
  SCHEDULE: '주간 적립',
};

const formatCreditAmount = (amount: number) => {
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount.toLocaleString('ko-KR')}`;
};

const formatCreditLedgerDate = (createdAt: string) => {
  const date = new Date(createdAt);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${month}.${day} ${hour}:${minute}`;
};

export interface CreditLedgerViewModel {
  id: number;
  sourceType: CreditLedgerSourceType;
  title: string;
  amountLabel: string;
  balanceAfterLabel: string;
  createdAt: string;
  createdAtLabel: string;
  isIncrease: boolean;
}

const toCreditLedgerViewModel = (ledger: CreditLedgerData): CreditLedgerViewModel => ({
  id: ledger.ledgerId,
  sourceType: ledger.sourceType,
  title: `${CREDIT_LEDGER_SOURCE_LABELS[ledger.sourceType]}${ledger.type === 'RESTORE' ? ' 복구' : ''}`,
  amountLabel: formatCreditAmount(ledger.amount),
  balanceAfterLabel: ledger.balanceAfter.toLocaleString('ko-KR'),
  createdAt: ledger.createdAt,
  createdAtLabel: formatCreditLedgerDate(ledger.createdAt),
  isIncrease: ledger.amount > 0,
});

export const toCreditLedgerViewModels = (pages: CreditLedgerListData[]) =>
  pages.flatMap((page) => page.ledgers.map(toCreditLedgerViewModel));
