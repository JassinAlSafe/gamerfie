// Remove unused import - we'll use our own CookieConfig interface

export interface CookieConfig {
  name: string;
  defaultValue?: string;
  maxAge?: number; // in seconds
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

export interface UserPreferenceCookie {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  betaBannerDismissed: boolean;
  libraryView: 'grid' | 'list';
  consentLevel: 'essential' | 'functional' | 'analytics' | 'all';
  searchPreferences?: any; // Search-related preferences
}

class CookieManager {
  // Cookie configurations
  private static readonly configs = {
    // Essential cookies (always allowed)
    sessionId: {
      name: 'gv_session',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: true,
      httpOnly: true,
      sameSite: 'lax' as const,
    },
    
    // Functional cookies (enhance UX)
    userPreferences: {
      name: 'gv_prefs',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      secure: true,
      httpOnly: false,
      sameSite: 'lax' as const,
    },
    
    // Security cookies
    csrfToken: {
      name: 'gv_csrf',
      maxAge: 60 * 60, // 1 hour
      secure: true,
      httpOnly: true,
      sameSite: 'strict' as const,
    },
    
    // Analytics/tracking (only with consent)
    analytics: {
      name: 'gv_analytics',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: true,
      httpOnly: false,
      sameSite: 'lax' as const,
    },
    
    // Consent management
    consent: {
      name: 'gv_consent',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      secure: true,
      httpOnly: false,
      sameSite: 'lax' as const,
    }
  } as const;

  /**
   * Set a cookie with proper configuration
   */
  static setCookie(
    type: keyof typeof CookieManager.configs,
    value: string,
    options?: Partial<CookieConfig>
  ): void {
    if (typeof document === 'undefined') return;

    const config = this.configs[type];
    const cookieOptions = { ...config, ...options };
    
    let cookieString = `${cookieOptions.name}=${encodeURIComponent(value)}`;
    
    if (cookieOptions.maxAge) {
      const expires = new Date(Date.now() + cookieOptions.maxAge * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }
    
    if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`;
    if (cookieOptions.domain) cookieString += `; domain=${cookieOptions.domain}`;
    if (cookieOptions.secure) cookieString += `; secure`;
    if (cookieOptions.httpOnly) cookieString += `; httponly`;
    if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`;
    
    document.cookie = cookieString;
  }

  /**
   * Get a cookie value
   */
  static getCookie(type: keyof typeof CookieManager.configs): string | null {
    if (typeof document === 'undefined') return null;

    const config = this.configs[type];
    const name = config.name;
    
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  }

  /**
   * Delete a cookie
   */
  static deleteCookie(type: keyof typeof CookieManager.configs): void {
    if (typeof document === 'undefined') return;

    const config = this.configs[type];
    document.cookie = `${config.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }

  /**
   * Get user preferences from cookie
   */
  static getUserPreferences(): Partial<UserPreferenceCookie> {
    const prefsString = this.getCookie('userPreferences');
    if (!prefsString) return {};
    
    try {
      return JSON.parse(prefsString);
    } catch {
      return {};
    }
  }

  /**
   * Set user preferences cookie
   */
  static setUserPreferences(prefs: Partial<UserPreferenceCookie>): void {
    const currentPrefs = this.getUserPreferences();
    const updatedPrefs = { ...currentPrefs, ...prefs };
    
    this.setCookie('userPreferences', JSON.stringify(updatedPrefs));
  }

  /**
   * Check if user has consented to cookie category
   */
  static hasConsent(category: 'essential' | 'functional' | 'analytics'): boolean {
    const consent = this.getCookie('consent');
    if (!consent) return category === 'essential'; // Essential cookies always allowed
    
    try {
      const consentData = JSON.parse(consent);
      const level = consentData.level || 'essential';
      
      switch (level) {
        case 'all':
          return true;
        case 'analytics':
          return ['essential', 'functional', 'analytics'].includes(category);
        case 'functional':
          return ['essential', 'functional'].includes(category);
        case 'essential':
        default:
          return category === 'essential';
      }
    } catch {
      return category === 'essential';
    }
  }

  /**
   * Set consent level
   */
  static setConsent(level: 'essential' | 'functional' | 'analytics' | 'all'): void {
    const consentData = {
      level,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    this.setCookie('consent', JSON.stringify(consentData));
  }

  /**
   * Clean up cookies based on consent
   */
  static cleanupByConsent(): void {
    if (!this.hasConsent('analytics')) {
      this.deleteCookie('analytics');
    }
  }

  /**
   * Set search preferences helper
   */
  static setSearchPreferences(preferences: any): void {
    if (!this.hasConsent('functional')) {
      console.warn('Cannot set search preferences without functional cookie consent');
      return;
    }

    const current = this.getUserPreferences();
    const updated = { ...current, searchPreferences: preferences };
    this.setUserPreferences(updated);
  }

  /**
   * Get all cookies for debugging
   */
  static getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {};
    
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  }
}

export default CookieManager; 