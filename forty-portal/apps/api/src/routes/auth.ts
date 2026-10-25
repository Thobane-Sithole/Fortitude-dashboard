import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool, query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signTokens(user: { id: string; email: string; role: string; name: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as string,
  });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as string,
  });
  return { accessToken, refreshToken };
}

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { rows } = await query<{ id: string; name: string; email: string; role: string; password_hash: string; status: string }>(
      'SELECT id, name, email, role, password_hash, status FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (user.status === 'Inactive') {
      res.status(403).json({ error: 'Account is deactivated' });
      return;
    }

    const { accessToken, refreshToken } = signTokens(user);

    await query(
      `INSERT INTO sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) { res.status(400).json({ error: 'refreshToken required' }); return; }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string };

    const { rows: sessions } = await query<{ id: string }>(
      'SELECT id FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    if (!sessions[0]) { res.status(401).json({ error: 'Invalid or expired refresh token' }); return; }

    const { rows } = await query<{ id: string; name: string; email: string; role: string }>(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [payload.sub]
    );
    const user = rows[0];
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const tokens = signTokens(user);

    await pool.query(
      `UPDATE sessions SET refresh_token = $1, expires_at = NOW() + INTERVAL '7 days' WHERE refresh_token = $2`,
      [tokens.refreshToken, refreshToken]
    );

    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) await query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query<{ id: string; name: string; email: string; role: string; job_title: string; avatar: string; status: string }>(
      'SELECT id, name, email, role, job_title, avatar, status FROM users WHERE id = $1',
      [req.user!.sub]
    );
    if (!rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
