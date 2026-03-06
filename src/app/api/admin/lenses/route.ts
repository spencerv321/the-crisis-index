import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLenses } from "@/lib/data";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const lenses = await getLenses();
    return NextResponse.json(lenses);
  } catch (err) {
    console.error("[Admin/Lenses] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch lenses" },
      { status: 500 }
    );
  }
}
