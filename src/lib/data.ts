import { query } from "./db";
import {
  LENSES,
  SHOCK_EVENTS,
  type Lens,
  type ShockEvent,
  type Metric,
} from "@/data/lenses";

// ── Lenses ──────────────────────────────────────────────────

export async function getLenses(): Promise<Lens[]> {
  try {
    const result = await query(
      "SELECT * FROM lenses ORDER BY CASE WHEN tier = 1 THEN 0 ELSE 1 END, name"
    );
    if (result.rows.length === 0) return LENSES;

    return result.rows.map(rowToLens);
  } catch {
    console.log("[Data] DB unavailable, using static lenses");
    return LENSES;
  }
}

export async function getLens(id: string): Promise<Lens | null> {
  try {
    const result = await query("SELECT * FROM lenses WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      // Fall back to static
      return LENSES.find((l) => l.id === id) || null;
    }
    return rowToLens(result.rows[0]);
  } catch {
    console.log(`[Data] DB unavailable, using static lens: ${id}`);
    return LENSES.find((l) => l.id === id) || null;
  }
}

export async function updateLens(
  id: string,
  data: {
    score?: number;
    metrics?: Metric[];
    editorial?: string;
    tagline?: string;
    sparkData?: number[];
    sparkLabel?: string;
    historicalScores?: Record<number, number>;
  }
): Promise<Lens | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.score !== undefined) {
    sets.push(`score = $${paramIndex++}`);
    values.push(data.score);
  }
  if (data.metrics !== undefined) {
    sets.push(`metrics = $${paramIndex++}`);
    values.push(JSON.stringify(data.metrics));
  }
  if (data.editorial !== undefined) {
    sets.push(`editorial = $${paramIndex++}`);
    values.push(data.editorial);
  }
  if (data.tagline !== undefined) {
    sets.push(`tagline = $${paramIndex++}`);
    values.push(data.tagline);
  }
  if (data.sparkData !== undefined) {
    sets.push(`spark_data = $${paramIndex++}`);
    values.push(JSON.stringify(data.sparkData));
  }
  if (data.sparkLabel !== undefined) {
    sets.push(`spark_label = $${paramIndex++}`);
    values.push(data.sparkLabel);
  }
  if (data.historicalScores !== undefined) {
    sets.push(`historical_scores = $${paramIndex++}`);
    values.push(JSON.stringify(data.historicalScores));
  }

  if (sets.length === 0) return getLens(id);

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE lenses SET ${sets.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return null;
  return rowToLens(result.rows[0]);
}

// ── Shock Events ────────────────────────────────────────────

export async function getShockEvents(): Promise<ShockEvent[]> {
  try {
    const result = await query(
      "SELECT * FROM shock_events WHERE active = TRUE ORDER BY created_at DESC"
    );
    if (result.rows.length === 0) return SHOCK_EVENTS;

    return result.rows.map((row) => ({
      date: row.date,
      lens: row.lens_id,
      lensName: row.lens_name,
      delta: row.delta,
      event: row.event,
      detail: row.detail,
    }));
  } catch {
    console.log("[Data] DB unavailable, using static shock events");
    return SHOCK_EVENTS;
  }
}

export async function createShockEvent(data: {
  date: string;
  lensId: string;
  lensName: string;
  delta: string;
  event: string;
  detail: string;
}): Promise<{ id: number }> {
  const result = await query(
    `INSERT INTO shock_events (date, lens_id, lens_name, delta, event, detail)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [data.date, data.lensId, data.lensName, data.delta, data.event, data.detail]
  );
  return { id: result.rows[0].id };
}

export async function deleteShockEvent(id: number): Promise<boolean> {
  const result = await query(
    "UPDATE shock_events SET active = FALSE WHERE id = $1",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

// ── Subscribers ─────────────────────────────────────────────

export async function addSubscriber(email: string): Promise<"subscribed" | "exists"> {
  try {
    await query(
      `INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email.trim().toLowerCase()]
    );
    // Check if it was actually inserted by seeing if we get a conflict
    const check = await query("SELECT id FROM subscribers WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);
    return check.rows.length > 0 ? "subscribed" : "exists";
  } catch (err) {
    // If unique violation, already exists
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") return "exists";
    throw err;
  }
}

export async function getSubscriberCount(): Promise<number> {
  const result = await query("SELECT COUNT(*) as count FROM subscribers");
  return parseInt(result.rows[0].count, 10);
}

export async function getRecentSubscribers(
  limit = 10
): Promise<{ email: string; subscribedAt: string }[]> {
  const result = await query(
    "SELECT email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC LIMIT $1",
    [limit]
  );
  return result.rows.map((r) => ({
    email: r.email,
    subscribedAt: r.subscribed_at,
  }));
}

// ── Helpers ─────────────────────────────────────────────────

interface LensRow {
  id: string;
  tier: number;
  name: string;
  short_name: string;
  framework: string;
  icon: string;
  score: number;
  weight: string;
  tagline: string;
  editorial: string;
  metrics: Metric[];
  spark_data: number[];
  spark_label: string;
  historical_scores: Record<string, number>;
}

function rowToLens(row: LensRow): Lens {
  return {
    id: row.id,
    tier: row.tier as 1 | 2,
    name: row.name,
    shortName: row.short_name,
    framework: row.framework,
    icon: row.icon,
    score: row.score,
    weight: parseFloat(String(row.weight)),
    tagline: row.tagline,
    editorial: row.editorial,
    metrics: row.metrics,
    sparkData: row.spark_data,
    sparkLabel: row.spark_label,
    historicalScores: Object.fromEntries(
      Object.entries(row.historical_scores).map(([k, v]) => [parseInt(k), v])
    ),
  };
}
