'use client';

import { ChevronDown } from 'lucide-react';
import { getKstToday } from '@/features/meeting';
import { cn } from '@/shared/lib';

type ScheduleField = 'scheduledDate' | 'scheduledTime';

interface MeetingScheduleFieldProps {
  scheduledDate: string;
  scheduledTime: string;
  error: string;
  onChange: (field: ScheduleField, value: string) => void;
}

interface PickerProps {
  id?: string;
  type: 'date' | 'time';
  label?: string;
  value: string;
  displayValue: string;
  min?: string;
  hasError: boolean;
  onChange: (value: string) => void;
}

const openPicker = (input: HTMLInputElement) => {
  try {
    input.showPicker();
  } catch {
    input.focus();
  }
};

const Picker = ({ id, type, label, value, displayValue, min, hasError, onChange }: PickerProps) => (
  <div
    className={cn(
      'relative flex h-14 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border bg-white px-4 transition-colors has-[input:focus-visible]:border-brand-600',
      hasError ? 'border-danger' : 'border-cool-200',
    )}
  >
    <span className="truncate text-base text-cool-900">{displayValue}</span>
    <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-cool-700" strokeWidth={2} />
    <input
      id={id}
      type={type}
      aria-label={label}
      aria-invalid={hasError}
      value={value}
      min={min}
      onClick={(event) => openPicker(event.currentTarget)}
      onChange={(event) => onChange(event.target.value)}
      className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
    />
  </div>
);

export const MeetingScheduleField = ({
  scheduledDate,
  scheduledTime,
  error,
  onChange,
}: MeetingScheduleFieldProps) => (
  <>
    <label
      className="mt-5 block text-sm font-semibold text-cool-900"
      htmlFor="meeting-scheduled-date"
    >
      예정 시작 일시
    </label>
    <div className="mt-2 flex gap-2">
      <Picker
        id="meeting-scheduled-date"
        type="date"
        value={scheduledDate}
        displayValue={scheduledDate.replaceAll('-', '.')}
        min={getKstToday()}
        hasError={error !== ''}
        onChange={(value) => onChange('scheduledDate', value)}
      />
      <Picker
        type="time"
        label="예정 시작 시각"
        value={scheduledTime}
        displayValue={scheduledTime}
        hasError={error !== ''}
        onChange={(value) => onChange('scheduledTime', value)}
      />
    </div>
    <p className={cn('mt-2 min-h-5 text-xs', error ? 'text-danger' : 'text-cool-500')}>
      {error || '회의를 시작할 날짜와 시각을 선택해주세요.'}
    </p>
  </>
);
