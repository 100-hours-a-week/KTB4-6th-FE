'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, useAppFrameElement } from '@/shared/lib';

interface ScheduleDatePickerProps {
  id: string;
  value: string;
  today: string;
  triggerClassName: string;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getMonthKey = (date: string) => date.slice(0, 7);

const moveMonth = (monthKey: string, amount: number) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const getCalendarDates = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => `${monthKey}-${String(index + 1).padStart(2, '0')}`,
    ),
  ];
};

export const ScheduleDatePicker = ({
  id,
  value,
  today,
  triggerClassName,
  onSelect,
}: ScheduleDatePickerProps) => {
  const frame = useAppFrameElement();
  const [isOpen, setIsOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(() => getMonthKey(value));
  const [year, month] = displayedMonth.split('-').map(Number);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setDisplayedMonth(getMonthKey(value && value >= today ? value : today));
  };

  const handleSelect = (date: string) => {
    onSelect(date);
    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger id={id} aria-label={`예정 시작 날짜 ${value}`} className={triggerClassName}>
        <span className="whitespace-nowrap">{value.replaceAll('-', '.')}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 shrink-0 text-cool-700 transition-transform group-data-[popup-open]:rotate-180"
          strokeWidth={2}
        />
      </Popover.Trigger>

      <Popover.Portal container={frame}>
        <Popover.Positioner
          className="z-[95] outline-none"
          side="bottom"
          align="start"
          sideOffset={6}
          collisionBoundary={frame ?? undefined}
          collisionPadding={12}
        >
          <Popover.Popup className="w-[280px] rounded-xl border border-cool-100 bg-white p-3 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none">
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="이전 달"
                disabled={displayedMonth <= getMonthKey(today)}
                onClick={() => setDisplayedMonth(moveMonth(displayedMonth, -1))}
                className="flex size-8 items-center justify-center rounded-full text-cool-700 hover:bg-cool-100 disabled:text-cool-300 disabled:hover:bg-transparent"
              >
                <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
              <span className="text-sm font-semibold text-cool-900">
                {year}년 {month}월
              </span>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => setDisplayedMonth(moveMonth(displayedMonth, 1))}
                className="flex size-8 items-center justify-center rounded-full text-cool-700 hover:bg-cool-100"
              >
                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 text-center">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} className="py-1 text-[11px] font-medium text-cool-500">
                  {weekday}
                </span>
              ))}
              {getCalendarDates(displayedMonth).map((date, index) => {
                if (!date) {
                  return <span key={`empty-${index}`} aria-hidden="true" className="size-8" />;
                }

                const day = Number(date.slice(8));
                const isAvailable = date >= today;
                const isSelected = date === value;
                const isToday = date === today;

                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!isAvailable}
                    aria-label={`${month}월 ${day}일${isToday ? ', 오늘' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(date)}
                    className={cn(
                      'mx-auto flex size-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors',
                      isSelected
                        ? 'bg-brand-600 font-semibold text-white'
                        : isAvailable
                          ? 'text-cool-900 hover:bg-cool-100'
                          : 'text-cool-300',
                      isToday && !isSelected && 'ring-1.5 ring-brand-600 ring-inset',
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
