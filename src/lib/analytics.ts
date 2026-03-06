import { query } from "./db";

// ── Recording ───────────────────────────────────────────────

export async function recordPageView(
  path: string,
  visitorHash: string | null,
  referrerSource: string | null,
  country: string | null,
  region: string | null
): Promise<void> {
  // Insert individual page view
  await query(
    `INSERT INTO page_views (path, visitor_hash, referrer_source, country, region)
     VALUES ($1, $2, $3, $4, $5)`,
    [path, visitorHash, referrerSource, country, region]
  );

  // Upsert daily stats
  await query(
    `INSERT INTO daily_stats (date, page_views, unique_visitors)
     VALUES (CURRENT_DATE, 1, 1)
     ON CONFLICT (date) DO UPDATE SET
       page_views = daily_stats.page_views + 1,
       unique_visitors = (
         SELECT COUNT(DISTINCT visitor_hash)
         FROM page_views
         WHERE created_at::date = CURRENT_DATE
       )`,
    []
  );
}

export async function recordEvent(action: string): Promise<void> {
  await query(
    `INSERT INTO events (date, action, count)
     VALUES (CURRENT_DATE, $1, 1)
     ON CONFLICT (date, action) DO UPDATE SET count = events.count + 1`,
    [action]
  );
}

// ── Querying ────────────────────────────────────────────────

export async function getStats() {
  // Run sequentially — serverless cold starts can't handle many parallel connections
  const todayStats = await query(
    `SELECT COALESCE(page_views, 0) as page_views, COALESCE(unique_visitors, 0) as unique_visitors
     FROM daily_stats WHERE date = CURRENT_DATE`
  );
  const lifetimeStats = await query(
    `SELECT COALESCE(SUM(page_views), 0) as total_views,
            COALESCE(SUM(unique_visitors), 0) as total_visitors
     FROM daily_stats`
  );
  const subscriberCount = await query(`SELECT COUNT(*) as count FROM subscribers`);

  const today = todayStats.rows[0] || { page_views: 0, unique_visitors: 0 };
  const lifetime = lifetimeStats.rows[0] || { total_views: 0, total_visitors: 0 };

  return {
    today: {
      pageViews: parseInt(today.page_views, 10),
      uniqueVisitors: parseInt(today.unique_visitors, 10),
    },
    lifetime: {
      totalViews: parseInt(lifetime.total_views, 10),
      totalVisitors: parseInt(lifetime.total_visitors, 10),
    },
    subscribers: parseInt(subscriberCount.rows[0].count, 10),
  };
}

export async function getLiveStats() {
  const result = await query(
    `SELECT COALESCE(page_views, 0) as page_views, COALESCE(unique_visitors, 0) as unique_visitors
     FROM daily_stats WHERE date = CURRENT_DATE`
  );
  const row = result.rows[0] || { page_views: 0, unique_visitors: 0 };

  return {
    pageViews: parseInt(row.page_views, 10),
    uniqueVisitors: parseInt(row.unique_visitors, 10),
  };
}

export async function getHourlyTrend(hours = 24) {
  const result = await query(
    `SELECT
       date_trunc('hour', created_at) as hour,
       COUNT(*) as views,
       COUNT(DISTINCT visitor_hash) as visitors
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '1 hour' * $1
     GROUP BY hour
     ORDER BY hour`,
    [hours]
  );

  return result.rows.map((r) => ({
    hour: r.hour,
    views: parseInt(r.views, 10),
    visitors: parseInt(r.visitors, 10),
  }));
}

export async function getDailyTrend(days = 30) {
  const result = await query(
    `SELECT date, page_views, unique_visitors
     FROM daily_stats
     WHERE date > CURRENT_DATE - $1
     ORDER BY date`,
    [days]
  );

  return result.rows.map((r) => ({
    date: r.date,
    pageViews: parseInt(r.page_views, 10),
    uniqueVisitors: parseInt(r.unique_visitors, 10),
  }));
}

export async function getTopReferrers(days = 30) {
  const result = await query(
    `SELECT referrer_source, COUNT(*) as count
     FROM page_views
     WHERE referrer_source IS NOT NULL
       AND created_at > NOW() - INTERVAL '1 day' * $1
     GROUP BY referrer_source
     ORDER BY count DESC
     LIMIT 20`,
    [days]
  );

  return result.rows.map((r) => ({
    source: r.referrer_source,
    count: parseInt(r.count, 10),
  }));
}

export async function getGeoStats(days = 30) {
  const result = await query(
    `SELECT country, region, COUNT(*) as count
     FROM page_views
     WHERE country IS NOT NULL
       AND created_at > NOW() - INTERVAL '1 day' * $1
     GROUP BY country, region
     ORDER BY count DESC
     LIMIT 30`,
    [days]
  );

  return result.rows.map((r) => ({
    country: r.country,
    region: r.region,
    count: parseInt(r.count, 10),
  }));
}

export async function getSubscriberStats() {
  const total = await query("SELECT COUNT(*) as count FROM subscribers");
  const recent = await query(
    "SELECT email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC LIMIT 10"
  );

  return {
    total: parseInt(total.rows[0].count, 10),
    recent: recent.rows.map((r) => ({
      email: r.email,
      subscribedAt: r.subscribed_at,
    })),
  };
}

export async function getTopPages(days = 30) {
  const result = await query(
    `SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
     FROM page_views
     WHERE created_at > NOW() - INTERVAL '1 day' * $1
     GROUP BY path
     ORDER BY views DESC
     LIMIT 20`,
    [days]
  );

  return result.rows.map((r) => ({
    path: r.path,
    views: parseInt(r.views, 10),
    visitors: parseInt(r.visitors, 10),
  }));
}
