// ─────────────────────────────────────────────────────────────
// @mena/types — the API contract shared by every frontend and the
// backend. Add a portal's domain types under its own section.
// This package is the boundary between Ahmed (FE) and Jawher (BE).
// ─────────────────────────────────────────────────────────────

/** The five portals. Carried in the JWT as the `role` claim. */
export type Role = 'organizer' | 'agency' | 'sponsor' | 'reviewer' | 'participant';

/** Standard response envelope used by every endpoint. */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}

/** The authenticated user as seen by the frontend. */
export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: Role;
}

// ── Organizer ───────────────────────────────────────────────
export interface OrganizerTypes {
  _placeholder?: never;
}

// ── Travel Agency ───────────────────────────────────────────
// TODO: move Traveler / GroupProposal / IndividualTicket / Transaction
// here from the prototype during migration.
export interface TravelAgencyTypes {
  _placeholder?: never;
}

// ── Sponsor ─────────────────────────────────────────────────
export interface SponsorTypes {
  _placeholder?: never;
}

// ── Reviewer ────────────────────────────────────────────────
export interface ReviewerTypes {
  _placeholder?: never;
}

// ── Participant ─────────────────────────────────────────────
export interface ParticipantTypes {
  _placeholder?: never;
}
