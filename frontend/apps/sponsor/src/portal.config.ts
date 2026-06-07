import type { Role } from '@mena/types';

/** Per-portal identity. This is the only app-specific config that differs between portals. */
export const portal = {
  slug: 'sponsor',
  portalName: 'Sponsor',
  role: 'sponsor' as Role,
  devPort: 5003,
};
