import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const SAFE_COLS = 'id, name, email, role, job_title, department, phone, avatar, status, joined_at, created_at';

// GET /api/users
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`SELECT ${SAFE_COLS} FROM users ORDER BY role, name`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT ${SAFE_COLS} FROM users WHERE id = $1`, [req.params.id]);
    if (!rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/users (Admin only)
router.post('/', requireRole('Admin'), async (req, res, next) => {
  try {
    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['Admin','Manager','Finance','Developer','Viewer']),
      job_title: z.string().optional(),
      department: z.string().optional(),
      phone: z.string().optional(),
    }).parse(req.body);

    const hash = await bcrypt.hash(body.password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role, job_title, department, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${SAFE_COLS}`,
      [body.name, body.email.toLowerCase(), hash, body.role, body.job_title, body.department, body.phone]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/users/:id
router.patch('/:id', requireRole('Admin','Manager'), async (req, res, next) => {
  try {
    const body = z.object({
      name:       z.string().optional(),
      role:       z.enum(['Admin','Manager','Finance','Developer','Viewer']).optional(),
      job_title:  z.string().optional(),
      department: z.string().optional(),
      phone:      z.string().optional(),
      status:     z.enum(['Active','On Leave','Inactive']).optional(),
    }).parse(req.body);

    const sets: string[] = [];
    const vals: unknown[] = [];
    Object.entries(body).forEach(([k, v]) => { if (v !== undefined) { sets.push(`${k} = $${vals.push(v)}`); } });
    if (!sets.length) { res.status(400).json({ error: 'Nothing to update' }); return; }

    vals.push(req.params.id);
    const { rows } = await query(
      `UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING ${SAFE_COLS}`,
      vals
    );
    if (!rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/users/:id (Admin only)
router.delete('/:id', requireRole('Admin'), async (req, res, next) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
