'use client';

import { useId, useState, type FormEvent } from 'react';
import { CUSTOM_NAME_MAX_LENGTH, getCustomAttendeeNameError } from '@/features/meeting';
import { cn } from '@/shared/lib';

interface CustomAttendeeInputProps {
  customNames: string[];
  maxCount: number;
  canAdd: boolean;
  onAdd: (name: string) => void;
}

export const CustomAttendeeInput = ({
  customNames,
  maxCount,
  canAdd,
  onAdd,
}: CustomAttendeeInputProps) => {
  const inputId = useId();
  const errorId = useId();
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isEmpty = name.trim() === '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAdd || isEmpty) return;

    const error = getCustomAttendeeNameError(name, customNames);
    if (error) {
      setErrorMessage(error);
      return;
    }

    onAdd(name);
    setName('');
  };

  return (
    <section className="mt-6 border-t border-cool-100 pt-5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-[15px] font-bold text-cool-900">
          직접 입력
        </label>
        <span className="text-sm text-cool-500 tabular-nums">
          {customNames.length}/{maxCount}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-5 text-cool-500">
        팀에 없는 사람을 추가할 수 있어요.
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          id={inputId}
          value={name}
          maxLength={CUSTOM_NAME_MAX_LENGTH}
          disabled={!canAdd}
          placeholder="이름을 입력해주세요"
          aria-invalid={errorMessage !== ''}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setErrorMessage('');
          }}
          className={cn(
            'h-14 min-w-0 flex-1 rounded-2xl border bg-cool-50 px-4 text-base text-cool-900 outline-none placeholder:text-cool-400 focus:border-brand-400 disabled:opacity-50',
            errorMessage ? 'border-danger' : 'border-cool-200',
          )}
        />
        <button
          type="submit"
          disabled={!canAdd || isEmpty}
          className="h-14 shrink-0 rounded-2xl bg-brand-600 px-5 text-base font-semibold text-white hover:bg-brand-700 disabled:bg-cool-200 disabled:text-cool-500"
        >
          추가
        </button>
      </form>
      {errorMessage && (
        <p id={errorId} className="mt-2 text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </section>
  );
};
