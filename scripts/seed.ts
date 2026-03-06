/**
 * Seed script: populates PostgreSQL with static data from lenses.ts
 * Run once: npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL env var (or .env file in project root)
 */

import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import static data — we use require since tsx handles it
import {
  LENSES,
  SHOCK_EVENTS,
} from "../src/data/lenses";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Add it to .env or set as env var.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  console.log("🌱 Seeding Crisis Index database...\n");

  // ── Create schema ───────────────────────────────────────────

  console.log("📦 Creating tables...");
  await pool.query(`
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
  `);
  console.log("  ✅ Tables created\n");

  // ── Seed lenses ─────────────────────────────────────────────

  console.log("🔭 Seeding lenses...");
  for (const lens of LENSES) {
    await pool.query(
      `INSERT INTO lenses (id, tier, name, short_name, framework, icon, score, weight, tagline, editorial, metrics, spark_data, spark_label, historical_scores)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         tier = EXCLUDED.tier,
         name = EXCLUDED.name,
         short_name = EXCLUDED.short_name,
         framework = EXCLUDED.framework,
         icon = EXCLUDED.icon,
         score = EXCLUDED.score,
         weight = EXCLUDED.weight,
         tagline = EXCLUDED.tagline,
         editorial = EXCLUDED.editorial,
         metrics = EXCLUDED.metrics,
         spark_data = EXCLUDED.spark_data,
         spark_label = EXCLUDED.spark_label,
         historical_scores = EXCLUDED.historical_scores,
         updated_at = NOW()`,
      [
        lens.id,
        lens.tier,
        lens.name,
        lens.shortName,
        lens.framework,
        lens.icon,
        lens.score,
        lens.weight,
        lens.tagline,
        lens.editorial,
        JSON.stringify(lens.metrics),
        JSON.stringify(lens.sparkData),
        lens.sparkLabel,
        JSON.stringify(lens.historicalScores),
      ]
    );
    console.log(`  ✅ ${lens.name} (score: ${lens.score})`);
  }

  // ── Seed shock events ───────────────────────────────────────

  console.log("\n⚡ Seeding shock events...");
  // Clear existing static events first (keep any manually added ones)
  await pool.query("DELETE FROM shock_events WHERE id <= 100");

  for (const event of SHOCK_EVENTS) {
    await pool.query(
      `INSERT INTO shock_events (date, lens_id, lens_name, delta, event, detail)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [event.date, event.lens, event.lensName, event.delta, event.event, event.detail]
    );
    console.log(`  ✅ ${event.date}: ${event.event.slice(0, 50)}...`);
  }

  // ── Migrate existing subscribers from JSON ──────────────────

  const subscribersPath = path.join(__dirname, "..", "data", "subscribers.json");
  if (fs.existsSync(subscribersPath)) {
    console.log("\n📧 Migrating subscribers from JSON...");
    try {
      const raw = fs.readFileSync(subscribersPath, "utf-8");
      const subscribers = JSON.parse(raw) as {
        email: string;
        subscribedAt: string;
      }[];

      for (const sub of subscribers) {
        await pool.query(
          `INSERT INTO subscribers (email, subscribed_at)
           VALUES ($1, $2)
           ON CONFLICT (email) DO NOTHING`,
          [sub.email, sub.subscribedAt]
        );
        console.log(`  ✅ ${sub.email}`);
      }
      console.log(`  Migrated ${subscribers.length} subscriber(s)`);
    } catch (err) {
      console.log("  ⚠️ Could not read subscribers.json, skipping migration");
    }
  }

  // ── Summary ─────────────────────────────────────────────────

  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM lenses) as lenses,
      (SELECT COUNT(*) FROM shock_events WHERE active = TRUE) as events,
      (SELECT COUNT(*) FROM subscribers) as subscribers
  `);

  const c = counts.rows[0];
  console.log("\n────────────────────────────────────────");
  console.log(`🎯 Seed complete!`);
  console.log(`   Lenses:      ${c.lenses}`);
  console.log(`   Events:      ${c.events}`);
  console.log(`   Subscribers: ${c.subscribers}`);
  console.log("────────────────────────────────────────\n");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  pool.end();
  process.exit(1);
});
