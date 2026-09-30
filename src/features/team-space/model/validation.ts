const INVITE_CODE_PATTERN = /^[A-Za-z0-9]+$/;
const NAME_PATTERN = /^[A-Za-z0-9가-힣]+$/;

export const INVITE_CODE_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 10;

export const getInviteCodeError = (value: string) => {
  if (!value) {
    return '초대 코드를 입력해주세요.';
  }

  if (!INVITE_CODE_PATTERN.test(value)) {
    return '공백 및 특수문자는 입력할 수 없습니다.';
  }

  if (value.length !== INVITE_CODE_LENGTH) {
    return '초대 코드는 8자리입니다.';
  }

  return null;
};

export const getNameError = (value: string, field: 'team' | 'nickname') => {
  if (!value) {
    return field === 'team' ? '팀 이름을 입력해주세요.' : '사용자 이름을 입력해주세요.';
  }

  if (!NAME_PATTERN.test(value)) {
    return '한글, 영문, 숫자만 사용할 수 있습니다.';
  }

  if (value.length < NAME_MIN_LENGTH) {
    return '2자 이상으로 입력해주세요.';
  }

  if (value.length > NAME_MAX_LENGTH) {
    return '10자 이하로 입력해주세요.';
  }

  return null;
};
