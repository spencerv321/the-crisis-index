/**
 * Cooked Metrics Feeds — data pipeline for Are We Cooked?
 *
 * Fetches ~10 new metrics from FRED, BLS, World Bank, and Yahoo Finance
 * and writes them to the `cooked_metrics` table.
 *
 * Some cooked metrics also exist in Crisis Index lenses (shared metrics).
 * Those are read directly from the lenses table by the cooked site.
 * This file only handles metrics that DON'T already exist in Crisis Index.
 *
 * Called by /api/admin/refresh-data alongside FRED and external feeds.
 */

import { getLatestObservation, type FredObservation } from "./fred";
import { query } from "./db";

// ── Types ────────────────────────────────────────────────────

interface CookedMetricDef {
  id: string;
  bucket: "affordability" | "debt" | "opportunity" | "social" | "inequality";
  label: string;
  spectrumMin: number;
  spectrumMax: number;
  invert: boolean; // true = higher value = less cooked
  sourceLabel: string;
  fetch: () => Promise<{ value: string; num: number; dataDate?: string } | null>;
}

export interface CookedRefreshResult {
  id: string;
  bucket: string;
  label: string;
  oldValue: string | null;
  newValue: string | null;
  status: "updated" | "unchanged" | "error" | "skipped";
  error?: string;
}

// ── BLS API Helper ───────────────────────────────────────────

async function fetchBLSSeries(
  seriesId: string
): Promise<{ value: number; year: string; period: string } | null> {
  try {
    const apiKey = process.env.BLS_API_KEY;
    const currentYear = new Date().getFullYear();
    const body = JSON.stringify({
      seriesid: [seriesId],
      startyear: String(currentYear - 1),
      endyear: String(currentYear),
      ...(apiKey ? { registrationkey: apiKey } : {}),
    });

    const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      Results: {
        series: {
          data: { year: string; period: string; value: string }[];
        }[];
      };
    };

    const series = data.Results?.series?.[0]?.data;
    if (!series?.length) return null;

    // BLS data sorted newest first
    return {
      value: parseFloat(series[0].value),
      year: series[0].year,
      period: series[0].period,
    };
  } catch (err) {
    console.error(`[CookedFeeds] BLS ${seriesId} error:`, err);
    return null;
  }
}

// ── Yahoo Finance Helper ─────────────────────────────────────

async function fetchSP500(): Promise<{ price: number } | null> {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1d&interval=1d";
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      chart: {
        result: {
          meta: { regularMarketPrice: number };
        }[];
      };
    };

    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!price) return null;
    return { price };
  } catch (err) {
    console.error("[CookedFeeds] S&P 500 error:", err);
    return null;
  }
}

// ── Feed Definitions ─────────────────────────────────────────

