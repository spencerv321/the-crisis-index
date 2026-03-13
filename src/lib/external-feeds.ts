/**
 * External API Feeds — non-FRED data sources
 *
 * Same pattern as metric-feeds.ts but fetches from:
 * - World Bank API (BRICS GDP, defense spending)
 * - IMF SDMX API (dollar reserve share)
 * - Treasury Fiscal Data API (debt to penny, interest expense)
 * - BLS API (JOLTS job openings)
 * - Yahoo Finance (cloud index)
 * - EIA API (oil exports)
 *
 * Called by /api/admin/refresh-data alongside FRED feeds.
 */

import { getLenses, updateLens } from "./data";
import { query } from "./db";
import type { Metric } from "@/data/lenses";
import type { RefreshResult } from "./metric-feeds";

// ── Fetch Helpers ──────────────────────────────────────────────

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

// ── World Bank API ─────────────────────────────────────────────

interface WBEntry {
  country: { id: string };
  date: string;
  value: number | null;
}

async function fetchWorldBankIndicator(
  countries: string,
  indicator: string,
  year?: string
): Promise<WBEntry[]> {
  const dateParam = year ? `&date=${year}` : "&mrnev=1";
  const url = `https://api.worldbank.org/v2/country/${countries}/indicator/${indicator}?format=json&per_page=300${dateParam}`;
  const data = (await fetchJSON(url)) as [unknown, WBEntry[]];
  if (!data || !data[1]) return [];
  return data[1].filter((e) => e.value !== null);
}

async function fetchBRICSGDPShare(): Promise<{
  share: number;
  year: string;
} | null> {
  // BRICS+ members (original 5 + 2024 expansion)
  const bricsCountries = "BRA;RUS;IND;CHN;ZAF;EGY;ETH;IRN;ARE";
  const worldCountry = "WLD";
  const indicator = "NY.GDP.MKTP.PP.CD"; // GDP PPP current international $

  try {
    const [bricsData, worldData] = await Promise.all([
      fetchWorldBankIndicator(bricsCountries, indicator),
      fetchWorldBankIndicator(worldCountry, indicator),
    ]);

    if (!bricsData.length || !worldData.length) return null;

    // Get latest year that has data for both
    const worldByYear = new Map(worldData.map((e) => [e.date, e.value!]));
    const bricsByYear = new Map<string, number>();
    for (const entry of bricsData) {
      const year = entry.date;
      bricsByYear.set(year, (bricsByYear.get(year) || 0) + entry.value!);
    }

    // Find most recent year with both
    const years = [...bricsByYear.keys()].sort().reverse();
    for (const year of years) {
      const worldGDP = worldByYear.get(year);
      const bricsGDP = bricsByYear.get(year);
      if (worldGDP && bricsGDP) {
        return { share: (bricsGDP / worldGDP) * 100, year };
      }
    }
    return null;
  } catch (err) {
    console.error("[ExternalFeeds] BRICS GDP error:", err);
    return null;
  }
}

async function fetchGlobalDefenseSpending(): Promise<{
  totalTrillions: number;
  year: string;
} | null> {
  const indicator = "MS.MIL.XPND.CD"; // Military expenditure current USD
  try {
    const data = await fetchWorldBankIndicator("WLD", indicator);
    if (!data.length) return null;
    const latest = data[0];
    return {
      totalTrillions: latest.value! / 1e12,
      year: latest.date,
    };
  } catch (err) {
    console.error("[ExternalFeeds] Defense spending error:", err);
    return null;
  }
}

// ── IMF SDMX API ──────────────────────────────────────────────

