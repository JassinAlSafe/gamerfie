/**
 * Utility functions for sanitizing data before rendering in HTML
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 * that could be used for XSS attacks
 */
export function sanitizeString(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .trim();
}

/**
 * Sanitizes a URL to ensure it's safe for use in structured data
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
    return url;
  } catch {
    return '';
  }
}

/**
 * Sanitizes an array of strings
 */
export function sanitizeStringArray(arr: any[]): string[] {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .filter(item => typeof item === 'string' || (item && typeof item.name === 'string'))
    .map(item => typeof item === 'string' ? sanitizeString(item) : sanitizeString(item.name))
    .filter(Boolean);
}

/**
 * Sanitizes structured data object recursively to prevent XSS
 */
export function sanitizeStructuredData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(sanitizeStructuredData);
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue; // Skip null/undefined values
    }
    
    if (typeof value === 'string') {
      // Special handling for URLs
      if (key === 'url' || key === 'image' || key.includes('Url')) {
        sanitized[key] = sanitizeUrl(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object') {
      const sanitizedObject = sanitizeStructuredData(value);
      // Only include non-empty objects
      if (Object.keys(sanitizedObject).length > 0) {
        sanitized[key] = sanitizedObject;
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Creates a safe JSON string for use in dangerouslySetInnerHTML
 */
export function createSafeJsonString(data: any): string {
  try {
    const sanitizedData = sanitizeStructuredData(data);
    return JSON.stringify(sanitizedData, null, 0);
  } catch (error) {
    console.warn('Failed to create safe JSON string:', error);
    return '{}';
  }
}