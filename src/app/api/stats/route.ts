import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStats, getDailyTrend, getHourlyTrend, getTopReferrers, getGeoStats, getTopPages } from "@/lib/analytics";
import { getSubscriberStats } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const [stats, daily, hourly, referrers, geo, subscribers, pages] =
      await Promise.all([
        getStats(),
        getDailyTrend(30),
        getHourlyTrend(24),
        getTopReferrers(30),
        getGeoStats(30),
        getSubscriberStats(),
        getTopPages(30),
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
