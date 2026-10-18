import { addDashboardDays, getDashboardWeekStart } from '@/features/dashboard';

export const DASHBOARD_WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const parseDashboardCalendarDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const getDashboardMonthKey = (date: string) => date.slice(0, 7);

export const moveDashboardMonth = (monthKey: string, amount: number) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const getDashboardAvailableMonths = (minDate: string, maxDate: string) => {
  const months: string[] = [];
  const maxMonth = getDashboardMonthKey(maxDate);
  let month = getDashboardMonthKey(minDate);

  while (month <= maxMonth) {
    months.push(month);
    month = moveDashboardMonth(month, 1);
  }

  return months;
};

export const getDashboardCalendarWeeks = (monthKey: string) => {
  const firstWeekStart = getDashboardWeekStart(`${monthKey}-01`);

  return Array.from({ length: 6 }, (_, weekIndex) => {
    const weekStart = addDashboardDays(firstWeekStart, weekIndex * 7);

    return {
      weekStart,
      days: Array.from({ length: 7 }, (_, dayIndex) => addDashboardDays(weekStart, dayIndex)),
    };
  });
};
