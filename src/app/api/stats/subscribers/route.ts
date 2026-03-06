import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSubscriberStats } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const data = await getSubscriberStats();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[Stats/Subscribers] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch subscriber stats" },
      { status: 500 }
    );
  }
}
