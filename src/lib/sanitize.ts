import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The HTML string to sanitize
 * @returns Sanitized HTML string safe for innerHTML
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize plain text by escaping HTML special characters
 * Use this for text that should never contain HTML
 * @param text - Plain text to sanitize
 * @returns Escaped text safe for display
 */
export const sanitizeText = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize URL to prevent javascript: and data: URL attacks
 * @param url - URL to validate
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return url;
    }
    return '';
  } catch {
    return '';
  }
};

/**
 * Create a safe SVG string for icons
 * @param svgContent - SVG content without <svg> wrapper
 * @param className - Optional CSS class
 * @returns Safe SVG element string
 */
export const createSafeSvg = (svgContent: string, className?: string): string => {
  // Sanitize SVG content with strict rules
  const sanitized = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g'],
    ALLOWED_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'class'],
  });

  return `<svg class="${sanitizeText(className || '')}">${sanitized}</svg>`;
};