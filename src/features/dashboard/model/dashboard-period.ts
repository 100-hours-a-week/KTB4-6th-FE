export interface DashboardDateRange {
  from: string;
  to: string;
}

const KOREA_TIME_ZONE = 'Asia/Seoul';
const DASHBOARD_HISTORY_YEARS = 2;

const toUtcDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toDateString = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getTodayInKorea = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KOREA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts();
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
};

export const addDashboardDays = (date: string, amount: number) => {
  const nextDate = toUtcDate(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + amount);
  return toDateString(nextDate);
};

const subtractDashboardYears = (date: string, amount: number) => {
  const currentDate = toUtcDate(date);
  const targetYear = currentDate.getUTCFullYear() - amount;
  const targetMonth = currentDate.getUTCMonth();
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(currentDate.getUTCDate(), lastDayOfTargetMonth);

  return toDateString(new Date(Date.UTC(targetYear, targetMonth, targetDay)));
};

export const getDailyDashboardRange = (date: string): DashboardDateRange => ({
  from: date,
  to: date,
});

export const getDashboardWeekStart = (date: string) => {
  const weekday = toUtcDate(date).getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;

  return addDashboardDays(date, -daysSinceMonday);
};

export const getWeeklyDashboardRange = (date: string): DashboardDateRange => {
  const from = getDashboardWeekStart(date);

  return { from, to: addDashboardDays(from, 6) };
};

export const getRecentDashboardDateRange = (today: string) => ({
  min: subtractDashboardYears(today, DASHBOARD_HISTORY_YEARS),
  max: today,
});
