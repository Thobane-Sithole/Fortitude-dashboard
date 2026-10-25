import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const EventSchema = z.object({
  title:       z.string().min(1).max(255),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time:  z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  end_time:    z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  all_day:     z.boolean().optional(),
  category:    z.enum(['primary','success','warning','danger','info']).optional(),
  description: z.string().max(2000).optional(),
});

// GET /api/calendar/events?month=YYYY-MM  (defaults to current month)
router.get('/events', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const month = String(req.query.month || '');
    let where = 'WHERE user_id = $1';
    const params: unknown[] = [me];
    if (/^\d{4}-\d{2}$/.test(month)) {
      where += ` AND date_trunc('month', date) = date_trunc('month', $2::date)`;
      params.push(month + '-01');
    }
    const { rows } = await query(
      `SELECT id, title, date::text, start_time::text, end_time::text, all_day, category, description, created_at
       FROM calendar_events ${where} ORDER BY date, start_time NULLS LAST`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/calendar/events
router.post('/events', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = EventSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO calendar_events(user_id,title,date,start_time,end_time,all_day,category,description)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,title,date::text,start_time::text,end_time::text,all_day,category,description,created_at`,
      [me, body.title, body.date, body.start_time ?? null, body.end_time ?? null,
       body.all_day ?? false, body.category ?? 'primary', body.description ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/calendar/events/:id
router.put('/events/:id', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const body = EventSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE calendar_events
       SET title=$3, date=$4, start_time=$5, end_time=$6, all_day=$7, category=$8, description=$9, updated_at=NOW()
       WHERE id=$1 AND user_id=$2
       RETURNING id,title,date::text,start_time::text,end_time::text,all_day,category,description`,
      [req.params.id, me, body.title, body.date, body.start_time ?? null, body.end_time ?? null,
       body.all_day ?? false, body.category ?? 'primary', body.description ?? null]
    );
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/calendar/events/:id
router.delete('/events/:id', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    await query(`DELETE FROM calendar_events WHERE id=$1 AND user_id=$2`, [req.params.id, me]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
