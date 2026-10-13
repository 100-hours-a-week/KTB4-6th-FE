import {
  ChartNoAxesColumn,
  CirclePlus,
  FileText,
  MessageSquare,
  Mic,
  type LucideIcon,
} from 'lucide-react';
import type { CreditLedgerSourceType } from '@/features/credit-management';
import { cn } from '@/shared/lib';
import type { CreditLedgerViewModel } from '../model/credit-ledger-view';

const CREDIT_LEDGER_SOURCE_ICONS: Record<
  CreditLedgerSourceType,
  { icon: LucideIcon; className: string }
> = {
  AI_CHAT: { icon: MessageSquare, className: 'bg-brand-100 text-brand-500' },
  AI_SUMMARY: { icon: FileText, className: 'bg-success-bg text-success' },
  AI_REPORT: { icon: ChartNoAxesColumn, className: 'bg-warning-bg text-warning' },
  RECORDING: { icon: Mic, className: 'bg-danger-bg text-danger' },
  SCHEDULE: { icon: CirclePlus, className: 'bg-brand-100 text-brand-600' },
};

interface CreditLedgerListProps {
  ledgers: CreditLedgerViewModel[];
}

export const CreditLedgerList = ({ ledgers }: CreditLedgerListProps) => (
  <ul className="overflow-hidden rounded-[14px] border border-cool-200 bg-white">
    {ledgers.map((ledger) => {
      const { icon: Icon, className: iconClassName } =
        CREDIT_LEDGER_SOURCE_ICONS[ledger.sourceType];

      return (
        <li
          key={ledger.id}
          className="flex items-center gap-3 px-4 py-3.5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-cool-100"
        >
          <span
            className={cn(
              'flex size-[34px] shrink-0 items-center justify-center rounded-[10px]',
              iconClassName,
            )}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] leading-[1.3] font-semibold text-cool-900">
              {ledger.title}
            </p>
            <time
              dateTime={ledger.createdAt}
              className="mt-1 block text-xs leading-[1.3] text-cool-500"
            >
              {ledger.createdAtLabel}
            </time>
          </div>

          <div className="shrink-0 text-right">
            <strong
              className={cn(
                'block text-lg leading-none font-bold',
                ledger.isIncrease ? 'text-brand-600' : 'text-danger',
              )}
            >
              {ledger.amountLabel}
            </strong>
            <p className="mt-1.5 text-xs leading-none text-cool-400">
              잔액 {ledger.balanceAfterLabel}
            </p>
          </div>
        </li>
      );
    })}
  </ul>
);
