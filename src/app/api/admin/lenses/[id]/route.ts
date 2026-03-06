import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLens, updateLens } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const lens = await getLens(id);
    if (!lens) {
      return NextResponse.json({ error: "Lens not found" }, { status: 404 });
    }
    return NextResponse.json(lens);
  } catch (err) {
    console.error(`[Admin/Lens/${id}] Error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch lens" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const updated = await updateLens(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Lens not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(`[Admin/Lens/${id}] Update error:`, err);
    return NextResponse.json(
      { error: "Failed to update lens" },
      { status: 500 }
    );
  }
}
