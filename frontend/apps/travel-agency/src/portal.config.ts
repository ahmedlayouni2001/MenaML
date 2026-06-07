import type { Role } from '@mena/types';

/** Per-portal identity. This is the only app-specific config that differs between portals. */
export const portal = {
  slug: 'travel-agency',
  portalName: 'Travel Agency',
  role: 'agency' as Role,
  devPort: 5002,
};
