import type { AuthUser, Role } from '@mena/types';
import { delay, ApiError } from './util';

// ─────────────────────────────────────────────────────────────
// Mock auth. Any credentials are accepted; the signed-in user is
// derived from the email + the portal's role and persisted in
// localStorage so a refresh keeps the session (mimics the SSO cookie).
// Swap this out for the real `auth` in index.ts once the backend exists.
// ─────────────────────────────────────────────────────────────

const SESSION_KEY = 'mena.mock.session';

function readSession(): AuthUser | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null): void {
  if (typeof localStorage === 'undefined') return;
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

/** Turn an email into a friendly display name: "amel.ben@x.com" → "Amel Ben". */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'User';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export const auth = {
  async login(email: string, _password: string, role: Role): Promise<{ user: AuthUser }> {
    if (!email) throw new ApiError('Email is required', 400);
    const user: AuthUser = { id: 1, email, name: nameFromEmail(email), role };
    writeSession(user);
    return delay({ user });
  },

  async logout(): Promise<{ loggedOut: boolean }> {
    writeSession(null);
    return delay({ loggedOut: true });
  },

  async me(): Promise<{ user: AuthUser }> {
    const user = readSession();
    if (!user) throw new ApiError('Not authenticated', 401);
    return delay({ user });
  },
};
