/**
 * FRED API Client
 * Federal Reserve Economic Data — https://fred.stlouisfed.org/docs/api/
 *
 * Fetches economic time series used to auto-update lens metrics.
 * Requires FRED_API_KEY env var.
 */

const FRED_BASE = "https://api.stlouisfed.org/fred";

function getApiKey(): string {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY environment variable is not set");
  return key;
}

export interface FredObservation {
  date: string;
  value: number;
}

/**
 * Get the most recent observation for a FRED series.
 * Returns null if no valid data found.
 */
export async function getLatestObservation(
  seriesId: string
): Promise<FredObservation | null> {
  const apiKey = getApiKey();
  const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=5`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    console.error(
      `[FRED] Failed to fetch ${seriesId}: ${res.status} ${res.statusText}`
    );
    return null;
  }

  const data = await res.json();
  if (!data.observations?.length) return null;

  // FRED uses "." for missing values — skip those
  for (const obs of data.observations) {
    if (obs.value !== ".") {
      return {
        date: obs.date,
        value: parseFloat(obs.value),
      };
    }
  }

  return null;
}

/**
 * Get an observation from approximately one year ago (for YoY calculations).
 * Looks for data near the target date with a small window.
 */
export async function getObservationOneYearAgo(
  seriesId: string
): Promise<FredObservation | null> {
  const apiKey = getApiKey();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Fetch observations around 1 year ago (a small window)
  const startDate = new Date(oneYearAgo);
  startDate.setMonth(startDate.getMonth() - 2);
  const endDate = new Date(oneYearAgo);
  endDate.setMonth(endDate.getMonth() + 1);

  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${start}&observation_end=${end}&sort_order=desc&limit=5`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.observations?.length) return null;

  for (const obs of data.observations) {
    if (obs.value !== ".") {
      return {
        date: obs.date,
        value: parseFloat(obs.value),
      };
    }
  }

  return null;
}

/**
 * Batch fetch latest observations for multiple series.
 * Returns a Map of seriesId → value. Sequential to respect rate limits.
 */
export async function batchFetchLatest(
  seriesIds: string[]
): Promise<Map<string, FredObservation>> {
  const results = new Map<string, FredObservation>();

  for (const id of seriesIds) {
    try {
      const obs = await getLatestObservation(id);
      if (obs) results.set(id, obs);
    } catch (err) {
      console.error(`[FRED] Error fetching ${id}:`, err);
    }
  }

  return results;
}

/**
 * Get series metadata (title, units, frequency, etc.)
 */
export async function getSeriesInfo(
  seriesId: string
): Promise<{ title: string; units: string; frequency: string } | null> {
  const apiKey = getApiKey();
  const url = `${FRED_BASE}/series?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return null;

  const data = await res.json();
  const series = data.seriess?.[0];
  if (!series) return null;

  return {
    title: series.title,
    units: series.units,
    frequency: series.frequency,
  };
}
