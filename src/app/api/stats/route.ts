import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getStats,
  getDailyTrend,
  getHourlyTrend,
  getTopReferrers,
  getGeoStats,
  getTopPages,
  getSubscriberStats,
} from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    // Sequential first to avoid pool exhaustion on serverless cold start
    const stats = await getStats();
    const subscribers = await getSubscriberStats();

    // These can run in parallel (pool is warmed up now)
    const [daily, hourly, referrers, geo, pages] = await Promise.all([
      getDailyTrend(30).catch(() => []),
      getHourlyTrend(24).catch(() => []),
      getTopReferrers(30).catch(() => []),
      getGeoStats(30).catch(() => []),
      getTopPages(30).catch(() => []),
    ]);

    return NextResponse.json({
      ...stats,
      daily,
      hourly,
      referrers,
      geo,
      subscribers,
      pages,
    });
  } catch (err) {
    console.error("[Stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
