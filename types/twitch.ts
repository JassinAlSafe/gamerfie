export interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface TokenResult {
  accessToken: string;
  tokenExpiry: string;
}

export class TwitchError extends Error {
  constructor(
    message: string,
    // eslint-disable-next-line no-unused-vars
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TwitchError';
  }

  getStatusCode(): number {
    return this.statusCode;
  }
}