import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getHourlyTrend } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const hours = parseInt(
      request.nextUrl.searchParams.get("hours") || "24",
      10
    );
    const data = await getHourlyTrend(Math.min(hours, 168)); // Max 7 days
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Stats/Hourly] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch hourly trend" },
      { status: 500 }
    );
  }
}
