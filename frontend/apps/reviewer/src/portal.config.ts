import type { Role } from '@mena/types';

/** Per-portal identity. This is the only app-specific config that differs between portals. */
export const portal = {
  slug: 'reviewer',
  portalName: 'Reviewer',
  role: 'reviewer' as Role,
  devPort: 5004,
};
