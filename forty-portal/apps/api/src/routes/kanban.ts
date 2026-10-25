import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const TaskSchema = z.object({
  title:        z.string().min(1).max(255),
  description:  z.string().max(5000).nullable().optional(),
  status:       z.enum(['backlog','todo','in-progress','review','done']).optional(),
  priority:     z.enum(['low','medium','high']).optional(),
  label:        z.enum(['feature','bug','enhancement','design','urgent']).optional(),
  due_date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  position:     z.number().int().min(0).optional(),
  story_points: z.number().int().min(1).max(200).nullable().optional(),
  checklist:    z.array(z.object({ text: z.string().min(1), done: z.boolean() })).optional(),
  assignee_ids: z.array(z.string().uuid()).optional(),
});

const StatusSchema = z.object({
  status:   z.enum(['backlog','todo','in-progress','review','done']),
  position: z.number().int().min(0).optional(),
});

const ChecklistSchema = z.object({
  checklist: z.array(z.object({ text: z.string().min(1), done: z.boolean() })),
});

const TASK_COLS = `
  t.id, t.title, t.description, t.status, t.priority, t.label,
  t.due_date::text, t.position, t.created_at::text,
  t.story_points,
  COALESCE(t.checklist, '[]'::jsonb) AS checklist,
  COALESCE(
    (SELECT json_agg(json_build_object('id', u.id::text, 'name', u.name) ORDER BY u.name)
     FROM users u WHERE u.id = ANY(t.assignee_ids)),
    '[]'::json
  ) AS assignees`;

// GET /api/kanban/users  — assignee picker
router.get('/users', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id::text, name FROM users ORDER BY name`,
      []
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/kanban/tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { rows } = await query(
      `SELECT ${TASK_COLS}
       FROM kanban_tasks t WHERE t.user_id = $1
       ORDER BY t.status, t.position, t.created_at`,
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
      `INSERT INTO kanban_tasks(user_id,title,description,status,priority,label,due_date,position,story_points,checklist,assignee_ids)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [me, body.title, body.description ?? null, body.status ?? 'backlog',
       body.priority ?? 'medium', body.label ?? 'feature',
       body.due_date ?? null, pos[0].next_pos,
       body.story_points ?? null,
       JSON.stringify(body.checklist ?? []),
       body.assignee_ids ?? []]
    );
    const { rows: full } = await query(
      `SELECT ${TASK_COLS} FROM kanban_tasks t WHERE t.id = $1`,
      [rows[0].id]
    );
    res.status(201).json(full[0]);
  } catch (err) { next(err); }
});

// PUT /api/kanban/tasks/:id
router.put('/tasks/:id', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = TaskSchema.parse(req.body);
    await query(
      `UPDATE kanban_tasks
       SET title=$3, description=$4, status=$5, priority=$6, label=$7,
           due_date=$8, story_points=$9, checklist=$10, assignee_ids=$11, updated_at=NOW()
       WHERE id=$1 AND user_id=$2`,
      [req.params.id, me, body.title, body.description ?? null,
       body.status ?? 'backlog', body.priority ?? 'medium', body.label ?? 'feature',
       body.due_date ?? null, body.story_points ?? null,
       JSON.stringify(body.checklist ?? []),
       body.assignee_ids ?? []]
    );
    const { rows } = await query(
      `SELECT ${TASK_COLS} FROM kanban_tasks t WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, me]
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

// PATCH /api/kanban/tasks/:id/checklist
router.patch('/tasks/:id/checklist', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { checklist } = ChecklistSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE kanban_tasks SET checklist=$3, updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING id, COALESCE(checklist, '[]'::jsonb) AS checklist`,
      [req.params.id, me, JSON.stringify(checklist)]
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

// ── Comments ──────────────────────────────────────────────────────────────────

const CommentSchema = z.object({ body: z.string().min(1).max(5000) });

// GET /api/kanban/tasks/:id/comments
router.get('/tasks/:id/comments', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.id, c.body, c.created_at::text,
              u.id::text AS user_id, u.name AS user_name
       FROM kanban_task_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/kanban/tasks/:id/comments
router.post('/tasks/:id/comments', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { body } = CommentSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO kanban_task_comments(task_id, user_id, body)
       VALUES($1, $2, $3)
       RETURNING id, body, created_at::text`,
      [req.params.id, me, body]
    );
    const { rows: user } = await query(`SELECT id::text, name FROM users WHERE id=$1`, [me]);
    res.status(201).json({ ...rows[0], user_id: user[0].id, user_name: user[0].name });
  } catch (err) { next(err); }
});

// DELETE /api/kanban/tasks/:taskId/comments/:commentId
router.delete('/tasks/:taskId/comments/:commentId', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    await query(
      `DELETE FROM kanban_task_comments WHERE id=$1 AND user_id=$2`,
      [req.params.commentId, me]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
