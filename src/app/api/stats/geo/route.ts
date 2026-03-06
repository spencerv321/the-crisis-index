import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getGeoStats } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const days = parseInt(
      request.nextUrl.searchParams.get("days") || "30",
      10
    );
    const data = await getGeoStats(Math.min(days, 365));
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Stats/Geo] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch geo stats" },
      { status: 500 }
    );
  }
}
