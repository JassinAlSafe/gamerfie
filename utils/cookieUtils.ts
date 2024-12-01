
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  TOKEN_EXPIRY: 'tokenExpiry'
} as const;

export const getCookie = (name: string): string | undefined => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
};

export const clearAuthCookies = (): void => {
  const options = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = `${COOKIE_NAMES.ACCESS_TOKEN}=; ${options}`;
  document.cookie = `${COOKIE_NAMES.TOKEN_EXPIRY}=; ${options}`;
};

export const checkTokenValidity = (): boolean => {
  const tokenExpiry = getCookie(COOKIE_NAMES.TOKEN_EXPIRY);
  return tokenExpiry ? new Date(tokenExpiry) > new Date() : false;
};