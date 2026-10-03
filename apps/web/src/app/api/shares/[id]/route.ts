import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  getStore().revokeShare(id);
  return NextResponse.json({ ok: true });
}
