/**
 * Metric Feeds — maps FRED series to lens metrics
 *
 * Each feed defines:
 * - Which lens and metric it updates (by lensId + metricLabel)
 * - Which FRED series it needs
 * - How to transform the raw FRED value into display format
 * - How to format the value string and numeric value
 *
 * Called by /api/admin/refresh-data to auto-update metrics from FRED.
 */

import {
  getLatestObservation,
  getObservationOneYearAgo,
  type FredObservation,
} from "./fred";
import { getLenses, updateLens } from "./data";
import { query } from "./db";
import type { Metric } from "@/data/lenses";

// ── Feed Definitions ──────────────────────────────────────────

export interface FeedDefinition {
  /** Unique identifier for this feed */
  feedId: string;
  /** Which lens this metric belongs to */
  lensId: string;
  /** Exact label of the metric to update (matches metrics[].label) */
  metricLabel: string;
  /** FRED series IDs needed for this feed */
  fredSeries: string[];
  /** Transform raw FRED data into metric value + num */
  transform: (
    values: Map<string, FredObservation>
  ) => { value: string; num: number } | null;
  /** Optional: update the context string too */
  contextUpdate?: (values: Map<string, FredObservation>) => string | undefined;
}

/**
 * All feed definitions — maps FRED series to lens metrics.
 *
 * FRED Series Reference:
 * - GOLDAMGBD228NLBM: Gold Fixing Price (London, $/oz, daily)
 * - DGS10: 10-Year Treasury Constant Maturity Rate (%, daily)
 * - CPIAUCSL: Consumer Price Index, All Urban (index, monthly)
 * - DFF: Effective Federal Funds Rate (%, daily)
 * - T5YIE: 5-Year Breakeven Inflation Rate (%, daily)
 * - TOTBKCR: Total Bank Credit, All Commercial Banks ($B, weekly)
 * - GFDEBTN: Federal Debt: Total Public Debt ($M, quarterly)
 * - GFDEGDQ188S: Federal Debt to GDP (%, quarterly)
 * - WCSSTUS1: Weekly Crude Oil Stocks in SPR (1000 bbl, weekly)
 * - DCOILWTICO: Crude Oil Prices: WTI ($/bbl, daily)
 */
