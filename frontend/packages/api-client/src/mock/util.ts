// Shared helpers for the mock API layer.

/** Resolve after a short, randomized delay so the UI exercises its loading states. */
export function delay<T>(value: T, ms = 300 + Math.random() * 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Throw the same shape callers expect from the real client. */
export { ApiError } from '../request';

/** Stable-ish incrementing id generator for mock records created at runtime. */
let _seq = 10_000;
export function nextId(): number {
  return ++_seq;
}
