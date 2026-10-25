import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif',
  'image/webp': '.webp', 'image/svg+xml': '.svg',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt', 'text/csv': '.csv',
  'application/zip': '.zip',
};

const router = Router();

// GET /api/chat/files/:filename — serve uploaded file (public, no auth needed)
router.get('/files/:filename', (req, res) => {
  const { filename } = req.params;
  if (!/^[0-9a-f-]{36}\.[a-zA-Z0-9]+$/.test(filename)) {
    res.status(400).json({ error: 'Invalid filename' }); return;
  }
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: 'File not found' }); return; }
  res.sendFile(filePath);
});

router.use(authenticate);

// GET /api/chat/contacts — all users + last-message snippet + unread count
router.get('/contacts', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { rows } = await query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.avatar,
        u.status,
        u.job_title,
        u.last_seen,
        CASE
          WHEN u.last_seen >= NOW() - INTERVAL '5 minutes'  THEN 'online'
          WHEN u.last_seen >= NOW() - INTERVAL '30 minutes' THEN 'away'
          ELSE 'offline'
        END AS online_status,
        lm.body        AS last_message,
        lm.created_at  AS last_message_at,
        lm.sender_id   AS last_sender_id,
        COALESCE(uc.cnt, 0)::int AS unread_count
      FROM users u
      LEFT JOIN LATERAL (
        SELECT body, created_at, sender_id
        FROM messages
        WHERE (sender_id = $1 AND recipient_id = u.id)
           OR (sender_id = u.id AND recipient_id = $1)
        ORDER BY created_at DESC
        LIMIT 1
      ) lm ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM messages
        WHERE sender_id = u.id AND recipient_id = $1 AND is_read = FALSE
      ) uc ON TRUE
      WHERE u.id != $1
      ORDER BY lm.created_at DESC NULLS LAST, u.name
    `, [me]);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/chat/messages?with=<userId> — conversation history (last 50)
router.get('/messages', async (req, res, next) => {
  try {
    const me    = req.user!.sub;
    const other = String(req.query.with || '');
    if (!other) { res.status(400).json({ error: 'with param required' }); return; }

    const { rows } = await query(`
      SELECT id, sender_id, recipient_id, body, is_read, created_at
      FROM messages
      WHERE (sender_id = $1 AND recipient_id = $2)
         OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY created_at ASC
      LIMIT 50
    `, [me, other]);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/chat/messages — send a message
router.post('/messages', async (req, res, next) => {
  try {
    const me = req.user!.sub;
    const { recipientId, body } = z.object({
      recipientId: z.string().uuid(),
      body:        z.string().min(1).max(2000),
    }).parse(req.body);

    const { rows } = await query(`
      INSERT INTO messages (sender_id, recipient_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, sender_id, recipient_id, body, is_read, created_at
    `, [me, recipientId, body]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /api/chat/messages/read?with=<userId> — mark all incoming as read
router.patch('/messages/read', async (req, res, next) => {
  try {
    const me    = req.user!.sub;
    const other = String(req.query.with || '');
    if (!other) { res.status(400).json({ error: 'with param required' }); return; }

    await query(`
      UPDATE messages SET is_read = TRUE
      WHERE sender_id = $1 AND recipient_id = $2 AND is_read = FALSE
    `, [other, me]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// DELETE /api/chat/messages?with=<userId> — wipe a whole conversation
router.delete('/messages', async (req, res, next) => {
  try {
    const me    = req.user!.sub;
    const other = String(req.query.with || '');
    if (!other) { res.status(400).json({ error: 'with param required' }); return; }

    await query(`
      DELETE FROM messages
      WHERE (sender_id = $1 AND recipient_id = $2)
         OR (sender_id = $2 AND recipient_id = $1)
    `, [me, other]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/chat/upload — upload a file (base64), returns { url }
router.post('/upload', async (req, res, next) => {
  try {
    const { filename, data, mimeType } = z.object({
      filename: z.string().min(1).max(255),
      data:     z.string().min(1),
      mimeType: z.string().min(1),
    }).parse(req.body);

    const ext = MIME_TO_EXT[mimeType] || path.extname(filename).toLowerCase() || '.bin';
    const id  = randomUUID();
    const storedName = id + ext;
    const base64Data = data.includes(',') ? data.split(',')[1] : data;
    fs.writeFileSync(path.join(UPLOADS_DIR, storedName), Buffer.from(base64Data, 'base64'));

    res.json({ url: `/api/chat/files/${storedName}`, filename: storedName });
  } catch (err) { next(err); }
});

export default router;
