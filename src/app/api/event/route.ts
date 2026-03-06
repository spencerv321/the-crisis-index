import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    if (!action) {
      return NextResponse.json({ error: "action required" }, { status: 400 });
    }

    recordEvent(action).catch((err) =>
      console.error("[Event] DB error:", err)
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
