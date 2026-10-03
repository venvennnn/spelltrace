import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getStore().getSession(id);
  if (!session) return NextResponse.json({ code: "not_found", message: "Session not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    return NextResponse.json(getStore().patchSession(id, body));
  } catch {
    return NextResponse.json({ code: "not_found", message: "Session not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  getStore().deleteSession(id);
  return NextResponse.json({ ok: true });
}
