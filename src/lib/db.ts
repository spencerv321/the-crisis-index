import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err) => {
      console.error("[DB] Pool error:", err.message);
    });
  }

  return pool;
}

export async function query(text: string, params?: unknown[]) {
  const p = getPool();
  if (!p) throw new Error("No database connection");
  return p.query(text, params);
}

export async function initSchema(): Promise<void> {
  const p = getPool();
  if (!p) {
    console.log("[DB] No DATABASE_URL — skipping schema init");
    return;
  }

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS lenses (
        id TEXT PRIMARY KEY,
        tier INT NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        framework TEXT NOT NULL,
        icon TEXT NOT NULL,
        score INT NOT NULL,
        weight DECIMAL NOT NULL,
        tagline TEXT NOT NULL,
        editorial TEXT NOT NULL,
        metrics JSONB NOT NULL,
        spark_data JSONB NOT NULL,
        spark_label TEXT NOT NULL,
        historical_scores JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shock_events (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        lens_id TEXT NOT NULL,
        lens_name TEXT NOT NULL,
        delta TEXT NOT NULL,
        event TEXT NOT NULL,
        detail TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS daily_stats (
        date DATE PRIMARY KEY,
        page_views INT DEFAULT 0,
        unique_visitors INT DEFAULT 0,
        api_calls INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        path TEXT NOT NULL,
        visitor_hash TEXT,
        referrer_source TEXT,
        country TEXT,
        region TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        date DATE DEFAULT CURRENT_DATE,
        action TEXT NOT NULL,
        count INT DEFAULT 1,
        UNIQUE(date, action)
      );

      CREATE TABLE IF NOT EXISTS feed_log (
        id SERIAL PRIMARY KEY,
        refreshed_at TIMESTAMPTZ DEFAULT NOW(),
        metrics_updated INT DEFAULT 0,
        metrics_errored INT DEFAULT 0,
        results_json JSONB
      );
    `);

    console.log("[DB] Schema initialized");
  } catch (err) {
    console.error("[DB] Schema init failed:", err);
    throw err;
  }
}
