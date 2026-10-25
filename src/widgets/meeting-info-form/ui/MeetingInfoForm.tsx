'use client';

import { useState, type FormEvent } from 'react';
import {
  createInitialMeetingFormValues,
  getCreateMeetingDurationError,
  getCreateMeetingPurposeError,
  getCreateMeetingScheduleError,
  getCreateMeetingTitleError,
  isCreateMeetingFormValid,
  type CreateMeetingFormField,
  type CreateMeetingFormValues,
} from '@/features/meeting';
import { MeetingDurationField } from './MeetingDurationField';
import { MeetingNoteField } from './MeetingNoteField';
import { MeetingPurposeField } from './MeetingPurposeField';
import { MeetingScheduleField } from './MeetingScheduleField';
import { MeetingTitleField } from './MeetingTitleField';

interface MeetingInfoFormProps {
  formId: string;
  initialValues?: CreateMeetingFormValues;
  onSubmit?: (values: CreateMeetingFormValues) => void;
  onValidityChange: (isValid: boolean) => void;
}

type CreateMeetingFormTouched = Record<CreateMeetingFormField, boolean>;

const createTouched = (isTouched: boolean): CreateMeetingFormTouched => ({
  title: isTouched,
  scheduledDate: isTouched,
  scheduledTime: isTouched,
  duration: isTouched,
  purpose: isTouched,
  note: isTouched,
});

export const MeetingInfoForm = ({
  formId,
  initialValues,
  onSubmit,
  onValidityChange,
}: MeetingInfoFormProps) => {
  const [values, setValues] = useState(() => initialValues ?? createInitialMeetingFormValues());
  const [touched, setTouched] = useState(() => createTouched(false));

  const titleError = touched.title ? getCreateMeetingTitleError(values.title) : '';
  const scheduleError =
    touched.scheduledDate || touched.scheduledTime
      ? getCreateMeetingScheduleError(values, initialValues)
      : '';
  const durationError = touched.duration ? getCreateMeetingDurationError(values.duration) : '';
  const purposeError = touched.purpose ? getCreateMeetingPurposeError(values.purpose) : '';

  const updateValues = (changes: Partial<CreateMeetingFormValues>) => {
    const nextValues = { ...values, ...changes };

    setValues(nextValues);
    onValidityChange(isCreateMeetingFormValid(nextValues, initialValues));
  };

  const updateValue = (field: CreateMeetingFormField, value: string) =>
    updateValues({ [field]: value });

  const markTouched = (field: CreateMeetingFormField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(createTouched(true));

    if (!isCreateMeetingFormValid(values, initialValues)) return;

    onSubmit?.(values);
  };

  return (
    <form id={formId} noValidate className="contents" onSubmit={handleSubmit}>
      <MeetingTitleField
        value={values.title}
        error={titleError}
        onChange={(value) => updateValue('title', value)}
        onBlur={() => markTouched('title')}
      />
      <MeetingScheduleField
        scheduledDate={values.scheduledDate}
        scheduledTime={values.scheduledTime}
        error={scheduleError}
        onChange={(changes) => {
          updateValues(changes);
          markTouched('scheduledDate');
        }}
      />
      <MeetingDurationField
        value={values.duration}
        error={durationError}
        onChange={(value) => updateValue('duration', value)}
        onTouch={() => markTouched('duration')}
      />
      <MeetingPurposeField
        value={values.purpose}
        error={purposeError}
        onChange={(value) => updateValue('purpose', value)}
        onBlur={() => markTouched('purpose')}
      />
      <MeetingNoteField value={values.note} onChange={(value) => updateValue('note', value)} />
    </form>
  );
};
