/**
 * Local-only session for the unsigned mobile UI build.
 * This is NOT user authentication and intentionally NEVER persists passwords.
 * Replace this adapter with the real Node.js auth implementation later.
 */
export const LOCAL_SESSION_KEY = 'bato-local-ui-session-v1';
const RECORD_PREFIX = 'bato-local-ui-records-v1:';

function defaultStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function normalizeEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Please enter a valid email address.');
  return normalized;
}

export function readLocalSession(store = defaultStorage()) {
  try {
    const raw = store?.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const email = normalizeEmail(parsed.email);
    const name = String(parsed.name ?? '').trim().slice(0, 80);
    return { email, name: name || email.split('@')[0] };
  } catch {
    return null;
  }
}

export function startLocalSession({ email, name = '' }, store = defaultStorage()) {
  const address = normalizeEmail(email);
  const cleanName = String(name).trim().slice(0, 80) || address.split('@')[0];
  const account = { email: address, name: cleanName };
  if (!store) throw new Error('Local storage unavailable.');
  // No password/PIN, access token, medical record, or auth claim is saved here.
  store.setItem(LOCAL_SESSION_KEY, JSON.stringify(account));
  return account;
}

export function clearLocalSession(store = defaultStorage()) {
  store?.removeItem(LOCAL_SESSION_KEY);
}

export function localAccountDataKey(email) {
  return RECORD_PREFIX + encodeURIComponent(normalizeEmail(email));
}
