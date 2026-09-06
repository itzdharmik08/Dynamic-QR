/**
 * Safe Browser Storage Utility
 *
 * Security Policy:
 * 1. Application data (QR codes, destination URLs, scan counts, database dumps) must NEVER be stored in localStorage/sessionStorage.
 * 2. User credential objects or demo user payloads must NEVER be persisted in localStorage/sessionStorage.
 * 3. Only whitelisted safe items (e.g. standard Supabase auth tokens starting with 'sb-', or safe UI preferences) are allowed.
 * 4. Automatically purges any unauthorized or legacy keys on startup.
 */

// Whitelist of allowed non-sensitive storage keys
const SAFE_EXACT_KEYS = new Set<string>([
  'theme',
  'ui_preferences',
]);

// Whitelist of allowed prefixes (e.g., Supabase authentication session tokens)
const SAFE_PREFIXES = ['sb-'];

/**
 * Checks whether a given key is considered safe to persist in browser storage.
 */
export function isSafeStorageKey(key: string): boolean {
  if (SAFE_EXACT_KEYS.has(key)) return true;
  return SAFE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

/**
 * Purges any unauthorized, legacy, or sensitive items from localStorage and sessionStorage.
 * This ensures no QR code data or demo credentials remain stored in the user's browser.
 */
export function sanitizeBrowserStorage(): void {
  try {
    // Purge localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !isSafeStorageKey(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => {
        console.warn(`[SafeStorage] Purged unauthorized storage key: "${key}"`);
        localStorage.removeItem(key);
      });
    }

    // Purge sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !isSafeStorageKey(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => {
        console.warn(`[SafeStorage] Purged unauthorized sessionStorage key: "${key}"`);
        sessionStorage.removeItem(key);
      });
    }
  } catch (err) {
    console.error('[SafeStorage] Error sanitizing browser storage:', err);
  }
}

/**
 * Safe wrapper for localStorage that only permits whitelisted keys.
 */
export const safeStorage = {
  getItem(key: string): string | null {
    if (!isSafeStorageKey(key)) {
      console.warn(`[SafeStorage] Blocked read attempt for non-whitelisted key: "${key}"`);
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    if (!isSafeStorageKey(key)) {
      console.warn(`[SafeStorage] Blocked write attempt for non-whitelisted key: "${key}". Sensitive and application data must not be stored in browser storage.`);
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },

  clearUnsafe(): void {
    sanitizeBrowserStorage();
  },
};
