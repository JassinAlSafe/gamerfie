/**
 * Content sanitization utilities for XSS protection
 * Uses DOMPurify for HTML sanitization and additional text processing
 */

import DOMPurify from 'dompurify';

// Server-side compatible DOMPurify setup
let purify: typeof DOMPurify;

if (typeof window !== 'undefined') {
  // Client-side: Use DOMPurify directly
  purify = DOMPurify;
} else {
  // Server-side: Use jsdom for DOMPurify
  const { JSDOM } = require('jsdom');
  const window = new JSDOM('').window;
  purify = DOMPurify(window as any);
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Configure DOMPurify for review content
  const config = {
    // Allow safe HTML tags commonly used in reviews
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'strike', 'del',
      'p', 'br', 'span', 'div',
      'ul', 'ol', 'li',
      'blockquote', 'q',
      'h4', 'h5', 'h6' // Allow smaller headings only
    ],
    ALLOWED_ATTR: [
      'class', // Allow class for styling
    ],
    // Remove all other attributes to prevent XSS via event handlers
    FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror', 'href', 'src'],
    // Don't allow any protocols in URLs
    ALLOWED_URI_REGEXP: /^$/,
    // Remove comments and CDATA
    KEEP_CONTENT: true,
    // Return as string, not DOM
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  return purify.sanitize(html, config);
}

/**
 * Sanitizes plain text content to prevent XSS in text contexts
 * Also handles basic formatting and length limits
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (!text || typeof text !== 'string') return '';

  // Trim and limit length
  let sanitized = text.trim().substring(0, maxLength);

  // Remove any HTML tags (just in case)
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove or escape potentially dangerous characters
  sanitized = sanitized
    .replace(/[<>'"&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Sanitizes review content specifically
 * Handles both plain text and basic formatting
 */
export function sanitizeReviewContent(content: string): string {
  if (!content || typeof content !== 'string') return '';

  // First pass: sanitize as HTML to remove dangerous content
  const htmlSanitized = sanitizeHtml(content);
  
  // Second pass: if no HTML tags remain, treat as plain text
  const hasHtmlTags = /<[^>]+>/.test(htmlSanitized);
  
  if (!hasHtmlTags) {
    return sanitizeText(content);
  }

  return htmlSanitized;
}

/**
 * Sanitizes user input for database storage
 * More restrictive than display sanitization
 */
export function sanitizeForStorage(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Start with text sanitization
  let sanitized = sanitizeText(input);

  // Additional restrictions for storage
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Remove repeated punctuation (prevent spam-like content)
  sanitized = sanitized.replace(/([!?.]){4,}/g, '$1$1$1');
  
  return sanitized;
}

/**
 * Type guard to check if content is safe
 */
export function isContentSafe(content: string): boolean {
  if (!content || typeof content !== 'string') return true;

  // Check for common XSS patterns
  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * Validation helper for review content
 */
export function validateReviewContent(content: string): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!content || typeof content !== 'string') {
    return { isValid: true, sanitized: '', errors: [] };
  }

  // Check content safety
  if (!isContentSafe(content)) {
    errors.push('Content contains potentially dangerous elements');
  }

  // Check length
  if (content.length > 5000) {
    errors.push('Content exceeds maximum length of 5000 characters');
  }

  // Sanitize the content
  const sanitized = sanitizeReviewContent(content);

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}