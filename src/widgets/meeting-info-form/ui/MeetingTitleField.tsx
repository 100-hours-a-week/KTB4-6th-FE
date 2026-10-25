'use client';

import {
  CREATE_MEETING_TITLE_MAX_LENGTH,
  CREATE_MEETING_TITLE_MIN_LENGTH,
} from '@/features/meeting';
import { cn } from '@/shared/lib';

interface MeetingTitleFieldProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export const MeetingTitleField = ({ value, error, onChange, onBlur }: MeetingTitleFieldProps) => (
  <>
    <label className="block text-sm font-semibold text-cool-900" htmlFor="meeting-title">
      회의 이름
    </label>
    <div className="relative mt-2">
      <input
        id="meeting-title"
        value={value}
        maxLength={CREATE_MEETING_TITLE_MAX_LENGTH}
        placeholder="회의 이름을 입력해주세요"
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-14 w-full rounded-xl border bg-cool-50 px-4 pr-14 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600',
          error ? 'border-danger' : 'border-cool-200',
        )}
      />
      <span className="absolute right-4 bottom-4 text-xs text-cool-500">
        {value.length}/{CREATE_MEETING_TITLE_MAX_LENGTH}
      </span>
    </div>
    <p className={cn('mt-2 min-h-5 text-xs', error ? 'text-danger' : 'text-cool-500')}>
      {error ||
        `${CREATE_MEETING_TITLE_MIN_LENGTH}자 이상 ${CREATE_MEETING_TITLE_MAX_LENGTH}자 이하`}
    </p>
  </>
);