const COOKED_FEEDS: CookedMetricDef[] = [
  // ── Affordability ──

  {
    id: "cpi-groceries",
    bucket: "affordability",
    label: "Grocery prices (CPI)",
    spectrumMin: 250,
    spectrumMax: 350,
    invert: false,
    sourceLabel: "BLS",
    fetch: async () => {
      const data = await fetchBLSSeries("CUUR0000SAF11");
      if (!data) return null;
      // CPI index value — higher = more expensive
      return {
        value: `${data.value.toFixed(1)}`,
        num: data.value,
        dataDate: `${data.year}-${data.period.replace("M", "")}`,
      };
    },
  },

  {
    id: "cpi-shelter",
    bucket: "affordability",
    label: "Rent & shelter (CPI)",
    spectrumMin: 300,
    spectrumMax: 450,
    invert: false,
    sourceLabel: "BLS",
    fetch: async () => {
      const data = await fetchBLSSeries("CUUR0000SEHA");
      if (!data) return null;
      return {
        value: `${data.value.toFixed(1)}`,
        num: data.value,
        dataDate: `${data.year}-${data.period.replace("M", "")}`,
      };
    },
  },

  // ── Debt & Strain ──

  {
    id: "consumer-debt-service",
    bucket: "debt",
    label: "Consumer debt service ratio",
    spectrumMin: 4,
    spectrumMax: 7,
    invert: false,
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("CDSP");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(1)}%`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  {
    id: "credit-card-delinquency",
    bucket: "debt",
    label: "Credit card delinquency rate",
    spectrumMin: 1,
    spectrumMax: 5,
    invert: false,
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("DRCCLACBS");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(2)}%`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  {
    id: "personal-savings-rate",
    bucket: "debt",
    label: "Personal savings rate",
    spectrumMin: 2,
    spectrumMax: 10,
    invert: true, // higher savings = less cooked
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("PSAVERT");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(1)}%`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  // ── Opportunity ──

  {
    id: "youth-unemployment",
    bucket: "opportunity",
    label: "Youth unemployment (20-24)",
    spectrumMin: 4,
    spectrumMax: 15,
    invert: false,
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("LNS14000036");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(1)}%`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  {
    id: "homeownership-young",
    bucket: "opportunity",
    label: "Homeownership rate (25-34)",
    spectrumMin: 25,
    spectrumMax: 55,
    invert: true, // higher ownership = less cooked
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("CXUHOMEOWNLB0403M");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(1)}%`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  // ── Social Health ──

  {
    id: "consumer-sentiment",
    bucket: "social",
    label: "Consumer sentiment",
    spectrumMin: 50,
    spectrumMax: 110,
    invert: true, // higher sentiment = less cooked
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("UMCSENT");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(1)}`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  {
    id: "case-shiller-hpi",
    bucket: "social",
    label: "Home price index (Case-Shiller)",
    spectrumMin: 150,
    spectrumMax: 350,
    invert: false,
    sourceLabel: "FRED",
    fetch: async () => {
      const obs = await getLatestObservation("CSUSHPINSA");
      if (!obs) return null;
      return {
        value: `${obs.value.toFixed(1)}`,
        num: obs.value,
        dataDate: obs.date,
      };
    },
  },

  {
    id: "fertility-rate",
    bucket: "social",
    label: "Fertility rate",
    spectrumMin: 1.4,
    spectrumMax: 2.1,
    invert: true, // higher fertility = less cooked
    sourceLabel: "World Bank",
    fetch: async () => {
      try {
        const url =
          "https://api.worldbank.org/v2/country/USA/indicator/SP.DYN.TFRT.IN?format=json&mrnev=1";
        const res = await fetch(url, { next: { revalidate: 0 } });
        if (!res.ok) return null;
        const data = (await res.json()) as [
          unknown,
          { value: number | null; date: string }[],
        ];
        if (!data?.[1]?.length || data[1][0].value === null) return null;
        return {
          value: `${data[1][0].value.toFixed(2)}`,
          num: data[1][0].value,
          dataDate: data[1][0].date,
        };
      } catch (err) {
        console.error("[CookedFeeds] Fertility rate error:", err);
        return null;
      }
    },
  },

  // ── Inequality & Disconnect ──

  {
    id: "sentiment-vs-sp500",
    bucket: "inequality",
    label: "Sentiment vs S&P 500 gap",
    spectrumMin: -30,
    spectrumMax: 30,
    invert: false, // positive gap = market outpacing sentiment = more cooked
    sourceLabel: "FRED + Yahoo",
    fetch: async () => {
      // Consumer sentiment normalized to 0-100 scale vs S&P 500 YoY performance
      const [sentiment, sp500] = await Promise.all([
        getLatestObservation("UMCSENT"),
        fetchSP500(),
      ]);
      if (!sentiment || !sp500) return null;

      // Normalize sentiment: 50-110 range → 0-100
      const sentimentNorm = ((sentiment.value - 50) / 60) * 100;
      // S&P 500 as a simple "markets say things are fine" proxy
      // If S&P > 4000 and sentiment < 70, there's a disconnect
      const sp500Norm = Math.min(100, (sp500.price / 5500) * 100);

      const gap = sp500Norm - sentimentNorm;
      const sign = gap >= 0 ? "+" : "";
      return {
        value: `${sign}${gap.toFixed(0)} pts`,
        num: parseFloat(gap.toFixed(1)),
        dataDate: sentiment.date,
      };
    },
  },
];

// ── Refresh Engine ────────────────────────────────────────────

