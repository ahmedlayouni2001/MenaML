import type { AuthUser, Role } from '@mena/types';
import { request, ApiError } from './request';
import { auth as mockAuth } from './mock/auth';

export { request, ApiError };

/**
 * Mock mode is ON by default for frontend-only development. Set
 * VITE_USE_MOCK="false" in an app's env to hit the real backend instead.
 */
const USE_MOCK: boolean =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: Record<string, string> }).env?.['VITE_USE_MOCK']) !== 'false';

// ── Real auth calls (used when USE_MOCK is false) ───────────
const realAuth = {
  login: (email: string, password: string, role: Role) =>
    request<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () => request<{ loggedOut: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ user: AuthUser }>('/api/auth/me'),
};

/** Shared auth calls (every portal uses these). Mocked unless VITE_USE_MOCK="false". */
export const auth = USE_MOCK ? mockAuth : realAuth;
