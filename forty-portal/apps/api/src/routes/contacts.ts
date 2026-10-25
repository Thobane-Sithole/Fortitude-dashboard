import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const ContactSchema = z.object({
  name:         z.string().min(1).max(255),
  email:        z.string().email().max(255).nullable().optional(),
  phone:        z.string().max(50).nullable().optional(),
  company:      z.string().max(255).nullable().optional(),
  job_title:    z.string().max(255).nullable().optional(),
  address:      z.string().max(500).nullable().optional(),
  group_name:   z.enum(['work','family','friends','clients']).nullable().optional(),
  notes:        z.string().max(5000).nullable().optional(),
  tags:         z.string().max(500).nullable().optional(),
  is_favorite:  z.boolean().optional(),
  avatar_index: z.number().int().min(1).max(9).optional(),
});

const COLS = `id, name, email, phone, company, job_title, address, group_name, notes, tags, is_favorite, avatar_index, created_at::text`;

// GET /api/contacts
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ${COLS} FROM contacts WHERE user_id = $1 ORDER BY name`,
      [req.user!.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/contacts
router.post('/', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = ContactSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO contacts(user_id,name,email,phone,company,job_title,address,group_name,notes,tags,is_favorite,avatar_index)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ${COLS}`,
      [me, body.name, body.email ?? null, body.phone ?? null, body.company ?? null,
       body.job_title ?? null, body.address ?? null, body.group_name ?? null,
       body.notes ?? null, body.tags ?? null, body.is_favorite ?? false,
       body.avatar_index ?? 1]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/contacts/:id
router.put('/:id', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = ContactSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE contacts SET name=$3,email=$4,phone=$5,company=$6,job_title=$7,address=$8,
       group_name=$9,notes=$10,tags=$11,is_favorite=$12,avatar_index=$13,updated_at=NOW()
       WHERE id=$1 AND user_id=$2 RETURNING ${COLS}`,
      [req.params.id, me, body.name, body.email ?? null, body.phone ?? null,
       body.company ?? null, body.job_title ?? null, body.address ?? null,
       body.group_name ?? null, body.notes ?? null, body.tags ?? null,
       body.is_favorite ?? false, body.avatar_index ?? 1]
    );
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/contacts/:id/favorite
router.patch('/:id/favorite', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { is_favorite } = z.object({ is_favorite: z.boolean() }).parse(req.body);
    const { rows } = await query(
      `UPDATE contacts SET is_favorite=$3, updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING id, is_favorite`,
      [req.params.id, me, is_favorite]
    );
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await query(`DELETE FROM contacts WHERE id=$1 AND user_id=$2`, [req.params.id, req.user!.sub]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