async function fetchDollarReserveShare(): Promise<{
  share: number;
  period: string;
} | null> {
  try {
    // IMF COFER via JSON REST API
    const url =
      "https://data.imf.org/api/sddataservice/dataflow/COFER/latest?startPeriod=2023&format=json";
    const res = await fetch(url, { next: { revalidate: 0 } });

    if (!res.ok) {
      // Fallback: try the legacy endpoint
      const legacyUrl =
        "http://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/COFER/Q..USD_SHARE";
      const legacyRes = await fetch(legacyUrl, { next: { revalidate: 0 } });
      if (!legacyRes.ok) return null;

      const data = (await legacyRes.json()) as Record<string, unknown>;
      // Parse legacy format — structure varies, try to extract latest USD share
      const series =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any)?.CompactData?.DataSet?.Series;
      if (!series) return null;

      const obs = Array.isArray(series.Obs) ? series.Obs : [series.Obs];
      const latest = obs[obs.length - 1];
      if (!latest) return null;

      return {
        share: parseFloat(latest["@OBS_VALUE"]),
        period: latest["@TIME_PERIOD"],
      };
    }

    // Modern format parsing would go here
    // For now, if the modern endpoint works, parse accordingly
    return null;
  } catch (err) {
    console.error("[ExternalFeeds] IMF COFER error:", err);
    return null;
  }
}

// ── Treasury Fiscal Data API ──────────────────────────────────

async function fetchDebtToPenny(): Promise<{
  totalTrillions: number;
  date: string;
} | null> {
  try {
    const url =
      "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page[size]=1&fields=record_date,tot_pub_debt_out_amt";
    const data = (await fetchJSON(url)) as {
      data: { record_date: string; tot_pub_debt_out_amt: string }[];
    };
    if (!data.data?.length) return null;
    const latest = data.data[0];
    return {
      totalTrillions: parseFloat(latest.tot_pub_debt_out_amt) / 1e12,
      date: latest.record_date,
    };
  } catch (err) {
    console.error("[ExternalFeeds] Debt to Penny error:", err);
    return null;
  }
}

async function fetchInterestExpense(): Promise<{
  totalBillions: number;
  fiscalYear: string;
} | null> {
  try {
    const url =
      "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=1";
    // Interest expense endpoint is different — try the MTS (Monthly Treasury Statement)
    const mtsUrl =
      "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?filter=line_code_nbr:eq:5694&sort=-record_date&page[size]=1&fields=record_date,current_fytd_net_outly_amt";
    const data = (await fetchJSON(mtsUrl)) as {
      data: {
        record_date: string;
        current_fytd_net_outly_amt: string;
      }[];
    };
    if (!data.data?.length) return null;
    const latest = data.data[0];
    return {
      totalBillions:
        Math.abs(parseFloat(latest.current_fytd_net_outly_amt)) / 1e6,
      fiscalYear: latest.record_date,
    };
  } catch (err) {
    console.error("[ExternalFeeds] Interest expense error:", err);
    return null;
  }
}

// ── Yahoo Finance (via query endpoint) ────────────────────────

async function fetchCloudIndexDecline(): Promise<{
  declinePercent: number;
  currentPrice: number;
} | null> {
  try {
    // Use the WCLD ETF (WisdomTree Cloud Computing) as proxy
    // Yahoo Finance v8 chart API
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/WCLD?range=5y&interval=1mo";
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      chart: {
        result: {
          indicators: {
            adjclose: { adjclose: number[] }[];
          };
        }[];
      };
    };

    const prices =
      data.chart?.result?.[0]?.indicators?.adjclose?.[0]?.adjclose;
    if (!prices?.length) return null;

    const peak = Math.max(...prices.filter((p) => p != null));
    const current = prices[prices.length - 1];
    if (!peak || !current) return null;

    const decline = ((current - peak) / peak) * 100;
    return { declinePercent: decline, currentPrice: current };
  } catch (err) {
    console.error("[ExternalFeeds] Cloud index error:", err);
    return null;
  }
}

// ── BLS API ───────────────────────────────────────────────────

async function fetchJOLTSOpenings(): Promise<{
  yoyPercent: number;
  latestThousands: number;
} | null> {
  try {
    const apiKey = process.env.BLS_API_KEY;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const currentYear = new Date().getFullYear();
    const body = JSON.stringify({
      seriesid: ["JTS000000000000000JOL"],
      startyear: String(currentYear - 2),
      endyear: String(currentYear),
      ...(apiKey ? { registrationkey: apiKey } : {}),
    });

    const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers,
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
    if (!series?.length || series.length < 13) return null;

    // BLS data is sorted newest first
    const latest = parseFloat(series[0].value);
    // Find same month one year ago
    const latestMonth = series[0].period;
    const yearAgo = series.find(
      (d) =>
        d.period === latestMonth &&
        parseInt(d.year) === parseInt(series[0].year) - 1
    );

    if (!yearAgo) return null;
    const yearAgoVal = parseFloat(yearAgo.value);
    const yoy = ((latest - yearAgoVal) / yearAgoVal) * 100;

    return { yoyPercent: yoy, latestThousands: latest };
  } catch (err) {
    console.error("[ExternalFeeds] BLS JOLTS error:", err);
    return null;
  }
}

