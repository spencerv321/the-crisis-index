import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteShockEvent } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Props) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const deleted = await deleteShockEvent(parseInt(id, 10));
    if (!deleted) {
      return NextResponse.json(
        { error: "Shock event not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(`[Admin/ShockEvent/${id}] Delete error:`, err);
    return NextResponse.json(
      { error: "Failed to delete shock event" },
      { status: 500 }
    );
  }
}
