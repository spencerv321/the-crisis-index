import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { path, ip, salt, referrerSource, country, region } =
      await request.json();

    // Hash the IP for privacy
    const visitorHash = ip && ip !== "unknown"
      ? createHash("sha256")
          .update(ip + (salt || ""))
          .digest("hex")
          .slice(0, 16)
      : null;

    // Fire and forget — don't let DB errors block anything
    recordPageView(path, visitorHash, referrerSource, country, region).catch(
      (err) => console.error("[Track] DB error:", err)
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always return 200
  }
}