// ── EIA API ───────────────────────────────────────────────────

async function fetchPersianGulfExports(): Promise<{
  millionBblDay: number;
  period: string;
} | null> {
  try {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) {
      console.log("[ExternalFeeds] EIA_API_KEY not set, skipping");
      return null;
    }

    // Fetch crude oil exports for Persian Gulf countries
    // Saudi Arabia, Iraq, Kuwait, UAE, Iran, Qatar, Bahrain
    const url = `https://api.eia.gov/v2/international/data/?api_key=${apiKey}&frequency=monthly&data[0]=value&facets[activityId][]=2&facets[productId][]=57&facets[countryRegionId][]=SAU&facets[countryRegionId][]=IRQ&facets[countryRegionId][]=KWT&facets[countryRegionId][]=ARE&facets[countryRegionId][]=IRN&facets[countryRegionId][]=QAT&facets[unitId][]=TBPD&sort[0][column]=period&sort[0][direction]=desc&length=7`;

    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      response: {
        data: { period: string; value: number; countryRegionId: string }[];
      };
    };

    const entries = data.response?.data;
    if (!entries?.length) return null;

    // Sum exports for the latest period
    const latestPeriod = entries[0].period;
    const latestEntries = entries.filter((e) => e.period === latestPeriod);
    const totalTbpd = latestEntries.reduce((sum, e) => sum + (e.value || 0), 0);

    return {
      millionBblDay: totalTbpd / 1000, // TBPD to million bbl/day
      period: latestPeriod,
    };
  } catch (err) {
    console.error("[ExternalFeeds] EIA exports error:", err);
    return null;
  }
}

// ── EIA: WTI Crude Oil Spot Price (daily) ─────────────────────

async function fetchWTIPrice(): Promise<{
  price: number;
  date: string;
} | null> {
  try {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) return null;

    const url = `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${apiKey}&frequency=daily&data[0]=value&facets[product][]=EPCWTI&sort[0][column]=period&sort[0][direction]=desc&length=1`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      response: { data: { period: string; value: number }[] };
    };

    const entry = data.response?.data?.[0];
    if (!entry?.value) return null;

    return { price: entry.value, date: entry.period };
  } catch (err) {
    console.error("[ExternalFeeds] WTI price error:", err);
    return null;
  }
}

// ── EIA: US Retail Gasoline Price (weekly) ────────────────────

async function fetchGasolinePrice(): Promise<{
  price: number;
  date: string;
} | null> {
  try {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) return null;

    const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPM0&facets[duoarea][]=NUS&sort[0][column]=period&sort[0][direction]=desc&length=1`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      response: { data: { period: string; value: number }[] };
    };

    const entry = data.response?.data?.[0];
    if (!entry?.value) return null;

    return { price: entry.value, date: entry.period };
  } catch (err) {
    console.error("[ExternalFeeds] Gasoline price error:", err);
    return null;
  }
}

// ── EIA: SPR Weekly Stocks ────────────────────────────────────

async function fetchSPRWeekly(): Promise<{
  millionBbl: number;
  date: string;
} | null> {
  try {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) return null;

    const url = `https://api.eia.gov/v2/petroleum/stoc/wstk/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[product][]=EPC0&facets[process][]=SAE&sort[0][column]=period&sort[0][direction]=desc&length=1`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      response: { data: { period: string; value: number }[] };
    };

    const entry = data.response?.data?.[0];
    if (!entry?.value) return null;

    return { millionBbl: entry.value / 1000, date: entry.period };
  } catch (err) {
    console.error("[ExternalFeeds] SPR weekly error:", err);
    return null;
  }
}

// ── EIA: US Crude Oil Production (monthly) ────────────────────