export const FEED_DEFINITIONS: FeedDefinition[] = [
  // ── Financial Repression ───────────────────────────────────

  {
    feedId: "gold-price",
    lensId: "repression",
    metricLabel: "Gold price",
    fredSeries: ["GOLDAMGBD228NLBM"],
    transform: (values) => {
      const gold = values.get("GOLDAMGBD228NLBM");
      if (!gold) return null;
      const rounded = Math.round(gold.value);
      return {
        value: `$${rounded.toLocaleString("en-US")}`,
        num: rounded,
      };
    },
  },

  {
    feedId: "real-interest-rate",
    lensId: "repression",
    metricLabel: "Real interest rate",
    fredSeries: ["DFF", "CPIAUCSL"],
    transform: (values) => {
      const fedFunds = values.get("DFF");
      const cpiLatest = values.get("CPIAUCSL");
      const cpiYearAgo = values.get("CPIAUCSL_YEAR_AGO");
      if (!fedFunds || !cpiLatest || !cpiYearAgo) return null;

      // CPI YoY% = ((latest - yearAgo) / yearAgo) * 100
      const cpiYoY =
        ((cpiLatest.value - cpiYearAgo.value) / cpiYearAgo.value) * 100;
      const realRate = fedFunds.value - cpiYoY;

      const sign = realRate >= 0 ? "+" : "";
      return {
        value: `${sign}${realRate.toFixed(1)}%`,
        num: parseFloat(realRate.toFixed(1)),
      };
    },
    contextUpdate: (values) => {
      const fedFunds = values.get("DFF");
      const cpiLatest = values.get("CPIAUCSL");
      const cpiYearAgo = values.get("CPIAUCSL_YEAR_AGO");
      if (!fedFunds || !cpiLatest || !cpiYearAgo) return undefined;
      const cpiYoY =
        ((cpiLatest.value - cpiYearAgo.value) / cpiYearAgo.value) * 100;
      const label =
        parseFloat((fedFunds.value - cpiYoY).toFixed(1)) < 0
          ? "savers losing"
          : "positive real rates";
      return `Fed funds ${fedFunds.value.toFixed(2)}% minus CPI ${cpiYoY.toFixed(1)}% — ${label}`;
    },
  },

  {
    feedId: "10y-vs-cpi",
    lensId: "repression",
    metricLabel: "10Y yield vs. CPI",
    fredSeries: ["DGS10", "CPIAUCSL"],
    transform: (values) => {
      const yield10y = values.get("DGS10");
      const cpiLatest = values.get("CPIAUCSL");
      const cpiYearAgo = values.get("CPIAUCSL_YEAR_AGO");
      if (!yield10y || !cpiLatest || !cpiYearAgo) return null;

      const cpiYoY =
        ((cpiLatest.value - cpiYearAgo.value) / cpiYearAgo.value) * 100;
      const spread = yield10y.value - cpiYoY;

      return {
        value: `${yield10y.value.toFixed(2)}% vs ${cpiYoY.toFixed(1)}%`,
        num: parseFloat(spread.toFixed(2)),
      };
    },
    contextUpdate: (values) => {
      const yield10y = values.get("DGS10");
      const cpiLatest = values.get("CPIAUCSL");
      const cpiYearAgo = values.get("CPIAUCSL_YEAR_AGO");
      if (!yield10y || !cpiLatest || !cpiYearAgo) return undefined;
      const cpiYoY =
        ((cpiLatest.value - cpiYearAgo.value) / cpiYearAgo.value) * 100;
      const spread = yield10y.value - cpiYoY;
      const label =
        spread < 0
          ? "negative — deep repression"
          : spread < 1.5
            ? "barely positive — repression active"
            : "compensated";
      return label;
    },
  },

  {
    feedId: "bank-credit-growth",
    lensId: "repression",
    metricLabel: "Bank credit growth",
    fredSeries: ["TOTBKCR"],
    transform: (values) => {
      const latest = values.get("TOTBKCR");
      const yearAgo = values.get("TOTBKCR_YEAR_AGO");
      if (!latest || !yearAgo) return null;

      const yoy = ((latest.value - yearAgo.value) / yearAgo.value) * 100;
      const sign = yoy >= 0 ? "+" : "";
      return {
        value: `${sign}${yoy.toFixed(1)}% YoY`,
        num: parseFloat(yoy.toFixed(1)),
      };
    },
    contextUpdate: (values) => {
      const latest = values.get("TOTBKCR");
      const yearAgo = values.get("TOTBKCR_YEAR_AGO");
      if (!latest || !yearAgo) return undefined;
      const yoy = ((latest.value - yearAgo.value) / yearAgo.value) * 100;
      const direction =
        yoy > 0
          ? "while Fed balance sheet shrinks — Napier's signal"
          : "credit contraction underway";
      return direction;
    },
  },

  {
    feedId: "5y-breakeven",
    lensId: "repression",
    metricLabel: "5Y inflation breakeven",
    fredSeries: ["T5YIE"],
    transform: (values) => {
      const breakeven = values.get("T5YIE");
      if (!breakeven) return null;
      return {
        value: `${breakeven.value.toFixed(2)}%`,
        num: parseFloat(breakeven.value.toFixed(2)),
      };
    },
    contextUpdate: (values) => {
      const breakeven = values.get("T5YIE");
      if (!breakeven) return undefined;
      return `FRED — Napier says wildly mispriced`;
    },
  },

  // ── Debt Supercycle ────────────────────────────────────────

  {
    feedId: "national-debt",
    lensId: "debt",
    metricLabel: "US National Debt",
    fredSeries: ["GFDEBTN"],
    transform: (values) => {
      const debt = values.get("GFDEBTN");
      if (!debt) return null;
      // GFDEBTN is in millions, convert to trillions
      const trillions = debt.value / 1_000_000;
      return {
        value: `$${trillions.toFixed(1)}T`,
        num: parseFloat(trillions.toFixed(1)),
      };
    },
  },

  {
    feedId: "debt-to-gdp",
    lensId: "debt",
    metricLabel: "Debt-to-GDP",
    fredSeries: ["GFDEGDQ188S"],
    transform: (values) => {
      const ratio = values.get("GFDEGDQ188S");
      if (!ratio) return null;
      return {
        value: `${ratio.value.toFixed(1)}%`,
        num: parseFloat(ratio.value.toFixed(1)),
      };
    },
  },

  // ── Geopolitical Fracture ──────────────────────────────────

  {
    feedId: "spr-levels",
    lensId: "geopolitical",
    metricLabel: "US Strategic Petroleum Reserve",
    fredSeries: ["WCSSTUS1"],
    transform: (values) => {
      const spr = values.get("WCSSTUS1");
      if (!spr) return null;
      // WCSSTUS1 is in thousands of barrels, convert to millions
      const millions = Math.round(spr.value / 1000);
      return {
        value: `${millions}M bbl`,
        num: millions,
      };
    },
    contextUpdate: (values) => {
      const spr = values.get("WCSSTUS1");
      if (!spr) return undefined;
      const millions = Math.round(spr.value / 1000);
      if (millions < 400) return `lowest since 1984 — down from 638M in 2020`;
      if (millions < 500) return `well below pre-drawdown levels of 638M`;
      return `${millions}M barrels in reserve`;
    },
  },

  {
    feedId: "wti-oil-price",
    lensId: "geopolitical",
    metricLabel: "Strait of Hormuz oil transit",
    fredSeries: ["DCOILWTICO"],
    transform: () => {
      // Oil transit volume doesn't change from WTI price
      // But we track WTI as context — don't override the transit metric value
      return null;
    },
    // We use this feed just to track oil price in context, not to update the metric value
  },
];

