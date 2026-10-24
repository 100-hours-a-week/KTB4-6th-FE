import { parseServerDate } from '@/shared/lib';
import type { MeetingInfoRequest, MeetingUpdateRequest } from './types';

export interface CreateMeetingFormValues {
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  purpose: string;
  note: string;
}

export type CreateMeetingFormField = keyof CreateMeetingFormValues;

export const CREATE_MEETING_TITLE_MIN_LENGTH = 2;
export const CREATE_MEETING_TITLE_MAX_LENGTH = 20;
export const CREATE_MEETING_PURPOSE_MAX_LENGTH = 100;
export const CREATE_MEETING_NOTE_MAX_LENGTH = 200;
export const CREATE_MEETING_DURATION_MIN_MINUTES = 5;
export const CREATE_MEETING_DURATION_MAX_MINUTES = 60;
export const CREATE_MEETING_DURATION_OPTIONS = [15, 30, 45, 60] as const;
export const CREATE_MEETING_SCHEDULE_STEP_MINUTES = 10;

const kstDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const toKstSchedule = (date: Date) => {
  const parts = Object.fromEntries(
    kstDateTimeFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return {
    scheduledDate: `${parts.year}-${parts.month}-${parts.day}`,
    scheduledTime: `${parts.hour}:${parts.minute}`,
  };
};

export const getKstToday = () => toKstSchedule(new Date()).scheduledDate;

export const toScheduleFormValues = (scheduledAt: string) => ({
  scheduledDate: scheduledAt.slice(0, 10),
  scheduledTime: scheduledAt.slice(11, 16),
});

const toScheduledAt = ({ scheduledDate, scheduledTime }: CreateMeetingFormValues) =>
  `${scheduledDate}T${scheduledTime}:00`;

const isScheduleUnchanged = (
  values: CreateMeetingFormValues,
  savedValues: CreateMeetingFormValues | undefined,
) =>
  savedValues !== undefined &&
  values.scheduledDate === savedValues.scheduledDate &&
  values.scheduledTime === savedValues.scheduledTime;

export const createInitialMeetingFormValues = (): CreateMeetingFormValues => {
  const stepMs = CREATE_MEETING_SCHEDULE_STEP_MINUTES * 60_000;
  const nextSlot = new Date((Math.floor(Date.now() / stepMs) + 1) * stepMs);

  return {
    title: '',
    ...toKstSchedule(nextSlot),
    duration: '',
    purpose: '',
    note: '',
  };
};

export const getCreateMeetingTitleError = (title: string) => {
  const length = title.trim().length;

  if (length === 0) return '회의 이름을 입력해주세요.';
  if (length < CREATE_MEETING_TITLE_MIN_LENGTH) {
    return `회의 이름은 ${CREATE_MEETING_TITLE_MIN_LENGTH}자 이상 입력해주세요.`;
  }
  if (length > CREATE_MEETING_TITLE_MAX_LENGTH) {
    return `회의 이름은 ${CREATE_MEETING_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`;
  }
  return '';
};

export const getCreateMeetingScheduleError = (
  values: CreateMeetingFormValues,
  savedValues?: CreateMeetingFormValues,
) => {
  if (values.scheduledDate === '' || values.scheduledTime === '') {
    return '예정 시작 일시를 선택해주세요.';
  }
  if (isScheduleUnchanged(values, savedValues)) return '';
  if (parseServerDate(toScheduledAt(values)).getTime() <= Date.now()) {
    return '현재 시각 이후로 선택해주세요.';
  }
  return '';
};

export const getCreateMeetingDurationError = (duration: string) => {
  const value = Number(duration);

  if (duration === '') return '목표 시간을 입력하거나 선택해주세요.';
  if (
    !Number.isInteger(value) ||
    value < CREATE_MEETING_DURATION_MIN_MINUTES ||
    value > CREATE_MEETING_DURATION_MAX_MINUTES
  ) {
    return `목표 시간은 ${CREATE_MEETING_DURATION_MIN_MINUTES}분에서 ${CREATE_MEETING_DURATION_MAX_MINUTES}분 사이로 입력해주세요.`;
  }
  return '';
};

export const getCreateMeetingPurposeError = (purpose: string) => {
  const length = purpose.trim().length;

  if (length === 0) return '회의 목적을 입력해주세요.';
  if (length > CREATE_MEETING_PURPOSE_MAX_LENGTH) {
    return `회의 목적은 ${CREATE_MEETING_PURPOSE_MAX_LENGTH}자 이하로 입력해주세요.`;
  }
  return '';
};

export const getCreateMeetingNoteError = (note: string) =>
  note.length > CREATE_MEETING_NOTE_MAX_LENGTH
    ? `비고는 ${CREATE_MEETING_NOTE_MAX_LENGTH}자 이하로 입력해주세요.`
    : '';

export const isCreateMeetingFormValid = (
  values: CreateMeetingFormValues,
  savedValues?: CreateMeetingFormValues,
) =>
  !getCreateMeetingTitleError(values.title) &&
  !getCreateMeetingScheduleError(values, savedValues) &&
  !getCreateMeetingDurationError(values.duration) &&
  !getCreateMeetingPurposeError(values.purpose) &&
  !getCreateMeetingNoteError(values.note);

export const toMeetingInfoRequest = (values: CreateMeetingFormValues): MeetingInfoRequest => ({
  title: values.title.trim(),
  purpose: values.purpose.trim(),
  note: values.note.trim(),
  scheduledAt: toScheduledAt(values),
  targetDurationMinutes: Number(values.duration),
});

export const toMeetingUpdateRequest = (
  values: CreateMeetingFormValues,
  savedValues: CreateMeetingFormValues,
): MeetingUpdateRequest => {
  const { scheduledAt, ...request } = toMeetingInfoRequest(values);

  return isScheduleUnchanged(values, savedValues) ? request : { ...request, scheduledAt };
};
