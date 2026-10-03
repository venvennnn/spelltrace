import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const snap = getStore().snapshot();
  const share = snap.shares.find((s) => s.id === id);
  if (!share) return NextResponse.json({ code: "not_found" }, { status: 404 });
  share.items.push({ ...body, sortOrder: share.items.length });
  return NextResponse.json(share);
}
