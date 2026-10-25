'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  CREATE_MEETING_DURATION_MAX_MINUTES,
  CREATE_MEETING_DURATION_MIN_MINUTES,
  CREATE_MEETING_DURATION_OPTIONS,
} from '@/features/meeting';
import { cn } from '@/shared/lib';

interface MeetingDurationFieldProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
  onTouch: () => void;
}

type DurationSelection = 'manual' | number | null;

const getInitialDurationSelection = (duration: string): DurationSelection => {
  if (duration === '') return null;

  return (CREATE_MEETING_DURATION_OPTIONS as readonly number[]).includes(Number(duration))
    ? Number(duration)
    : 'manual';
};

export const MeetingDurationField = ({
  value,
  error,
  onChange,
  onTouch,
}: MeetingDurationFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState<DurationSelection>(() =>
    getInitialDurationSelection(value),
  );
  const selectionLabel =
    selection === 'manual' ? '직접 입력' : selection === null ? '선택' : `${selection}분`;

  return (
    <>
      <label className="mt-5 block text-sm font-semibold text-cool-900" htmlFor="meeting-duration">
        목표 시간
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            id="meeting-duration"
            type="number"
            min={CREATE_MEETING_DURATION_MIN_MINUTES}
            max={CREATE_MEETING_DURATION_MAX_MINUTES}
            inputMode="numeric"
            value={value}
            placeholder="직접 입력"
            onBlur={onTouch}
            onChange={(event) => {
              const duration = event.target.value;

              onChange(duration);
              setSelection(duration === '' ? null : 'manual');
            }}
            className={cn(
              'h-14 w-full rounded-xl border bg-cool-50 px-4 pr-10 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600',
              error ? 'border-danger' : 'border-cool-200',
            )}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-cool-500">
            분
          </span>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-14 w-[112px] items-center justify-between rounded-xl border border-cool-200 bg-white px-4 text-sm font-medium text-cool-700"
        >
          {selectionLabel}
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
            strokeWidth={2}
          />
        </button>
      </div>
      {isOpen && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {CREATE_MEETING_DURATION_OPTIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => {
                onChange(String(duration));
                setSelection(duration);
                onTouch();
                setIsOpen(false);
              }}
              className={cn(
                'h-10 rounded-lg border text-sm font-medium',
                value === String(duration)
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-cool-200 bg-white text-cool-700',
              )}
            >
              {duration}분
            </button>
          ))}
        </div>
      )}
      <p className={cn('mt-2 min-h-5 text-xs', error ? 'text-danger' : 'text-cool-500')}>
        {error ||
          `${CREATE_MEETING_DURATION_MIN_MINUTES}분에서 ${CREATE_MEETING_DURATION_MAX_MINUTES}분 사이로 입력하거나 선택해주세요.`}
      </p>
    </>
  );
};
