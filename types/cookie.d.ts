// types/cookie.d.ts

declare module 'cookie' {
    export function serialize(
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        secure?: boolean;
        maxAge?: number;
        sameSite?: 'strict' | 'lax' | 'none';
        path?: string;
      }
    ): string;
  
    export function parse(cookieHeader: string): { [key: string]: string };
  }