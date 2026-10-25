import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard — aggregated stats for the main dashboard
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const [revenue, projects, users, invoices, recent, activities] = await Promise.all([
      // Total revenue & Q4 target
      query<{ total: string }>(`SELECT COALESCE(SUM(total),0) AS total FROM invoices WHERE status = 'Paid'`),
      // Active projects count
      query<{ count: string; delivered: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE status != 'Delivered') AS count,
          COUNT(*) FILTER (WHERE status = 'Delivered') AS delivered
        FROM projects`),
      // Team stats
      query<{ total: string; active: string }>(`
        SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='Active') AS active FROM users`),
      // Invoice stats
      query<{ paid: string; pending: string; overdue: string }>(`
        SELECT
          COALESCE(SUM(total) FILTER (WHERE status='Paid'),0)    AS paid,
          COALESCE(SUM(total) FILTER (WHERE status='Pending'),0) AS pending,
          COALESCE(SUM(total) FILTER (WHERE status='Overdue'),0) AS overdue
        FROM invoices`),
      // Recent invoices (5)
      query<{ id: string; client_name: string; total: string; status: string; issued_date: string }>(`
        SELECT i.id, c.name AS client_name, i.total, i.status, i.issued_date
        FROM invoices i
        JOIN clients c ON c.id = i.client_id
        ORDER BY i.issued_date DESC LIMIT 5`),
      // Recent activities (8)
      query<{ action: string; created_at: string; user_name: string }>(`
        SELECT a.action, a.created_at, u.name AS user_name
        FROM activities a
        JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC LIMIT 8`),
    ]);

    res.json({
      revenue: {
        total: Number(revenue.rows[0].total),
        q4Target: 350_000,
        pct: Math.round((Number(revenue.rows[0].total) / 350_000) * 100),
      },
      projects: {
        active: Number(projects.rows[0].count),
        delivered: Number(projects.rows[0].delivered),
      },
      team: {
        total: Number(users.rows[0].total),
        active: Number(users.rows[0].active),
      },
      invoices: {
        paid: Number(invoices.rows[0].paid),
        pending: Number(invoices.rows[0].pending),
        overdue: Number(invoices.rows[0].overdue),
      },
      recentInvoices: recent.rows,
      recentActivities: activities.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
