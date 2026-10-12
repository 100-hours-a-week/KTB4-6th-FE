const KST_UTC_OFFSET_HOURS = 9;
const MONDAY = 1;
const DAYS_IN_WEEK = 7;

export const WEEKLY_CREDIT_GRANT_AMOUNT = 200;
export const RECORDING_CREDIT_COST = 20;
export const SUMMARY_REGENERATE_CREDIT_COST = 3;
export const CHAT_CREDIT_COST = 1;

export interface CreditBalancePolicy {
  isFull: boolean;
  progressPercent: number;
  nextGrantAmount: number;
  nextGrantAt: Date;
}

const getNextMondayAtMidnightKst = (now: Date) => {
  const nowInKst = new Date(now.getTime() + KST_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  const currentDay = nowInKst.getUTCDay();
  const daysUntilNextMonday = (MONDAY - currentDay + DAYS_IN_WEEK) % DAYS_IN_WEEK || DAYS_IN_WEEK;

  return new Date(
    Date.UTC(
      nowInKst.getUTCFullYear(),
      nowInKst.getUTCMonth(),
      nowInKst.getUTCDate() + daysUntilNextMonday,
      -KST_UTC_OFFSET_HOURS,
    ),
  );
};

export const getCreditBalancePolicy = (
  balance: number,
  maxBalance: number,
  now = new Date(),
): CreditBalancePolicy => {
  const availableCapacity = Math.max(0, maxBalance - balance);
  const progressPercent =
    maxBalance > 0 ? Math.min(100, Math.max(0, (balance / maxBalance) * 100)) : 0;

  return {
    isFull: availableCapacity === 0,
    progressPercent,
    nextGrantAmount: Math.min(WEEKLY_CREDIT_GRANT_AMOUNT, availableCapacity),
    nextGrantAt: getNextMondayAtMidnightKst(now),
  };
};
