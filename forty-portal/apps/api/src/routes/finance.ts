import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('Admin','Finance','Manager'));

// GET /api/finance/overview
router.get('/overview', async (_req, res, next) => {
  try {
    const [balance, monthly, budgets, upcoming, txns] = await Promise.all([
      query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE type='Income'),0)  AS income,
          COALESCE(SUM(amount) FILTER (WHERE type='Expense'),0) AS expenses
        FROM transactions WHERE status = 'Completed'`),
      query(`
        SELECT
          date_trunc('month', txn_date) AS month,
          COALESCE(SUM(amount) FILTER (WHERE type='Income'),0)  AS income,
          COALESCE(SUM(amount) FILTER (WHERE type='Expense'),0) AS expenses
        FROM transactions
        WHERE txn_date >= date_trunc('year', NOW())
        GROUP BY 1 ORDER BY 1`),
      query(`SELECT name AS category, spent, total AS allocated FROM budgets ORDER BY name`),
      query(`SELECT * FROM upcoming_payments WHERE due_date >= CURRENT_DATE ORDER BY due_date LIMIT 10`),
      query(`
        SELECT t.*, i.id AS invoice_ref
        FROM transactions t LEFT JOIN invoices i ON i.id = t.invoice_id
        ORDER BY t.txn_date DESC LIMIT 10`),
    ]);

    const income = Number(balance.rows[0].income);
    const expenses = Number(balance.rows[0].expenses);

    res.json({
      balance: income - expenses,
      income,
      expenses,
      budgets: budgets.rows,
      upcomingPayments: upcoming.rows,
      recentTransactions: txns.rows,
    });
  } catch (err) { next(err); }
});

export default router;
