import type { Role } from '@mena/types';

/** Per-portal identity. This is the only app-specific config that differs between portals. */
export const portal = {
  slug: 'participant',
  portalName: 'Participant',
  role: 'participant' as Role,
  devPort: 5005,
};
