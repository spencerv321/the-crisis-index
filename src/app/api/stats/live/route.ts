import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLiveStats } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const stats = await getLiveStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[Stats/Live] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch live stats" },
      { status: 500 }
    );
  }
}
