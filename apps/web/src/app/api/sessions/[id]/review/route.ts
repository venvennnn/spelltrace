import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    return NextResponse.json(getStore().review(id));
  } catch {
    return NextResponse.json({ code: "not_found", message: "Session not found" }, { status: 404 });
  }
}
