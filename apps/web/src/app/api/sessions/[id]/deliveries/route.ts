import { NextResponse } from "next/server";
import { deliveryBookmarkSchema } from "@spelltrace/shared";
import { getStore } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = deliveryBookmarkSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_bookmark", message: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const session = getStore().getSession(id);
  if (!session) return NextResponse.json({ code: "not_found" }, { status: 404 });
  const delivery = {
    id: `${id}-manual-${parsed.data.startMs}`,
    sessionId: id,
    videoId: session.video?.id ?? null,
    startMs: parsed.data.startMs,
    endMs: parsed.data.endMs,
    frontFootContactMs: parsed.data.frontFootContactMs ?? parsed.data.startMs,
    backFootContactMs: parsed.data.backFootContactMs ?? parsed.data.startMs,
    releaseMs: parsed.data.releaseMs ?? parsed.data.endMs,
    quality: "adequate" as const,
    excluded: false,
    values: {},
    trace: [],
  };
  session.deliveries.push(delivery);
  getStore().patchSession(id, { deliveries: session.deliveries });
  return NextResponse.json(delivery, { status: 201 });
}
