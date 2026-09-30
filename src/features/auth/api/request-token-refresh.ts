import axios from 'axios';

export const requestTokenRefresh = async (): Promise<void> => {
  // 재발급 요청은 인증 재시도 interceptor가 없는 Axios로 호출
  await axios.post('/api/auth/token/refresh', undefined, {
    withCredentials: true,
  });
};
