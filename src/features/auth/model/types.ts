export type OAuthProvider = 'kakao';

export interface OAuthLoginRequest {
  authorizationCode: string;
}

export interface OAuthLoginData {
  userId: number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface OAuthLoginResponse {
  success: boolean;
  data: OAuthLoginData | null;
  error: unknown | null;
}

export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  data: unknown | null;
  error: unknown | null;
}
