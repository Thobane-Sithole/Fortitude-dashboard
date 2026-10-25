import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter          from './routes/auth.js';
import dashboardRouter     from './routes/dashboard.js';
import usersRouter         from './routes/users.js';
import projectsRouter      from './routes/projects.js';
import invoicesRouter      from './routes/invoices.js';
import financeRouter       from './routes/finance.js';
import crmRouter           from './routes/crm.js';
import notificationsRouter from './routes/notifications.js';
import chatRouter           from './routes/chat.js';
import calendarRouter       from './routes/calendar.js';
import kanbanRouter         from './routes/kanban.js';
import contactsRouter       from './routes/contacts.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(helmet());
const allowedOrigins = [
  process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  'http://localhost:8082',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/dashboard',     dashboardRouter);
app.use('/api/users',         usersRouter);
app.use('/api/projects',      projectsRouter);
app.use('/api/invoices',      invoicesRouter);
app.use('/api/finance',       financeRouter);
app.use('/api/crm',           crmRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/chat',          chatRouter);
app.use('/api/calendar',      calendarRouter);
app.use('/api/kanban',        kanbanRouter);
app.use('/api/contacts',      contactsRouter);

// Health check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀  Forty Portal API running on http://localhost:${PORT}`);
  console.log(`📋  Health:     GET http://localhost:${PORT}/health`);
  console.log(`🔒  Auth:       POST http://localhost:${PORT}/api/auth/login\n`);
});

export default app;
