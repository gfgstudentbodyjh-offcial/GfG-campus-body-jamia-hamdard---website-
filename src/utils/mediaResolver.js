/**
 * mediaResolver.js
 *
 * Environment-aware media URL validator and fallback helper.
 *
 * Production rules:
 *   - Only HTTPS URLs that look like real web resources are considered valid.
 *   - /uploads/..., blob:..., bare filenames, local paths → INVALID
 *
 * Development rules:
 *   - /uploads/... is allowed (local dev server fallback).
 *   - blob: URLs from a live session are also tolerated.
 *   - Everything else (bare filenames, etc.) is still flagged.
 */

const IS_DEV = import.meta.env.DEV === true || import.meta.env.MODE === 'development';

/**
 * Default avatar for when a member has no photo or the URL is broken.
 * Accepts a name string to generate initials.
 *
 * @param {string} name
 * @returns {string} UI-Avatars HTTPS URL
 */
export const defaultAvatarUrl = (name = 'Member') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2f9e44&color=fff&bold=true&size=200`;

/**
 * Returns true if `url` is a valid, loadable media URL.
 *
 * @param {string|null|undefined} url
 * @returns {boolean}
 */
export const isValidMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Bare filenames (e.g. "1000155536.jpg") — no slash, no protocol
  if (!trimmed.includes('/') && !trimmed.startsWith('http')) return false;

  // Blob URLs: ALWAYS invalid as media source (causes Chrome 'Not allowed to load local resource' error)
  if (trimmed.startsWith('blob:')) return false;

  // Local uploads path: allowed in dev, blocked in production
  if (trimmed.startsWith('/uploads/')) return IS_DEV;

  // Relative static asset path (e.g. /assets/...)
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('assets/')) return true;

  // Reject localhost references in production
  if (!IS_DEV && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) return false;

  // Must start with http:// or https://
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Returns a safe URL to use as an <img src>.
 * If the provided URL fails validation, returns the fallback instead.
 *
 * @param {string|null|undefined} url       Candidate media URL
 * @param {string}                fallback  URL to use if candidate is invalid
 * @returns {string}
 */
export const getValidMediaUrl = (url, fallback = '') => {
  if (isValidMediaUrl(url)) return url.trim();
  return fallback;
};

/**
 * Returns a safe avatar URL. Falls back to UI-Avatars with the member's initials.
 *
 * @param {string|null|undefined} photo   Candidate photo URL
 * @param {string}                name    Member name for initials fallback
 * @returns {string}
 */
export const resolveAvatarUrl = (photo, name = 'Member') => {
  return getValidMediaUrl(photo, defaultAvatarUrl(name));
};

/**
 * Formats a clean public handle (e.g., @saquib).
 * Filters out raw 24-character hexadecimal MongoDB ObjectIds (e.g., @6a75009228efef477da1f814).
 *
 * @param {string|null|undefined} username Candidate username
 * @param {string|null|undefined} name     Fallback member name
 * @returns {string} Clean handle starting with @
 */
export const formatDisplayHandle = (username, name = '') => {
  if (username && typeof username === 'string') {
    const clean = username.trim().replace(/^@/, '');
    // If it's NOT a 24-character hexadecimal MongoDB ObjectId, return clean username
    if (clean && !/^[0-9a-fA-F]{24}$/.test(clean)) {
      return `@${clean}`;
    }
  }
  if (name && typeof name === 'string') {
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (cleanName) return `@${cleanName}`;
  }
  return '@member';
};
