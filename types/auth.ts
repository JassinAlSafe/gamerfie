
export interface TokenResponse {
  accessToken: string;
  expiresAt: string;
}

export interface TokenError {
  message: string;
  code?: string;
}