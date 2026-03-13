import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  refreshAllFeeds,
  getRefreshLogs,
  getLastRefreshTime,
} from "@/lib/metric-feeds";
import { refreshExternalFeeds } from "@/lib/external-feeds";

/**
 * POST /api/admin/refresh-data
 * Triggers a data refresh for all configured feeds (FRED + external APIs).
 * Returns a summary of what was updated.
 */
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    console.log("[RefreshData] Starting FRED data refresh...");
    const fredResults = await refreshAllFeeds();

    console.log("[RefreshData] Starting external API refresh...");
    const externalResults = await refreshExternalFeeds();

    const results = [...fredResults, ...externalResults];
    const updated = results.filter((r) => r.status === "updated");
    const errors = results.filter((r) => r.status === "error");
    const unchanged = results.filter((r) => r.status === "unchanged");
    const skipped = results.filter((r) => r.status === "skipped");

    console.log(
      `[RefreshData] Done: ${updated.length} updated, ${unchanged.length} unchanged, ${skipped.length} skipped, ${errors.length} errors`
    );

    return NextResponse.json({
      success: true,
      summary: {
        updated: updated.length,
        unchanged: unchanged.length,
        skipped: skipped.length,
        errors: errors.length,
      },
      results,
      refreshedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[RefreshData] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to refresh data",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/refresh-data
 * Returns refresh history and status.
 */
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const [logs, lastRefresh] = await Promise.all([
      getRefreshLogs(10),
      getLastRefreshTime(),
    ]);

    return NextResponse.json({
      lastRefresh,
      logs,
      hasFredKey: !!process.env.FRED_API_KEY,
    });
  } catch (err) {
    console.error("[RefreshData] Error fetching logs:", err);
    return NextResponse.json(
      { error: "Failed to fetch refresh logs" },
      { status: 500 }
    );
  }
}
