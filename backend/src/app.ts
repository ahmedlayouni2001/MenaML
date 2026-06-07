import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './shared/env';

import authRoutes from './modules/auth/routes';
import organizerRoutes from './modules/organizer/routes';
import travelAgencyRoutes from './modules/travel-agency/routes';
import sponsorRoutes from './modules/sponsor/routes';
import reviewerRoutes from './modules/reviewer/routes';
import participantRoutes from './modules/participant/routes';

const app = express();

app.use(
  cors({
    origin: env.corsOrigins.length ? env.corsOrigins : true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/agency', travelAgencyRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/participant', participantRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: { message: err.message || 'Internal error' } });
});

app.listen(env.port, () => {
  console.log(`[mena-api] listening on http://localhost:${env.port}`);
});

export default app;