async function fetchUSCrudeProduction(): Promise<{
  millionBblDay: number;
  period: string;
} | null> {
  try {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) return null;

    // Monthly field production (thousand bbl/day)
    const url = `https://api.eia.gov/v2/petroleum/crd/crpdn/data/?api_key=${apiKey}&frequency=monthly&data[0]=value&facets[duoarea][]=NUS&facets[product][]=EPC0&sort[0][column]=period&sort[0][direction]=desc&length=2`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      response: { data: { period: string; value: number }[] };
    };

    const entries = data.response?.data;
    if (!entries?.length) return null;

    // There are two rows per month (different product breakdowns)
    // Find the one that looks like a per-day figure (< 20,000 K bbl/day)
    const perDay = entries.find((e) => e.value < 20000 && e.value > 5000);
    if (!perDay) return null;

    return {
      millionBblDay: perDay.value / 1000,
      period: perDay.period,
    };
  } catch (err) {
    console.error("[ExternalFeeds] US production error:", err);
    return null;
  }
}

// ── External Feed Definitions ─────────────────────────────────

interface ExternalFeedDef {
  feedId: string;
  lensId: string;
  metricLabel: string;
  fetch: () => Promise<{ value: string; num: number; context?: string } | null>;
}

const EXTERNAL_FEEDS: ExternalFeedDef[] = [
  // ── Geopolitical ──
  {
    feedId: "brics-gdp-share",
    lensId: "geopolitical",
    metricLabel: "BRICS GDP share (PPP)",
    fetch: async () => {
      const data = await fetchBRICSGDPShare();
      if (!data) return null;
      return {
        value: `${data.share.toFixed(1)}%`,
        num: parseFloat(data.share.toFixed(1)),
        context: `vs. G7 — World Bank ${data.year} data`,
      };
    },
  },
  {
    feedId: "defense-spending",
    lensId: "geopolitical",
    metricLabel: "Global defense spending",
    fetch: async () => {
      const data = await fetchGlobalDefenseSpending();
      if (!data) return null;
      return {
        value: `$${data.totalTrillions.toFixed(2)}T`,
        num: parseFloat(data.totalTrillions.toFixed(2)),
        context: `SIPRI via World Bank — ${data.year} data`,
      };
    },
  },
  {
    feedId: "oil-chokepoint",
    lensId: "geopolitical",
    metricLabel: "Strait of Hormuz oil transit",
    fetch: async () => {
      const data = await fetchPersianGulfExports();
      if (!data) return null;
      return {
        value: `${data.millionBblDay.toFixed(1)}M bbl/day`,
        num: parseFloat(data.millionBblDay.toFixed(1)),
        context: `Persian Gulf exports (EIA proxy) — ~20% of global oil`,
      };
    },
  },
  {
    feedId: "wti-crude",
    lensId: "geopolitical",
    metricLabel: "WTI crude oil price",
    fetch: async () => {
      const data = await fetchWTIPrice();
      if (!data) return null;
      return {
        value: `$${data.price.toFixed(2)}/bbl`,
        num: parseFloat(data.price.toFixed(2)),
        context: `EIA daily spot — ${data.date}`,
      };
    },
  },
  {
    feedId: "spr-weekly",
    lensId: "geopolitical",
    metricLabel: "US Strategic Petroleum Reserve",
    fetch: async () => {
      const data = await fetchSPRWeekly();
      if (!data) return null;
      return {
        value: `${data.millionBbl.toFixed(0)}M bbl`,
        num: parseFloat(data.millionBbl.toFixed(0)),
        context: `EIA weekly stocks — ${data.date}`,
      };
    },
  },
  {
    feedId: "us-crude-production",
    lensId: "geopolitical",
    metricLabel: "US crude oil production",
    fetch: async () => {
      const data = await fetchUSCrudeProduction();
      if (!data) return null;
      return {
        value: `${data.millionBblDay.toFixed(1)}M bbl/day`,
        num: parseFloat(data.millionBblDay.toFixed(1)),
        context: `EIA monthly — ${data.period}`,
      };
    },
  },

  // ── Debt ──
  {
    feedId: "dollar-reserve-share",
    lensId: "debt",
    metricLabel: "Dollar reserve share",
    fetch: async () => {
      const data = await fetchDollarReserveShare();
      if (!data) return null;
      return {
        value: `${data.share.toFixed(1)}%`,
        num: parseFloat(data.share.toFixed(1)),
        context: `IMF COFER ${data.period} — was 72% in 2000`,
      };
    },
  },
  {
    feedId: "debt-to-penny",
    lensId: "debt",
    metricLabel: "US National Debt",
    fetch: async () => {
      const data = await fetchDebtToPenny();
      if (!data) return null;
      return {
        value: `$${data.totalTrillions.toFixed(1)}T`,
        num: parseFloat(data.totalTrillions.toFixed(1)),
        context: `Treasury Fiscal Data — daily (${data.date})`,
      };
    },
  },

  // ── Financial Repression ──
  {
    feedId: "gasoline-price",
    lensId: "repression",
    metricLabel: "US gasoline price",
    fetch: async () => {
      const data = await fetchGasolinePrice();
      if (!data) return null;
      return {
        value: `$${data.price.toFixed(2)}/gal`,
        num: parseFloat(data.price.toFixed(2)),
        context: `EIA weekly retail avg — ${data.date}`,
      };
    },
  },

  // ── AI Disruption ──
  {
    feedId: "cloud-index",
    lensId: "ai",
    metricLabel: "Cloud index vs. peak",
    fetch: async () => {
      const data = await fetchCloudIndexDecline();
      if (!data) return null;
      const sign = data.declinePercent >= 0 ? "+" : "";
      return {
        value: `${sign}${data.declinePercent.toFixed(0)}% from peak`,
        num: parseFloat(data.declinePercent.toFixed(1)),
        context: "WCLD ETF — cloud/SaaS sector performance",
      };
    },
  },
  {
    feedId: "job-openings",
    lensId: "ai",
    metricLabel: "Job openings YoY",
    fetch: async () => {
      const data = await fetchJOLTSOpenings();
      if (!data) return null;
      const sign = data.yoyPercent >= 0 ? "+" : "";
      return {
        value: `${sign}${data.yoyPercent.toFixed(0)}% YoY`,
        num: parseFloat(data.yoyPercent.toFixed(1)),
        context: `BLS JOLTS — ${(data.latestThousands / 1000).toFixed(1)}M total openings`,
      };
    },
  },
];

