# MenaML — Multi-Portal Platform

MenaML is the platform for running the **MenaML 2026** summer school / conference.
It is a **monorepo** containing **five separate frontend portals** that share UI,
types, and an API client, plus a backend that will serve them all.

> **Current state:** all five **frontends are built and run with mock data — no
> backend required**. This repo is the handoff point for building the real
> backend + database.

## Live demo

All five portals are deployed on Vercel (frontend only, mock data, no backend):

| Portal | Live URL |
| ------------- | ------------------------------------------------- |
| Organizer | https://mena-ml-organizer.vercel.app/ |
| Travel Agency | https://mena-ml-travel-agency.vercel.app/ |
| Sponsor | https://mena-ml-sponsor.vercel.app/ |
| Reviewer | https://mena-ml-reviewer.vercel.app/ |
| Participant | https://mena-ml-participant.vercel.app/ |

Login is fake on every portal — type any email + any password.

---

## Table of contents

1. [The five portals](#1-the-five-portals)
2. [Tech stack](#2-tech-stack)
3. [Repository layout](#3-repository-layout)
4. [How to run (any machine / any localhost)](#4-how-to-run-any-machine--any-localhost)
5. [Architecture: the shared packages](#5-architecture-the-shared-packages)
6. [Mock data — where it lives & how it works](#6-mock-data--where-it-lives--how-it-works)
7. [The frontend↔backend contract (read this, Jawher)](#7-the-frontendbackend-contract-read-this-jawher)
8. [Per-portal integration notes](#8-per-portal-integration-notes)
9. [Switching from mock to a real backend](#9-switching-from-mock-to-a-real-backend)
10. [Next steps for the backend](#10-next-steps-for-the-backend)

---

## 1. The five portals

Each portal is its own deployable app, on its own subdomain (prod) and port (dev).

| Portal        | Dev URL                  | Subdomain (prod)     | Role claim    |
| ------------- | ------------------------ | -------------------- | ------------- |
| Organizer     | http://localhost:5001    | organizer.mena.ml    | `organizer`   |
| Travel Agency | http://localhost:5002    | agency.mena.ml       | `agency`      |
| Sponsor       | http://localhost:5003    | sponsor.mena.ml      | `sponsor`     |
| Reviewer      | http://localhost:5004    | reviewer.mena.ml     | `reviewer`    |
| Participant   | http://localhost:5005    | participant.mena.ml  | `participant` |
| **API (backend)** | http://localhost:3000 | api.mena.ml        | —             |

**Login is currently fake on every portal** — type any email + any password.

---

## 2. Tech stack

- **React 19** + **React Router 7** + **Vite 6**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** (`@tailwindcss/vite`, no `tailwind.config.js`)
- **pnpm 9 workspaces** + **Turborepo 2** (monorepo orchestration)
- **Node ≥ 20** (tested on Node 24)
- Backend (to be built): **Express + TypeScript** modular monolith, **PostgreSQL**,
  **JWT** auth. A scaffold lives in [`backend/`](backend/).

---

## 3. Repository layout

```
MenaML/
├─ package.json              # root scripts (turbo run dev/build/typecheck)
├─ pnpm-workspace.yaml       # packages: backend, frontend/apps/*, frontend/packages/*
├─ turbo.json                # task graph
├─ docker-compose.yml        # db + backend + nginx proxy (prod-ish; for later)
├─ deploy/nginx.conf         # serves each portal's dist/ + proxies /api
│
├─ backend/                  # ← Jawher: Express + TS modular-monolith SCAFFOLD
│  └─ src/
│     ├─ app.ts
│     ├─ modules/<domain>/routes.ts   # auth, organizer, participant, reviewer,
│     │                                # sponsor, travel-agency
│     └─ shared/                       # db, env, middleware/auth (JWT, requireRole)
│
└─ frontend/
   ├─ packages/              # shared, consumed via "workspace:*" (no publishing)
   │  ├─ types/      → @mena/types   # THE DATA CONTRACT (interfaces only)
   │  ├─ api-client/ → @mena/api     # request() wrapper + auth + MOCK layer
   │  └─ ui/         → @mena/ui      # design system (Button/Card/StatusPill/PortalShell)
   │
   └─ apps/                  # the 5 portals (thin apps)
      ├─ organizer/          # shadcn dashboard, data inline   (port 5001)
      ├─ travel-agency/      # custom multi-page app, mock API  (port 5002)
      ├─ sponsor/            # shadcn dashboard, data inline   (port 5003)
      ├─ reviewer/           # shadcn dashboard, data inline   (port 5004)
      └─ participant/        # shadcn dashboard, data inline   (port 5005)
```

---

## 4. How to run (any machine / any localhost)

Works the same on Ahmed's or Jawher's machine — no backend or database needed.

### Prerequisites
- **Node ≥ 20** — https://nodejs.org
- **pnpm 9** — `npm install -g pnpm` (or `corepack enable`)

### Install (once)
```bash
git clone https://github.com/ahmedlayouni2001/MenaML.git
cd MenaML
pnpm install
```

### Run
```bash
pnpm dev                              # run ALL portals at once (via Turbo)

# …or run a single portal:
pnpm --filter @mena/organizer     dev # → http://localhost:5001
pnpm --filter @mena/travel-agency dev # → http://localhost:5002
pnpm --filter @mena/sponsor       dev # → http://localhost:5003
pnpm --filter @mena/reviewer      dev # → http://localhost:5004
pnpm --filter @mena/participant   dev # → http://localhost:5005
```
Open the printed URL, type **any email/password**, sign in.

### Other commands
```bash
pnpm build       # production build of every app/package
pnpm typecheck   # tsc --noEmit across the workspace
```

### Exposing on the local network (e.g. to show a teammate)
```bash
pnpm --filter @mena/organizer dev -- --host    # serves on 0.0.0.0; open http://<your-LAN-ip>:5001
```

### `*.localhost` and SSO (relevant once the backend exists)
`*.localhost` resolves to `127.0.0.1` automatically, so you can develop on
`organizer.localhost:5001`, `agency.localhost:5002`, etc. The auth cookie domain
`.localhost` also works, so single sign-on behaves like production.

---

## 5. Architecture: the shared packages

Apps are intentionally **thin**. Reusable logic lives in three workspace packages
consumed via `workspace:*` (edit once, every app updates — no publishing):

- **`@mena/types`** ([frontend/packages/types](frontend/packages/types)) — pure
  TypeScript interfaces. **This is the contract between frontend and backend.**
  Holds `Role`, `ApiEnvelope<T>`, `AuthUser`, and per-portal type sections.
- **`@mena/api`** ([frontend/packages/api-client](frontend/packages/api-client)) —
  the single point of contact with the backend. `request<T>()` is a typed `fetch`
  wrapper that sends the auth cookie and unwraps the `{ success, data, error }`
  envelope. **Currently mock-backed** (see §6).
- **`@mena/ui`** ([frontend/packages/ui](frontend/packages/ui)) — shared design
  system: `Button`, `Card`, `StatusPill`, `PortalShell` + Tailwind theme tokens.

Each portal’s only app-specific config is `src/portal.config.ts` (slug, display
name, role, dev port).

> **Exception — Travel Agency** is a separately-built custom app and does **not**
> use `@mena/ui` / `@mena/api`. It has its own UI, routing, auth flow, and its own
> `src/services/api.ts`. See §8.

---

## 6. Mock data — where it lives & how it works

The whole frontend runs offline. Two mechanisms:

### Auth (4 shadcn portals)
`@mena/api`’s auth is mocked: **any credentials are accepted**, the user is derived
from the email + the portal’s role, and the session is stored in `localStorage`
(survives refresh). Files: [`frontend/packages/api-client/src/mock/auth.ts`](frontend/packages/api-client/src/mock/auth.ts).
Toggle in [`index.ts`](frontend/packages/api-client/src/index.ts) — mock is **on by default**; set `VITE_USE_MOCK="false"` to use the real API.

### Content data (where to edit it)
There are **no separate seed files**. Each portal’s data is inline:

| Portal | Data lives in | Form |
| ------ | ------------- | ---- |
| Organizer | `src/components/Dashboard.tsx` | inline `const` arrays |
| Participant | `src/components/ParticipantView.tsx` | inline `const` arrays |
| Sponsor | `src/components/SponsorView.tsx` | inline `const` arrays |
| Reviewer | `src/components/ReviewerView.tsx` | inline `const` arrays |
| Travel Agency | `src/services/api.ts` (`seed()` fn) | in-memory store |

For the 4 shadcn dashboards the data is **presentational** (not wired through
`@mena/api`). The Travel Agency portal is different: its `services/api.ts` is a
full **in-memory mock of the backend** (~50 endpoints) with real workflow logic —
state lives in memory and **resets on a hard refresh** (SPA navigation keeps it).

---

## 7. The frontend↔backend contract (read this, Jawher)

### Standard response envelope (all portals)
Every endpoint should return:
```ts
interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}
```
`@mena/api`’s `request()` unwraps this and returns `data`. On `401` it redirects to
`/login`. Source: [`frontend/packages/types/src/index.ts`](frontend/packages/types/src/index.ts).

### Auth model (the 4 shadcn portals)
These portals only call **auth** today (their content is inline). Endpoints expected
by [`@mena/api`](frontend/packages/api-client/src/index.ts):

| Method | Path | Body | Returns |
| ------ | ---- | ---- | ------- |
| POST | `/api/auth/login` | `{ email, password, role }` | `{ user: AuthUser }` |
| POST | `/api/auth/logout` | — | `{ loggedOut: true }` |
| GET  | `/api/auth/me` | — | `{ user: AuthUser }` |

- Auth is a **JWT in an httpOnly cookie** scoped to `Domain=.mena.ml` → single
  sign-on across all portals; the `role` claim authorizes each portal.
- `AuthUser = { id, email, name?, role }`, `Role = 'organizer' | 'agency' |
  'sponsor' | 'reviewer' | 'participant'`.
- The backend scaffold already stubs this in
  [`backend/src/modules/auth/routes.ts`](backend/src/modules/auth/routes.ts) and
  [`backend/src/shared/middleware/auth.ts`](backend/src/shared/middleware/auth.ts)
  (`authenticate`, `requireRole`).

**To finish these 4 portals against a real backend:** implement auth, then add the
domain types to `@mena/types` and replace each dashboard’s inline arrays with
`@mena/api` calls (one portal/section at a time).

### Travel Agency — a full, concrete API contract already exists
This portal was built against a **real Express + Postgres backend** and we
mock-ified it. The complete endpoint surface (the source of truth) is in
[`frontend/apps/travel-agency/src/services/api.ts`](frontend/apps/travel-agency/src/services/api.ts)
and the data shapes in
[`frontend/apps/travel-agency/src/types.ts`](frontend/apps/travel-agency/src/types.ts).
It covers: auth (register/verify/reset/login/me), travelers (+visa), groups
(propose-fare → AI alt → accept/justify/finalize → book), individual tickets,
organizer review (token pages), incoming submissions, agency tasks, bell
notifications, transactions + payment summary, and an SSE `/events` stream.

> A working backend for Travel Agency already exists in a **separate repo**
> (“Travel Agency Portal”). Decide whether to fold it into `backend/` here or keep
> it standalone. The mock in `services/api.ts` mirrors its behaviour 1:1.

---

## 8. Per-portal integration notes

- **Organizer / Sponsor / Reviewer / Participant** — imported from standalone
  shadcn dashboard exports. Each is one large self-contained
  `components/<Name>View.tsx` with inline mock data. We added the `@mena/api`
  mock-auth login gate in front and a “Sign out” button. shadcn primitives
  (`badge`/`button`/`card`) live app-local under `src/components/ui/`.
- **Travel Agency** — a custom multi-page app (its own routing, auth pages, and
  `Layout`). We replaced its `services/api.ts` with an in-memory mock so it runs
  with no backend. It does **not** use `@mena/ui`/`@mena/api`.

Per-app conventions for the shadcn four: `@` → `src` path alias (vite + tsconfig)
and relaxed `noUnusedLocals/Parameters` (the imported dashboards carry many inline
constants).

---

## 9. Switching from mock to a real backend

- **Shadcn portals (auth):** set `VITE_USE_MOCK="false"` in the app’s environment
  and point `VITE_API_URL` at the backend (e.g. `https://api.mena.ml`). In dev,
  each Vite app already proxies `/api` → `http://localhost:3000`.
- **Travel Agency:** restore the original `fetch`-based `services/api.ts` (kept in
  the source repo) — it targets `http://localhost:3000/api` with a Bearer token —
  and run that backend.

---

## 10. Next steps for the backend

1. **Auth first** — it’s the shared contract for all five portals
   (`/api/auth/login|logout|me`, JWT httpOnly cookie on `.mena.ml`, `role` claim).
2. **Agree domain types in `@mena/types`** before building each portal’s API, so
   FE and BE can move in parallel against the same interfaces.
3. **Travel Agency** — reuse the existing backend (its contract is fully specified
   in `services/api.ts` + `types.ts`); choose to merge it into `backend/` or keep
   it separate.
4. **Database** — PostgreSQL; `docker-compose.yml` already defines a `db` service.
5. Wire each shadcn portal’s data through `@mena/api` (replace inline arrays),
   one portal/section at a time.

---

### Quick reference
```bash
pnpm install        # install everything
pnpm dev            # run all 5 portals (5001–5005)
pnpm build          # build all
pnpm typecheck      # type-check all
```
Package names: `@mena/organizer`, `@mena/travel-agency`, `@mena/sponsor`,
`@mena/reviewer`, `@mena/participant`, `@mena/types`, `@mena/api`, `@mena/ui`.
