import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const TaskSchema = z.object({
  title:       z.string().min(1).max(255),
  description: z.string().max(5000).nullable().optional(),
  status:      z.enum(['backlog','todo','in-progress','review','done']).optional(),
  priority:    z.enum(['low','medium','high']).optional(),
  label:       z.enum(['feature','bug','enhancement','design','urgent']).optional(),
  due_date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  position:    z.number().int().min(0).optional(),
});

const StatusSchema = z.object({
  status:   z.enum(['backlog','todo','in-progress','review','done']),
  position: z.number().int().min(0).optional(),
});

// GET /api/kanban/tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { rows } = await query(
      `SELECT id, title, description, status, priority, label,
              due_date::text, position, created_at::text
       FROM kanban_tasks WHERE user_id = $1
       ORDER BY status, position, created_at`,
      [me]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/kanban/tasks
router.post('/tasks', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = TaskSchema.parse(req.body);
    const { rows: pos } = await query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
       FROM kanban_tasks WHERE user_id = $1 AND status = $2`,
      [me, body.status ?? 'backlog']
    );
    const { rows } = await query(
      `INSERT INTO kanban_tasks(user_id, title, description, status, priority, label, due_date, position)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, title, description, status, priority, label,
                 due_date::text, position, created_at::text`,
      [me, body.title, body.description ?? null, body.status ?? 'backlog',
       body.priority ?? 'medium', body.label ?? 'feature',
       body.due_date ?? null, pos[0].next_pos]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/kanban/tasks/:id
router.put('/tasks/:id', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = TaskSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE kanban_tasks
       SET title=$3, description=$4, status=$5, priority=$6, label=$7,
           due_date=$8, updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING id, title, description, status, priority, label,
                 due_date::text, position, created_at::text`,
      [req.params.id, me, body.title, body.description ?? null,
       body.status ?? 'backlog', body.priority ?? 'medium', body.label ?? 'feature',
       body.due_date ?? null]
    );
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/kanban/tasks/:id/status  (drag-and-drop)
router.patch('/tasks/:id/status', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = StatusSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE kanban_tasks
       SET status=$3, position=COALESCE($4, position), updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING id, status, position`,
      [req.params.id, me, body.status, body.position ?? null]
    );
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/kanban/tasks/:id
router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    await query(`DELETE FROM kanban_tasks WHERE id=$1 AND user_id=$2`, [req.params.id, me]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
