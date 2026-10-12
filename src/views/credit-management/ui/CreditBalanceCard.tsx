import { getCreditBalancePolicy } from '@/features/credit-management';
import { CreditPolicyPopover } from './CreditPolicyPopover';

interface CreditBalanceCardProps {
  balance: number;
  maxBalance: number;
}

const nextGrantDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
});

const formatNextGrantAt = (date: Date) => {
  const parts = nextGrantDateFormatter.formatToParts(date);
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  const weekday = parts.find((part) => part.type === 'weekday')?.value;

  return `${month}.${day}(${weekday}) 00:00`;
};

export const CreditBalanceCard = ({ balance, maxBalance }: CreditBalanceCardProps) => {
  const { isFull, progressPercent, nextGrantAmount, nextGrantAt } = getCreditBalancePolicy(
    balance,
    maxBalance,
  );

  return (
    <section className="rounded-2xl bg-brand-600 px-5 py-6 text-white shadow-[0_8px_20px_rgba(47,76,116,0.22)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <h2 className="text-sm font-semibold text-brand-100">팀 크레딧</h2>
          <CreditPolicyPopover maxBalance={maxBalance} />
        </div>
        {isFull && (
          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-brand-600">
            최대 보유
          </span>
        )}
      </div>

      <div className="mt-7 flex items-baseline gap-1.5">
        <strong className="text-[38px] leading-none font-semibold tracking-tight">
          {balance.toLocaleString('ko-KR')}
        </strong>
        <span className="text-base font-medium text-brand-200">
          / {maxBalance.toLocaleString('ko-KR')}
        </span>
      </div>

      <div className="mt-7">
        <div
          role="progressbar"
          aria-label="크레딧 보유량"
          aria-valuemin={0}
          aria-valuemax={maxBalance}
          aria-valuenow={Math.min(maxBalance, Math.max(0, balance))}
          className="h-1.5 overflow-hidden rounded-full bg-brand-500"
        >
          <div
            className="h-full rounded-full bg-white transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2.5 text-[13px] leading-5 text-brand-100">
          {isFull
            ? '사용한 만큼만 채워집니다'
            : `${formatNextGrantAt(nextGrantAt)}에 ${nextGrantAmount.toLocaleString('ko-KR')} 크레딧이 적립돼요`}
        </p>
      </div>
    </section>
  );
};
