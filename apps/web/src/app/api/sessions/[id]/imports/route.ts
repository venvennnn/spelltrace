import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { kind, text } = await req.json();
  if (kind !== "daily_watch" && kind !== "motion_samples") {
    return NextResponse.json({ code: "unknown_kind", message: "Use daily_watch or motion_samples" }, { status: 400 });
  }
  try {
    return NextResponse.json(getStore().importCsv(id, kind, text));
  } catch {
    return NextResponse.json({ code: "not_found", message: "Session not found" }, { status: 404 });
  }
}
