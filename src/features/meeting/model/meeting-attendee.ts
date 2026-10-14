import { MeetingApiError } from './errors';

export const CUSTOM_NAME_MAX_LENGTH = 8;
export const MEETING_ATTENDEE_MAX_COUNT = 10;
export const CUSTOM_ATTENDEE_MAX_COUNT = 2;

export const getCustomAttendeeNameError = (name: string, addedNames: string[]) => {
  const trimmedName = name.trim();

  if (trimmedName === '') return '이름을 입력해주세요.';
  if (trimmedName.length > CUSTOM_NAME_MAX_LENGTH) {
    return `이름은 ${CUSTOM_NAME_MAX_LENGTH}자 이하로 입력해주세요.`;
  }
  if (addedNames.includes(trimmedName)) return '이미 추가한 이름이에요.';
  return '';
};

export const isInvalidMeetingAttendeeError = (error: unknown) =>
  error instanceof MeetingApiError && error.code === 'INVALID_MEETING_ATTENDEE';