// ── Refresh Engine ────────────────────────────────────────────

export async function refreshExternalFeeds(): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];
  const lenses = await getLenses();
  const lensMap = new Map(lenses.map((l) => [l.id, l]));

  for (const feed of EXTERNAL_FEEDS) {
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

      console.log(`[ExternalFeeds] Fetching ${feed.feedId}...`);
      const data = await feed.fetch();
      if (!data) {
        result.status = "skipped";
        results.push(result);
        continue;
      }

      // Check if value actually changed
      if (data.value === currentMetric.value && data.num === currentMetric.num) {
        result.status = "unchanged";
        result.newValue = data.value;
        results.push(result);
        continue;
      }

      // Build updated metric
      const updatedMetric: Metric = {
        ...currentMetric,
        value: data.value,
        num: data.num,
        feedId: feed.feedId,
      };

      if (updatedMetric.spectrum) {
        updatedMetric.spectrum = { ...updatedMetric.spectrum, val: data.num };
      }

      if (data.context) {
        updatedMetric.context = data.context;
      }

      // Write back
      const updatedMetrics = [...lens.metrics];
      updatedMetrics[metricIndex] = updatedMetric;
      await updateLens(feed.lensId, { metrics: updatedMetrics });

      // Update lens in our local map so subsequent feeds see fresh data
      lensMap.set(feed.lensId, { ...lens, metrics: updatedMetrics });

      result.newValue = data.value;
      result.status = "updated";
    } catch (err) {
      result.status = "error";
      result.error = err instanceof Error ? err.message : String(err);
    }

    results.push(result);
  }

  // Log external refresh
  try {
    const updated = results.filter((r) => r.status === "updated").length;
    const errors = results.filter((r) => r.status === "error").length;
    await query(
      `INSERT INTO feed_log (metrics_updated, metrics_errored, results_json)
       VALUES ($1, $2, $3)`,
      [updated, errors, JSON.stringify(results)]
    );
  } catch (err) {
    console.error("[ExternalFeeds] Failed to log refresh:", err);
  }

  return results;
}
