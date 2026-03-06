import { NextRequest, NextResponse } from "next/server";

export function requireAuth(request: NextRequest): NextResponse | null {
  const token = process.env.ANALYTICS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Server not configured for authentication" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization required" },
      { status: 401 }
    );
  }

  const provided = authHeader.slice(7);
  if (provided !== token) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  return null; // Auth passed
}
