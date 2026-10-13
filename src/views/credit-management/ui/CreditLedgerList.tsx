import type { CreditLedgerViewModel } from '../model/credit-ledger-view';

interface CreditLedgerListProps {
  ledgers: CreditLedgerViewModel[];
}

export const CreditLedgerList = ({ ledgers }: CreditLedgerListProps) => (
  <ul>
    {ledgers.map((ledger) => (
      <li
        key={ledger.id}
        className="flex items-center justify-between gap-4 border-b border-cool-200 px-5 py-4"
      >
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-cool-900">{ledger.title}</p>
          <time dateTime={ledger.createdAt} className="mt-1 block text-[13px] text-cool-500">
            {ledger.createdAtLabel}
          </time>
        </div>
        <div className="shrink-0 text-right">
          <strong
            className={`block text-[15px] font-bold ${ledger.isIncrease ? 'text-brand-600' : 'text-cool-900'}`}
          >
            {ledger.amountLabel}
          </strong>
          <p className="mt-1 text-[13px] text-cool-500">잔액 {ledger.balanceAfterLabel}</p>
        </div>
      </li>
    ))}
  </ul>
);
