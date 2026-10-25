import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/crm/deals
router.get('/deals', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT d.*, c.name AS client_name, c.initials AS client_initials,
             u.name AS owner_name, u.avatar AS owner_avatar
      FROM deals d
      LEFT JOIN clients c ON c.id = d.client_id
      LEFT JOIN users   u ON u.id = d.owner_id
      ORDER BY d.updated_at DESC`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/crm/pipeline — count + value grouped by stage
router.get('/pipeline', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT stage,
             COUNT(*)           AS count,
             COALESCE(SUM(value),0) AS value
      FROM deals
      GROUP BY stage
      ORDER BY ARRAY_POSITION(ARRAY['Lead','Qualified','Proposal','Negotiation','Won','Lost'], stage)`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/crm/overview — KPIs
router.get('/overview', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE stage IN ('Lead','Qualified','Proposal'))      AS leads,
        COUNT(DISTINCT client_id) FILTER (WHERE stage NOT IN ('Won','Lost'))  AS "activeClients",
        COUNT(*) FILTER (WHERE stage = 'Won')                                 AS delivered,
        COALESCE(SUM(value) FILTER (WHERE stage NOT IN ('Lost')),0)           AS revenue
      FROM deals`);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/crm/clients
router.get('/clients', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT c.*,
             COUNT(DISTINCT d.id) AS deal_count,
             COALESCE(SUM(d.value) FILTER (WHERE d.stage='Won'),0) AS total_revenue
      FROM clients c
      LEFT JOIN deals d ON d.client_id = c.id
      GROUP BY c.id ORDER BY c.name`);
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
