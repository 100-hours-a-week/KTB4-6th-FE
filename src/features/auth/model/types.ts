export type OAuthProvider = 'kakao';

export interface OAuthLoginRequest {
  authorizationCode: string;
}

export interface OAuthLoginData {
  userId: number;
  accessToken: string;
  refreshToken: string;
}

export interface OAuthLoginResponse {
  success: boolean;
  data: OAuthLoginData | null;
  error: unknown | null;
}