// ── Refresh Engine ────────────────────────────────────────────

export interface RefreshResult {
  feedId: string;
  lensId: string;
  metricLabel: string;
  oldValue: string | null;
  newValue: string | null;
  status: "updated" | "unchanged" | "error" | "skipped";
  error?: string;
  fredDate?: string;
}

/**
 * Refresh all FRED-backed metrics.
 * Fetches latest data, transforms it, and writes back to DB.
 */
export async function refreshAllFeeds(): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];

  // Collect all unique FRED series we need
  const allSeries = new Set<string>();
  const needsYearAgo = new Set<string>();

  for (const feed of FEED_DEFINITIONS) {
    for (const series of feed.fredSeries) {
      allSeries.add(series);
    }
    // Check if any transform references _YEAR_AGO keys
    // (CPI and TOTBKCR need YoY calculations)
    if (
      feed.feedId === "real-interest-rate" ||
      feed.feedId === "10y-vs-cpi"
    ) {
      needsYearAgo.add("CPIAUCSL");
    }
    if (feed.feedId === "bank-credit-growth") {
      needsYearAgo.add("TOTBKCR");
    }
  }

  // Fetch all series (sequential to respect FRED rate limits)
  console.log(
    `[MetricFeeds] Fetching ${allSeries.size} FRED series + ${needsYearAgo.size} YoY comparisons...`
  );
  const values = new Map<string, FredObservation>();

  for (const seriesId of allSeries) {
    try {
      const obs = await getLatestObservation(seriesId);
      if (obs) {
        values.set(seriesId, obs);
        console.log(
          `[MetricFeeds]   ${seriesId}: ${obs.value} (${obs.date})`
        );
      } else {
        console.log(`[MetricFeeds]   ${seriesId}: no data`);
      }
    } catch (err) {
      console.error(`[MetricFeeds]   ${seriesId}: error`, err);
    }
  }

  // Fetch year-ago values for YoY calculations
  for (const seriesId of needsYearAgo) {
    try {
      const obs = await getObservationOneYearAgo(seriesId);
      if (obs) {
        values.set(`${seriesId}_YEAR_AGO`, obs);
        console.log(
          `[MetricFeeds]   ${seriesId} (1yr ago): ${obs.value} (${obs.date})`
        );
      }
    } catch (err) {
      console.error(`[MetricFeeds]   ${seriesId} (1yr ago): error`, err);
    }
  }

  // Get current lenses from DB
  const lenses = await getLenses();
  const lensMap = new Map(lenses.map((l) => [l.id, l]));

  // Process each feed
  for (const feed of FEED_DEFINITIONS) {
    const result: RefreshResult = {
      feedId: feed.feedId,
      lensId: feed.lensId,
      metricLabel: feed.metricLabel,
      oldValue: null,
      newValue: null,
      status: "skipped",
    };

    try {
      const lens = lensMap.get(feed.lensId);
      if (!lens) {
        result.status = "error";
        result.error = `Lens '${feed.lensId}' not found`;
        results.push(result);
        continue;
      }

      // Find the metric in the lens
      const metricIndex = lens.metrics.findIndex(
        (m) => m.label === feed.metricLabel
      );
      if (metricIndex === -1) {
        result.status = "error";
        result.error = `Metric '${feed.metricLabel}' not found in lens '${feed.lensId}'`;
        results.push(result);
        continue;
      }

      const currentMetric = lens.metrics[metricIndex];
      result.oldValue = currentMetric.value;

      // Transform
      const transformed = feed.transform(values);
      if (!transformed) {
        result.status = "skipped";
        results.push(result);
        continue;
      }

      // Check if value actually changed
      if (
        transformed.value === currentMetric.value &&
        transformed.num === currentMetric.num
      ) {
        result.status = "unchanged";
        result.newValue = transformed.value;
        results.push(result);
        continue;
      }

      // Build updated metric
      const updatedMetric: Metric = {
        ...currentMetric,
        value: transformed.value,
        num: transformed.num,
        feedId: feed.feedId, // Mark as FRED-sourced
      };

      // Update context if the feed provides a context update
      if (feed.contextUpdate) {
        const newContext = feed.contextUpdate(values);
        if (newContext) updatedMetric.context = newContext;
      }

      // Write the updated metrics array back to the lens
      const updatedMetrics = [...lens.metrics];
      updatedMetrics[metricIndex] = updatedMetric;

      await updateLens(feed.lensId, { metrics: updatedMetrics });

      result.newValue = transformed.value;
      result.status = "updated";

      // Get the FRED date for the primary series
      const primaryObs = values.get(feed.fredSeries[0]);
      if (primaryObs) result.fredDate = primaryObs.date;
    } catch (err) {
      result.status = "error";
      result.error = err instanceof Error ? err.message : String(err);
    }

    results.push(result);
  }

  // Log the refresh in DB
  try {
    await logRefresh(results);
  } catch (err) {
    console.error("[MetricFeeds] Failed to log refresh:", err);
  }

  return results;
}

