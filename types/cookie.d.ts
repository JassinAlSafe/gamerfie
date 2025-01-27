// Type definitions for cookie module
// Ambient module declaration - parameters are part of the API signature

declare module 'cookie' {
    export function serialize(
      _name: string,
      _value: string,
      _options?: {
        httpOnly?: boolean;
        secure?: boolean;
        maxAge?: number;
        sameSite?: 'strict' | 'lax' | 'none';
        path?: string;
      }
    ): string;
  
    export function parse(_cookieHeader: string): { [key: string]: string };
}