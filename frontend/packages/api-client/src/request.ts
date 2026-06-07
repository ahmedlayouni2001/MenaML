import type { ApiEnvelope } from '@mena/types';

/**
 * Base URL of the API. In dev, each Vite app proxies "/api" to the backend,
 * so the default empty base + "/api/..." works everywhere. Override with
 * VITE_API_URL (e.g. https://api.mena.ml) in production builds.
 */
const API_BASE: string =
  (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL']) || '';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Typed fetch wrapper. Sends the httpOnly auth cookie automatically
 * (credentials: 'include') and unwraps the { success, data } envelope.
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('Invalid server response', res.status);
  }

  if (!res.ok || !json.success) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(json.error?.message ?? 'Request failed', res.status, json.error?.code);
  }
  return json.data as T;
}
