'use client';

import { CREATE_MEETING_PURPOSE_MAX_LENGTH } from '@/features/meeting';
import { cn } from '@/shared/lib';

interface MeetingPurposeFieldProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export const MeetingPurposeField = ({
  value,
  error,
  onChange,
  onBlur,
}: MeetingPurposeFieldProps) => (
  <>
    <label className="mt-5 block text-sm font-semibold text-cool-900" htmlFor="meeting-purpose">
      회의 목적
    </label>
    <textarea
      id="meeting-purpose"
      value={value}
      maxLength={CREATE_MEETING_PURPOSE_MAX_LENGTH}
      placeholder="회의 목적을 입력해주세요."
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'mt-2 h-28 w-full resize-none rounded-xl border bg-cool-50 p-4 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600',
        error ? 'border-danger' : 'border-cool-200',
      )}
    />
    <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3 text-xs">
      <p className={error ? 'text-danger' : 'text-cool-500'}>
        {error || '회의에서 다룰 내용을 적어주세요.'}
      </p>
      <span className="shrink-0 text-cool-500">
        {value.length}/{CREATE_MEETING_PURPOSE_MAX_LENGTH}
      </span>
    </div>
  </>
);
