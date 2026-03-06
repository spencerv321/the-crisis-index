import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/data";
import { recordEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await addSubscriber(normalizedEmail);

    if (result === "exists") {
      return NextResponse.json({ message: "Already subscribed" });
    }

    // Fire-and-forget event tracking
    recordEvent("subscribe").catch(() => {});

    console.log(`[Subscribe] ${normalizedEmail}`);
    return NextResponse.json({ message: "Subscribed" });
  } catch (err) {
    console.error("[Subscribe] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
