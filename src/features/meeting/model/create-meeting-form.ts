export interface CreateMeetingFormValues {
  title: string;
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

export const INITIAL_CREATE_MEETING_FORM_VALUES: CreateMeetingFormValues = {
  title: '',
  duration: '',
  purpose: '',
  note: '',
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

export const isCreateMeetingFormValid = (values: CreateMeetingFormValues) =>
  !getCreateMeetingTitleError(values.title) &&
  !getCreateMeetingDurationError(values.duration) &&
  !getCreateMeetingPurposeError(values.purpose) &&
  !getCreateMeetingNoteError(values.note);
