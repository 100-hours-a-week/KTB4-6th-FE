import type {
  CreditLedgerData,
  CreditLedgerListData,
  CreditLedgerSourceType,
} from '@/features/credit-management';
import { parseServerDate } from '@/shared/lib';

const CREDIT_LEDGER_SOURCE_LABELS: Record<CreditLedgerSourceType, string> = {
  AI_CHAT: 'AI 채팅 질의응답',
  AI_SUMMARY: 'AI 요약 재생성',
  AI_REPORT: 'AI 리포트 생성',
  RECORDING: '회의 진행',
  SCHEDULE: '주간 적립',
  TEAM_CREATE: '팀 생성 적립',
};

const formatCreditAmount = (amount: number) => {
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount.toLocaleString('ko-KR')}`;
};

const creditLedgerDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const formatCreditLedgerDate = (createdAt: string) => {
  const parts = Object.fromEntries(
    creditLedgerDateFormatter
      .formatToParts(parseServerDate(createdAt))
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
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