export async function refreshCookedFeeds(): Promise<CookedRefreshResult[]> {
  const results: CookedRefreshResult[] = [];

  // Ensure table exists
  await query(`
    CREATE TABLE IF NOT EXISTS cooked_metrics (
      id TEXT PRIMARY KEY,
      bucket TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT,
      num DECIMAL,
      spectrum_min DECIMAL,
      spectrum_max DECIMAL,
      invert BOOLEAN DEFAULT FALSE,
      feed_id TEXT,
      source_label TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      data_date TEXT
    )
  `);

  // Ensure score history table exists
  await query(`
    CREATE TABLE IF NOT EXISTS cooked_scores (
      id SERIAL PRIMARY KEY,
      score DECIMAL NOT NULL,
      bucket_scores JSONB NOT NULL,
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const feed of COOKED_FEEDS) {
    const result: CookedRefreshResult = {
      id: feed.id,
      bucket: feed.bucket,
      label: feed.label,
      oldValue: null,
      newValue: null,
      status: "skipped",
    };

    try {
      // Get current value
      const existing = await query(
        "SELECT value FROM cooked_metrics WHERE id = $1",
        [feed.id]
      );
      result.oldValue = existing.rows[0]?.value || null;

      console.log(`[CookedFeeds] Fetching ${feed.id}...`);
      const data = await feed.fetch();
      if (!data) {
        result.status = "skipped";
        results.push(result);
        continue;
      }

      // Check if changed
      if (data.value === result.oldValue) {
        result.status = "unchanged";
        result.newValue = data.value;
        results.push(result);
        continue;
      }

      // Upsert into cooked_metrics
      await query(
        `INSERT INTO cooked_metrics (id, bucket, label, value, num, spectrum_min, spectrum_max, invert, feed_id, source_label, updated_at, data_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
         ON CONFLICT (id) DO UPDATE SET
           value = $4, num = $5, updated_at = NOW(), data_date = $11`,
        [
          feed.id,
          feed.bucket,
          feed.label,
          data.value,
          data.num,
          feed.spectrumMin,
          feed.spectrumMax,
          feed.invert,
          feed.id,
          feed.sourceLabel,
          data.dataDate || null,
        ]
      );

      result.newValue = data.value;
      result.status = "updated";
    } catch (err) {
      result.status = "error";
      result.error = err instanceof Error ? err.message : String(err);
    }

    results.push(result);
  }

  return results;
}

// ── Data Access (for Are We Cooked site) ─────────────────────

export interface CookedMetric {
  id: string;
  bucket: string;
  label: string;
  value: string;
  num: number;
  spectrumMin: number;
  spectrumMax: number;
  invert: boolean;
  feedId: string;
  sourceLabel: string;
  updatedAt: string;
  dataDate: string | null;
}

export async function getCookedMetrics(): Promise<CookedMetric[]> {
  try {
    const result = await query(
      "SELECT * FROM cooked_metrics ORDER BY bucket, label"
    );
    return result.rows.map((r) => ({
      id: r.id,
      bucket: r.bucket,
      label: r.label,
      value: r.value,
      num: parseFloat(r.num),
      spectrumMin: parseFloat(r.spectrum_min),
      spectrumMax: parseFloat(r.spectrum_max),
      invert: r.invert,
      feedId: r.feed_id,
      sourceLabel: r.source_label,
      updatedAt: r.updated_at,
      dataDate: r.data_date,
    }));
  } catch {
    console.log("[CookedFeeds] DB unavailable");
    return [];
  }
}

/**
 * Get metrics that live in Crisis Index lenses table but are shared with Are We Cooked.
 * These are read-only — they're updated by the existing FRED/external feed pipeline.
 */
export const SHARED_METRICS = [
  {
    lensId: "debt",
    metricLabel: "Home price / income",
    cookedId: "home-price-income",
    bucket: "affordability" as const,
    label: "Home price / income ratio",
    spectrumMin: 3,
    spectrumMax: 10,
    invert: false,
  },
  {
    lensId: "repression",
    metricLabel: "US gasoline price",
    cookedId: "gas-price",
    bucket: "affordability" as const,
    label: "Gas price",
    spectrumMin: 2,
    spectrumMax: 6,
    invert: false,
  },
  {
    lensId: "ai",
    metricLabel: "Job openings YoY",
    cookedId: "job-openings",
    bucket: "opportunity" as const,
    label: "Job openings trend",
    spectrumMin: -30,
    spectrumMax: 20,
    invert: true, // positive YoY = less cooked
  },
  {
    lensId: "generational",
    metricLabel: "Top 1% wealth share",
    cookedId: "top-1-wealth",
    bucket: "inequality" as const,
    label: "Top 1% wealth share",
    spectrumMin: 20,
    spectrumMax: 40,
    invert: false,
  },
  {
    lensId: "generational",
    metricLabel: "Bottom 50% wealth share",
    cookedId: "bottom-50-wealth",
    bucket: "inequality" as const,
    label: "Bottom 50% wealth share",
    spectrumMin: 0,
    spectrumMax: 10,
    invert: true, // higher share = less cooked
  },
];
