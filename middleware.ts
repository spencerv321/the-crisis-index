import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip tracking for these paths
  if (
    pathname.startsWith("/dash") ||
    pathname.startsWith("/api/stats") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Skip bots
  const ua = request.headers.get("user-agent") || "";
  if (/bot|crawl|spider|slurp|googlebot|bingbot/i.test(ua)) {
    return NextResponse.next();
  }

  // Build visitor hash from IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const salt = process.env.ANALYTICS_SALT || "default-salt";

  // Parse referrer
  const refParam = request.nextUrl.searchParams.get("ref");
  const refererHeader = request.headers.get("referer") || "";
  const referrerSource = refParam || parseReferrer(refererHeader);

  // Get geo from Vercel headers (available on Vercel deployment)
  const country = request.headers.get("x-vercel-ip-country") || null;
  const region = request.headers.get("x-vercel-ip-country-region") || null;

  // Fire tracking request asynchronously (don't block the response)
  const trackUrl = new URL("/api/track", request.url);
  const trackBody = JSON.stringify({
    path: pathname,
    ip,
    salt,
    referrerSource,
    country,
    region,
  });

  // Use waitUntil-style: fire and forget via fetch to our own track endpoint
  fetch(trackUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: trackBody,
  }).catch(() => {});

  return NextResponse.next();
}

function parseReferrer(referer: string): string | null {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    const host = url.hostname.toLowerCase();

    if (host.includes("thecrisisindex.com")) return null; // Internal
    if (host.includes("google")) return "Google";
    if (host.includes("bing")) return "Bing";
    if (host.includes("duckduckgo")) return "DuckDuckGo";
    if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com"))
      return "Twitter/X";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("substack")) return "Substack";
    if (host.includes("hacker-news") || host.includes("ycombinator"))
      return "Hacker News";

    return host;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