/**
 * Log a refresh event to the feed_log table
 */
async function logRefresh(results: RefreshResult[]): Promise<void> {
  const updated = results.filter((r) => r.status === "updated").length;
  const errors = results.filter((r) => r.status === "error").length;

  await query(
    `INSERT INTO feed_log (metrics_updated, metrics_errored, results_json)
     VALUES ($1, $2, $3)`,
    [updated, errors, JSON.stringify(results)]
  );
}

/**
 * Get recent refresh logs
 */
export async function getRefreshLogs(
  limit = 10
): Promise<
  {
    id: number;
    refreshedAt: string;
    metricsUpdated: number;
    metricsErrored: number;
  }[]
> {
  try {
    const result = await query(
      `SELECT id, refreshed_at, metrics_updated, metrics_errored
       FROM feed_log ORDER BY refreshed_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows.map((r) => ({
      id: r.id,
      refreshedAt: r.refreshed_at,
      metricsUpdated: r.metrics_updated,
      metricsErrored: r.metrics_errored,
    }));
  } catch {
    return [];
  }
}

/**
 * Get the most recent refresh timestamp
 */
export async function getLastRefreshTime(): Promise<string | null> {
  try {
    const result = await query(
      "SELECT refreshed_at FROM feed_log ORDER BY refreshed_at DESC LIMIT 1"
    );
    return result.rows[0]?.refreshed_at || null;
  } catch {
    return null;
  }
}
