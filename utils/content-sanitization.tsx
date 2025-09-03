import DOMPurify from 'isomorphic-dompurify';
import React from 'react';

/**
 * Client-side HTML sanitization utility
 * This provides an additional layer of protection beyond the database-level sanitization
 */

interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre'
];

const DEFAULT_ALLOWED_ATTRIBUTES = [
  'class', 'id'
];

/**
 * Sanitize HTML content for safe display
 */
export function sanitizeHtml(
  content: string,
  options: SanitizationOptions = {}
): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES
  } = options;

  try {
    const cleaned = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link', 'meta', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });

    return cleaned;
  } catch (error) {
    console.error('Content sanitization failed:', error);
    // Fallback: strip all HTML tags if sanitization fails
    return content.replace(/<[^>]*>/g, '');
  }
}

/**
 * Sanitize plain text content (removes HTML entirely)
 */
export function sanitizePlainText(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
}

/**
 * Validate and sanitize forum post content
 */
export function sanitizeForumContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'code'],
    allowedAttributes: []
  });
}

/**
 * Safe component for rendering user-generated HTML content
 */
export interface SafeHtmlProps {
  content: string;
  className?: string;
  options?: SanitizationOptions;
}

/**
 * React component for safely rendering HTML content
 */
export function SafeHtml({ content, className, options }: SafeHtmlProps) {
  const sanitizedContent = sanitizeHtml(content, options);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

/**
 * Hook for sanitizing content with memoization
 */
export function useSanitizedContent(content: string, options?: SanitizationOptions) {
  const [sanitizedContent, setSanitizedContent] = React.useState<string>('');
  
  React.useEffect(() => {
    const sanitized = sanitizeHtml(content, options);
    setSanitizedContent(sanitized);
  }, [content, options]);
  
  return sanitizedContent;
}

/**
 * Validate content length and format for forum posts
 */
export function validateForumContent(content: string): {
  isValid: boolean;
  errors: string[];
  sanitizedContent: string;
} {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }
  
  if (content.length > 10000) {
    errors.push('Content cannot exceed 10,000 characters');
  }
  
  const sanitizedContent = sanitizeForumContent(content);
  
  // Check if sanitization removed too much content (potential malicious input)
  if (content.length > 100 && sanitizedContent.length < content.length * 0.5) {
    errors.push('Content contains invalid formatting');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedContent
  };
}