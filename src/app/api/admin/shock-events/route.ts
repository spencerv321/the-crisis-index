import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getShockEvents, createShockEvent } from "@/lib/data";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const events = await getShockEvents();
    return NextResponse.json(events);
  } catch (err) {
    console.error("[Admin/ShockEvents] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch shock events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { date, lensId, lensName, delta, event, detail } = body;

    if (!date || !lensId || !lensName || !delta || !event || !detail) {
      return NextResponse.json(
        { error: "All fields required: date, lensId, lensName, delta, event, detail" },
        { status: 400 }
      );
    }

    const result = await createShockEvent({
      date,
      lensId,
      lensName,
      delta,
      event,
      detail,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[Admin/ShockEvents] Create error:", err);
    return NextResponse.json(
      { error: "Failed to create shock event" },
      { status: 500 }
    );
  }
}
