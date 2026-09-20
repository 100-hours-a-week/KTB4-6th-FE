'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib';

interface OnboardingTextFieldProps {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  errorMessage: string | null;
  helperText: string;
  id: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder: string;
  /** 서버 응답 오류처럼 입력 상호작용 여부와 무관하게 바로 노출할 메시지. */
  submitError?: string | null;
  value: string;
}

export const OnboardingTextField = ({
  autoCapitalize = 'none',
  errorMessage,
  helperText,
  id,
  maxLength,
  onChange,
  placeholder,
  submitError = null,
  value,
}: OnboardingTextFieldProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const visibleError = submitError ?? (hasInteracted ? errorMessage : null);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={Boolean(visibleError)}
        aria-describedby={`${id}-message ${id}-count`}
        placeholder={placeholder}
        onBlur={() => setHasInteracted(true)}
        onChange={(event) => {
          setHasInteracted(true);
          onChange(event.target.value);
        }}
        className={cn(
          'h-[84px] w-full rounded-2xl border bg-cool-50 px-4 text-xl font-semibold text-cool-900 outline-none transition-colors',
          'placeholder:font-medium placeholder:text-cool-500 focus:border-brand-500 focus:ring-3 focus:ring-brand-100',
          visibleError && 'border-danger text-danger focus:border-danger focus:ring-danger-bg',
        )}
      />
      <div className="mt-3 flex min-h-5 items-start justify-between gap-3 text-sm">
        <p
          id={`${id}-message`}
          aria-live="polite"
          className={visibleError ? 'text-danger' : 'text-cool-500'}
        >
          {visibleError ?? helperText}
        </p>
        <span id={`${id}-count`} className="shrink-0 font-mono text-cool-500">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};
