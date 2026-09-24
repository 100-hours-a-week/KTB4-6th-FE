'use client';

import { useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  CREATE_MEETING_DURATION_MAX_MINUTES,
  CREATE_MEETING_DURATION_MIN_MINUTES,
  CREATE_MEETING_DURATION_OPTIONS,
  CREATE_MEETING_NOTE_MAX_LENGTH,
  CREATE_MEETING_PURPOSE_MAX_LENGTH,
  CREATE_MEETING_TITLE_MAX_LENGTH,
  CREATE_MEETING_TITLE_MIN_LENGTH,
  getCreateMeetingDurationError,
  getCreateMeetingPurposeError,
  getCreateMeetingTitleError,
  INITIAL_CREATE_MEETING_FORM_VALUES,
  isCreateMeetingFormValid,
  type CreateMeetingFormField,
  type CreateMeetingFormValues,
} from '@/features/meeting';
import { cn } from '@/shared/lib';

interface CreateMeetingFormProps {
  formId: string;
  onSubmit?: (values: CreateMeetingFormValues) => void;
  onValidityChange: (isValid: boolean) => void;
}

type CreateMeetingFormTouched = Record<CreateMeetingFormField, boolean>;
type DurationSelection = 'manual' | number | null;

const initialTouched: CreateMeetingFormTouched = {
  title: false,
  duration: false,
  purpose: false,
  note: false,
};

export const CreateMeetingForm = ({
  formId,
  onSubmit,
  onValidityChange,
}: CreateMeetingFormProps) => {
  const [values, setValues] = useState(INITIAL_CREATE_MEETING_FORM_VALUES);
  const [touched, setTouched] = useState(initialTouched);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [durationSelection, setDurationSelection] = useState<DurationSelection>(null);

  const titleError = getCreateMeetingTitleError(values.title);
  const durationError = getCreateMeetingDurationError(values.duration);
  const purposeError = getCreateMeetingPurposeError(values.purpose);
  const durationSelectionLabel =
    durationSelection === 'manual'
      ? '직접 입력'
      : durationSelection === null
        ? '선택'
        : `${durationSelection}분`;

  const updateValue = (field: CreateMeetingFormField, value: string) => {
    const nextValues = { ...values, [field]: value };

    setValues(nextValues);
    onValidityChange(isCreateMeetingFormValid(nextValues));
  };

  const markTouched = (field: CreateMeetingFormField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ title: true, duration: true, purpose: true, note: true });

    if (!isCreateMeetingFormValid(values)) return;

    onSubmit?.(values);
  };

  return (
    <form id={formId} noValidate className="contents" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-cool-900" htmlFor="meeting-title">
        회의 이름
      </label>
      <div className="relative mt-2">
        <input
          id="meeting-title"
          value={values.title}
          maxLength={CREATE_MEETING_TITLE_MAX_LENGTH}
          placeholder="회의 이름을 입력해주세요"
          onBlur={() => markTouched('title')}
          onChange={(event) => updateValue('title', event.target.value)}
          className={cn(
            'h-14 w-full rounded-xl border bg-cool-50 px-4 pr-14 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600',
            touched.title && titleError ? 'border-danger' : 'border-cool-200',
          )}
        />
        <span className="absolute right-4 bottom-4 text-xs text-cool-500">
          {values.title.length}/{CREATE_MEETING_TITLE_MAX_LENGTH}
        </span>
      </div>
      <p
        className={cn(
          'mt-2 min-h-5 text-xs',
          touched.title && titleError ? 'text-danger' : 'text-cool-500',
        )}
      >
        {touched.title && titleError
          ? titleError
          : `${CREATE_MEETING_TITLE_MIN_LENGTH}자 이상 ${CREATE_MEETING_TITLE_MAX_LENGTH}자 이하`}
      </p>

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
            value={values.duration}
            placeholder="직접 입력"
            onBlur={() => markTouched('duration')}
            onChange={(event) => {
              const duration = event.target.value;

              updateValue('duration', duration);
              setDurationSelection(duration === '' ? null : 'manual');
            }}
            className={cn(
              'h-14 w-full rounded-xl border bg-cool-50 px-4 pr-10 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600',
              touched.duration && durationError ? 'border-danger' : 'border-cool-200',
            )}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-cool-500">
            분
          </span>
        </div>
        <button
          type="button"
          aria-expanded={isDurationOpen}
          onClick={() => setIsDurationOpen((open) => !open)}
          className="flex h-14 w-[112px] items-center justify-between rounded-xl border border-cool-200 bg-white px-4 text-sm font-medium text-cool-700"
        >
          {durationSelectionLabel}
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 transition-transform', isDurationOpen && 'rotate-180')}
            strokeWidth={2}
          />
        </button>
      </div>
      {isDurationOpen && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {CREATE_MEETING_DURATION_OPTIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => {
                updateValue('duration', String(duration));
                setDurationSelection(duration);
                markTouched('duration');
                setIsDurationOpen(false);
              }}
              className={cn(
                'h-10 rounded-lg border text-sm font-medium',
                values.duration === String(duration)
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-cool-200 bg-white text-cool-700',
              )}
            >
              {duration}분
            </button>
          ))}
        </div>
      )}
      <p
        className={cn(
          'mt-2 min-h-5 text-xs',
          touched.duration && durationError ? 'text-danger' : 'text-cool-500',
        )}
      >
        {touched.duration && durationError
          ? durationError
          : `${CREATE_MEETING_DURATION_MIN_MINUTES}분에서 ${CREATE_MEETING_DURATION_MAX_MINUTES}분 사이로 입력하거나 선택해주세요.`}
      </p>

      <label className="mt-5 block text-sm font-semibold text-cool-900" htmlFor="meeting-purpose">
        회의 목적
      </label>
      <textarea
        id="meeting-purpose"
        value={values.purpose}
        maxLength={CREATE_MEETING_PURPOSE_MAX_LENGTH}
        placeholder="회의 목적을 입력해주세요."
        onBlur={() => markTouched('purpose')}
        onChange={(event) => updateValue('purpose', event.target.value)}
        className={cn(
          'mt-2 h-28 w-full resize-none rounded-xl border bg-cool-50 p-4 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600',
          touched.purpose && purposeError ? 'border-danger' : 'border-cool-200',
        )}
      />
      <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3 text-xs">
        <p className={touched.purpose && purposeError ? 'text-danger' : 'text-cool-500'}>
          {touched.purpose && purposeError ? purposeError : '회의에서 다룰 내용을 적어주세요.'}
        </p>
        <span className="shrink-0 text-cool-500">
          {values.purpose.length}/{CREATE_MEETING_PURPOSE_MAX_LENGTH}
        </span>
      </div>

      <label className="mt-5 block text-sm font-semibold text-cool-900" htmlFor="meeting-note">
        비고 <span className="font-normal text-cool-500">선택</span>
      </label>
      <textarea
        id="meeting-note"
        value={values.note}
        maxLength={CREATE_MEETING_NOTE_MAX_LENGTH}
        placeholder="추가로 공유할 내용을 입력해주세요."
        onChange={(event) => updateValue('note', event.target.value)}
        className="mt-2 h-28 w-full resize-none rounded-xl border border-cool-200 bg-cool-50 p-4 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600"
      />
      <p className="mt-1.5 text-right text-xs text-cool-500">
        {values.note.length}/{CREATE_MEETING_NOTE_MAX_LENGTH}
      </p>
    </form>
  );
};
