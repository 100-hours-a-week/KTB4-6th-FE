'use client';

import { getKstNowSchedule, getNextScheduleSlot } from '@/features/meeting';
import { cn } from '@/shared/lib';
import { ScheduleDatePicker } from './ScheduleDatePicker';
import { ScheduleTimePicker } from './ScheduleTimePicker';

interface ScheduleValues {
  scheduledDate: string;
  scheduledTime: string;
}

interface MeetingScheduleFieldProps extends ScheduleValues {
  error: string;
  onChange: (changes: Partial<ScheduleValues>) => void;
}

export const MeetingScheduleField = ({
  scheduledDate,
  scheduledTime,
  error,
  onChange,
}: MeetingScheduleFieldProps) => {
  const now = getKstNowSchedule();
  const minTime = scheduledDate === now.scheduledDate ? now.scheduledTime : null;
  const triggerClassName = cn(
    'group flex h-14 items-center justify-between gap-2 rounded-xl border bg-white px-4 text-base text-cool-900 transition-colors outline-none focus-visible:border-brand-600 data-[popup-open]:border-brand-600',
    error ? 'border-danger' : 'border-cool-200',
  );

  return (
    <>
      <label
        className="mt-5 block text-sm font-semibold text-cool-900"
        htmlFor="meeting-scheduled-date"
      >
        예정 시작 일시
      </label>
      <div className="mt-2 flex gap-2">
        <ScheduleDatePicker
          id="meeting-scheduled-date"
          value={scheduledDate}
          today={now.scheduledDate}
          triggerClassName={cn(triggerClassName, 'min-w-0 flex-1')}
          onSelect={(date) =>
            onChange(
              date === now.scheduledDate && scheduledTime <= now.scheduledTime
                ? getNextScheduleSlot()
                : { scheduledDate: date },
            )
          }
        />
        <ScheduleTimePicker
          value={scheduledTime}
          minTime={minTime}
          triggerClassName={cn(triggerClassName, 'w-[136px] shrink-0')}
          onSelect={(time) => onChange({ scheduledTime: time })}
        />
      </div>
      <p className={cn('mt-2 min-h-5 text-xs', error ? 'text-danger' : 'text-cool-500')}>
        {error || '회의를 시작할 날짜와 시각을 선택해주세요.'}
      </p>
    </>
  );
};
