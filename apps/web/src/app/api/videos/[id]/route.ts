import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const keep = new URL(req.url).searchParams.get("keep_movement") === "true";
  try {
    getStore().deleteVideo(id, keep);
    return NextResponse.json({ ok: true, keepMovement: keep });
  } catch (e) {
    const code = (e as { code?: string }).code ?? "not_found";
    return NextResponse.json({ code, message: (e as Error).message }, { status: 400 });
  }
}
