import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({ eraseImported: false }));
  getStore().disconnect(id, Boolean(body.eraseImported));
  return NextResponse.json({ ok: true });
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({
    connectionId: (await params).id,
    status: "stub",
    message: "Manual refresh is available on native builds after HealthKit or Health Connect grants.",
  });
}
