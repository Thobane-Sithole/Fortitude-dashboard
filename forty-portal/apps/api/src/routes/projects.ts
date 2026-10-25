import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/projects
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT p.*, c.name AS client_name, c.initials AS client_initials
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      ORDER BY p.end_date DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [proj, members] = await Promise.all([
      query(`
        SELECT p.*, c.name AS client_name, c.email AS client_email
        FROM projects p LEFT JOIN clients c ON c.id = p.client_id
        WHERE p.id = $1`, [req.params.id]),
      query(`
        SELECT u.id, u.name, u.avatar, u.job_title, pm.role AS project_role
        FROM project_members pm JOIN users u ON u.id = pm.user_id
        WHERE pm.project_id = $1`, [req.params.id]),
    ]);
    if (!proj.rows[0]) { res.status(404).json({ error: 'Project not found' }); return; }
    res.json({ ...proj.rows[0], members: members.rows });
  } catch (err) { next(err); }
});

// POST /api/projects (Admin | Manager)
router.post('/', requireRole('Admin','Manager'), async (req, res, next) => {
  try {
    const body = z.object({
      id:          z.string().regex(/^FP-\d{3}$/),
      name:        z.string().min(2),
      client_id:   z.string().uuid().optional(),
      description: z.string().optional(),
      status:      z.enum(['Planning','In Progress','Delivered','On Hold']).default('Planning'),
      priority:    z.enum(['Low','Medium','High','Critical']).default('Medium'),
      start_date:  z.string().optional(),
      end_date:    z.string().optional(),
      total_value: z.number().min(0).default(0),
    }).parse(req.body);

    const { rows } = await query(
      `INSERT INTO projects (id, name, client_id, description, status, priority, start_date, end_date, total_value)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [body.id, body.name, body.client_id, body.description, body.status, body.priority, body.start_date, body.end_date, body.total_value]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/projects/:id
router.patch('/:id', requireRole('Admin','Manager'), async (req, res, next) => {
  try {
    const body = z.object({
      name:            z.string().optional(),
      status:          z.enum(['Planning','In Progress','Delivered','On Hold']).optional(),
      priority:        z.enum(['Low','Medium','High','Critical']).optional(),
      progress:        z.number().min(0).max(100).optional(),
      end_date:        z.string().optional(),
      hours_logged:    z.number().optional(),
      tasks_total:     z.number().optional(),
      tasks_completed: z.number().optional(),
    }).parse(req.body);

    const sets: string[] = [];
    const vals: unknown[] = [];
    Object.entries(body).forEach(([k, v]) => { if (v !== undefined) { sets.push(`${k} = $${vals.push(v)}`); } });
    if (!sets.length) { res.status(400).json({ error: 'Nothing to update' }); return; }

    vals.push(req.params.id);
    const { rows } = await query(
      `UPDATE projects SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rows[0]) { res.status(404).json({ error: 'Project not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
