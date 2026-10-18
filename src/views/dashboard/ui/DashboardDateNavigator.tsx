'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';

interface DashboardDateNavigatorProps {
  selectedDate: string;
  today: string;
  minDate: string;
  maxDate: string;
  onSelect: (date: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

interface CalendarCell {
  date: string | null;
  day: number | null;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateValue = (year: number, monthIndex: number, day: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getMonthKey = (date: string) => date.slice(0, 7);

const moveMonth = (monthKey: string, amount: number) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const getAvailableMonths = (minDate: string, maxDate: string) => {
  const months: string[] = [];
  const maxMonth = getMonthKey(maxDate);
  let month = getMonthKey(minDate);

  while (month <= maxMonth) {
    months.push(month);
    month = moveMonth(month, 1);
  }

  return months;
};

const getCalendarCells = (monthKey: string): CalendarCell[] => {
  const [year, month] = monthKey.split('-').map(Number);
  const monthIndex = month - 1;
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: CalendarCell[] = Array.from({ length: firstWeekday }, () => ({
    date: null,
    day: null,
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: formatDateValue(year, monthIndex, day), day });
  }

  return cells;
};

const formatSelectedDate = (date: string, today: string) => {
  const parsed = parseDate(date);
  const month = parsed.getUTCMonth() + 1;
  const day = parsed.getUTCDate();
  const weekday = WEEKDAYS[parsed.getUTCDay()];
  return `${month}월 ${day}일 (${weekday})${date === today ? ' · 오늘' : ''}`;
};

export const DashboardDateNavigator = ({
  selectedDate,
  today,
  minDate,
  maxDate,
  onSelect,
  onPrevious,
  onNext,
}: DashboardDateNavigatorProps) => {
  const frame = useAppFrameElement();
  const [isOpen, setIsOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() => getMonthKey(selectedDate));
  const cells = getCalendarCells(displayedMonth);
  const availableMonths = getAvailableMonths(minDate, maxDate);
  const minMonth = getMonthKey(minDate);
  const maxMonth = getMonthKey(maxDate);
  const [, month] = displayedMonth.split('-').map(Number);
  const canMoveToPreviousMonth = displayedMonth > minMonth;
  const canMoveToNextMonth = displayedMonth < maxMonth;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setDisplayedMonth(getMonthKey(selectedDate));
  };

  const handleDateSelect = (date: string) => {
    onSelect(date);
    setIsOpen(false);
  };

  return (
    <>
      <div className="mx-[-4px] flex min-h-10 items-center justify-between gap-2">
        <button
          type="button"
          aria-label="이전 날짜"
          disabled={selectedDate <= minDate}
          onClick={onPrevious}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cool-100 text-cool-900 transition-colors hover:bg-cool-200 disabled:bg-transparent disabled:text-cool-300"
        >
          <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>

        <button
          type="button"
          aria-label="날짜 선택"
          aria-haspopup="dialog"
          onClick={() => handleOpenChange(true)}
          className="min-h-10 min-w-0 flex-1 rounded-[10px] px-3 text-[14.5px] font-semibold tracking-[-0.01em] whitespace-nowrap text-cool-900 transition-colors hover:bg-cool-100"
        >
          {formatSelectedDate(selectedDate, today)}
        </button>

        <button
          type="button"
          aria-label="다음 날짜"
          disabled={selectedDate >= maxDate}
          onClick={onNext}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cool-100 text-cool-900 transition-colors hover:bg-cool-200 disabled:bg-transparent disabled:text-cool-300"
        >
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </div>

      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal container={frame}>
          <Dialog.Backdrop className="absolute inset-0 z-[85] bg-cool-900/45" />
          <Dialog.Popup className="absolute inset-x-5 top-1/2 z-[90] -translate-y-1/2 rounded-[22px] bg-white px-5 pt-5 pb-4 shadow-[0_20px_48px_rgba(20,34,56,0.24)] outline-none">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-[17px] font-bold tracking-[-0.02em] text-cool-900">
                날짜 선택
              </Dialog.Title>
              <Dialog.Close
                aria-label="날짜 선택 닫기"
                className="flex size-8 items-center justify-center rounded-full text-cool-500 hover:bg-cool-100"
              >
                <X aria-hidden="true" className="size-4.5" strokeWidth={2} />
              </Dialog.Close>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                aria-label="이전 달"
                disabled={!canMoveToPreviousMonth}
                onClick={() => setDisplayedMonth(moveMonth(displayedMonth, -1))}
                className="flex size-9 items-center justify-center rounded-full text-cool-700 hover:bg-cool-100 disabled:text-cool-300"
              >
                <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
              <select
                aria-label="조회 월 선택"
                value={displayedMonth}
                onChange={(event) => setDisplayedMonth(event.target.value)}
                className="rounded-lg bg-transparent px-2 py-1 text-[15px] font-semibold text-cool-900 outline-none hover:bg-cool-100 focus-visible:ring-2 focus-visible:ring-brand-300"
              >
                {availableMonths.map((monthKey) => {
                  const [optionYear, optionMonth] = monthKey.split('-').map(Number);

                  return (
                    <option key={monthKey} value={monthKey}>
                      {optionYear}년 {optionMonth}월
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                aria-label="다음 달"
                disabled={!canMoveToNextMonth}
                onClick={() => setDisplayedMonth(moveMonth(displayedMonth, 1))}
                className="flex size-9 items-center justify-center rounded-full text-cool-700 hover:bg-cool-100 disabled:text-cool-300"
              >
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} className="py-1 text-[12px] font-medium text-cool-500">
                  {weekday}
                </span>
              ))}
              {cells.map((cell, index) => {
                if (!cell.date || !cell.day) {
                  return <span key={`empty-${index}`} aria-hidden="true" className="size-9" />;
                }

                const isAvailable = cell.date >= minDate && cell.date <= maxDate;
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === today;

                return (
                  <button
                    key={cell.date}
                    type="button"
                    disabled={!isAvailable}
                    aria-label={`${month}월 ${cell.day}일${isToday ? ', 오늘' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => handleDateSelect(cell.date!)}
                    className={cn(
                      'mx-auto flex size-9 items-center justify-center rounded-full text-[14px] font-medium transition-colors',
                      isSelected
                        ? 'bg-brand-600 font-semibold text-white'
                        : isAvailable
                          ? 'text-cool-900 hover:bg-cool-100'
                          : 'text-cool-300',
                      isToday && !isSelected && 'ring-1.5 ring-brand-600 ring-inset',
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleDateSelect(today)}
              className="mt-4 h-10 w-full rounded-[10px] bg-brand-50 text-sm font-semibold text-brand-600 hover:bg-brand-100"
            >
              오늘로 이동
            </button>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
