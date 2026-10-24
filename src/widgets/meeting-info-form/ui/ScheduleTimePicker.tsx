'use client';

import { useRef, useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { ChevronDown } from 'lucide-react';
import { CREATE_MEETING_SCHEDULE_STEP_MINUTES } from '@/features/meeting';
import { cn, useAppFrameElement } from '@/shared/lib';

interface ScheduleTimePickerProps {
  value: string;
  minTime: string | null;
  triggerClassName: string;
  onSelect: (time: string) => void;
}

type Period = '오전' | '오후';

interface TimeParts {
  period: Period;
  hour: number;
  minute: number;
}

const PERIODS: Period[] = ['오전', '오후'];
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from(
  { length: 60 / CREATE_MEETING_SCHEDULE_STEP_MINUTES },
  (_, index) => index * CREATE_MEETING_SCHEDULE_STEP_MINUTES,
);

const pad = (value: number) => String(value).padStart(2, '0');

const toTimeParts = (time: string): TimeParts => {
  const [hour24, minute] = time.split(':').map(Number);
  return { period: hour24 < 12 ? '오전' : '오후', hour: hour24 % 12 || 12, minute };
};

const toTime = ({ period, hour, minute }: TimeParts) =>
  `${pad((hour % 12) + (period === '오후' ? 12 : 0))}:${pad(minute)}`;

const ALL_TIMES = Array.from({ length: 24 * MINUTES.length }, (_, index) =>
  toTime({
    period: index < 12 * MINUTES.length ? '오전' : '오후',
    hour: Math.floor(index / MINUTES.length) % 12 || 12,
    minute: MINUTES[index % MINUTES.length],
  }),
);

const formatTime = (time: string) => {
  const { period, hour, minute } = toTimeParts(time);
  return `${period} ${hour}:${pad(minute)}`;
};

interface TimeColumnProps<T> {
  label: string;
  options: T[];
  selected: T;
  format: (option: T) => string;
  isDisabled: (option: T) => boolean;
  onSelect: (option: T) => void;
}

const TimeColumn = <T extends string | number>({
  label,
  options,
  selected,
  format,
  isDisabled,
  onSelect,
}: TimeColumnProps<T>) => (
  <div
    role="group"
    aria-label={label}
    className="relative flex max-h-[200px] w-14 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {options.map((option) => (
      <button
        key={option}
        type="button"
        disabled={isDisabled(option)}
        aria-pressed={option === selected}
        onClick={() => onSelect(option)}
        className={cn(
          'h-9 shrink-0 rounded-lg text-[15px] transition-colors',
          option === selected
            ? 'bg-brand-50 font-semibold text-brand-700'
            : 'text-cool-900 hover:bg-cool-50 disabled:text-cool-300 disabled:hover:bg-transparent',
        )}
      >
        {format(option)}
      </button>
    ))}
  </div>
);

export const ScheduleTimePicker = ({
  value,
  minTime,
  triggerClassName,
  onSelect,
}: ScheduleTimePickerProps) => {
  const frame = useAppFrameElement();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const current = toTimeParts(value);

  const findTime = (changes: Partial<TimeParts>) => {
    const preferred = toTime({ ...current, ...changes });
    const isAvailable = (time: string) => minTime === null || time > minTime;

    if (isAvailable(preferred)) return preferred;

    return (
      ALL_TIMES.find((time) => {
        const parts = toTimeParts(time);
        return (
          isAvailable(time) &&
          Object.entries(changes).every(([key, part]) => parts[key as keyof TimeParts] === part)
        );
      }) ?? null
    );
  };

  const select = (changes: Partial<TimeParts>) => {
    const time = findTime(changes);
    if (time) onSelect(time);
  };

  const centerSelectedOptions = () => {
    const columns = popupRef.current?.querySelectorAll<HTMLElement>('[role="group"]') ?? [];
    const selectedOptions = [...columns].map((column) => {
      const option = column.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (option) {
        column.scrollTop = option.offsetTop - (column.clientHeight - option.offsetHeight) / 2;
      }
      return option;
    });

    return selectedOptions[1] ?? true;
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        aria-label={`예정 시작 시각 ${formatTime(value)}`}
        className={triggerClassName}
      >
        <span className="whitespace-nowrap">{formatTime(value)}</span>
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
          align="end"
          sideOffset={6}
          collisionBoundary={frame ?? undefined}
          collisionPadding={12}
        >
          <Popover.Popup
            ref={popupRef}
            initialFocus={centerSelectedOptions}
            className="flex gap-1 rounded-xl border border-cool-100 bg-white p-1.5 shadow-[0_8px_24px_rgba(20,34,56,0.12)] outline-none"
          >
            <TimeColumn
              label="오전 오후"
              options={PERIODS}
              selected={current.period}
              format={(period) => period}
              isDisabled={(period) => findTime({ period }) === null}
              onSelect={(period) => select({ period })}
            />
            <TimeColumn
              label="시"
              options={HOURS}
              selected={current.hour}
              format={String}
              isDisabled={(hour) => findTime({ period: current.period, hour }) === null}
              onSelect={(hour) => select({ period: current.period, hour })}
            />
            <TimeColumn
              label="분"
              options={MINUTES}
              selected={current.minute}
              format={pad}
              isDisabled={(minute) =>
                findTime({ period: current.period, hour: current.hour, minute }) === null
              }
              onSelect={(minute) => select({ period: current.period, hour: current.hour, minute })}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
