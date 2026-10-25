import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query<T extends Record<string, unknown> ? T : never>(text, params);
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB] ${text.slice(0, 80)} — ${Date.now() - start}ms`);
  }
  return res;
}
