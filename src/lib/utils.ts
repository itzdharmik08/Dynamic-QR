/**
 * Generates a clean, unambiguous uppercase alphanumeric shortcode (e.g., "7K9M2P").
 * Excludes easily confused characters (0, O, 1, I, L).
 */
export function generateShortCode(length = 6): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Validates whether a string is a valid web URL (http or https).
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Ensures a URL starts with http:// or https://, defaulting to https:// if missing.
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Gets the permanent redirect URL for a given QR shortcode.
 */
export function getPermanentUrl(qrCode: string): string {
  const envUrl = import.meta.env.VITE_APP_URL;
  const baseUrl = (envUrl && envUrl.trim() !== '') ? envUrl.trim().replace(/\/$/, '') : window.location.origin;
  return `${baseUrl}/q/${qrCode}`;
}

/**
 * Formats an ISO date string into a friendly, localized representation.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Truncates long strings gracefully for UI tables.
 */
export function truncate(str: string, maxLen = 40): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}
