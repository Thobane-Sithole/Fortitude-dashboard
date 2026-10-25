import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/invoices
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT i.*, c.name AS client_name, c.initials AS client_initials, c.email AS client_email
      FROM invoices i
      LEFT JOIN clients c ON c.id = i.client_id
      ORDER BY i.issued_date DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/invoices/stats
router.get('/stats', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*)                                                     AS total_count,
        COALESCE(SUM(total),0)                                       AS total_billed,
        COALESCE(SUM(total) FILTER (WHERE status='Paid'),0)          AS paid,
        COALESCE(SUM(total) FILTER (WHERE status='Pending'),0)       AS pending,
        COALESCE(SUM(total) FILTER (WHERE status='Overdue'),0)       AS overdue,
        COUNT(*) FILTER (WHERE status='Paid')                        AS paid_count,
        COUNT(*) FILTER (WHERE status='Pending')                     AS pending_count,
        COUNT(*) FILTER (WHERE status='Overdue')                     AS overdue_count
      FROM invoices`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/invoices/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [inv, items] = await Promise.all([
      query(`
        SELECT i.*, c.name AS client_name, c.email AS client_email, c.initials AS client_initials
        FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
        WHERE i.id = $1`, [req.params.id]),
      query(`SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id`, [req.params.id]),
    ]);
    if (!inv.rows[0]) { res.status(404).json({ error: 'Invoice not found' }); return; }
    res.json({ ...inv.rows[0], items: items.rows });
  } catch (err) { next(err); }
});

// PATCH /api/invoices/:id/status (Finance | Admin)
router.patch('/:id/status', requireRole('Admin','Finance','Manager'), async (req, res, next) => {
  try {
    const { status } = req.body as { status: string };
    const valid = ['Pending','Paid','Overdue','Cancelled'];
    if (!valid.includes(status)) { res.status(400).json({ error: `status must be one of ${valid.join(', ')}` }); return; }

    const paidDate = status === 'Paid' ? 'CURRENT_DATE' : 'NULL';
    const { rows } = await query(
      `UPDATE invoices SET status = $1, paid_date = ${paidDate} WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Invoice not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
