import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(getStore().explain(id, body.modelOutput));
  } catch {
    return NextResponse.json({ code: "not_found", message: "Session not found" }, { status: 404 });
  }
}
