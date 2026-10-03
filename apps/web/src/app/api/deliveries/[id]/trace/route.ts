import { NextResponse } from "next/server";
import { KEYPOINT_SCHEMA } from "@spelltrace/shared";
import { getStore } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  for (const s of getStore().listSessions()) {
    const d = s.deliveries.find((x) => x.id === id);
    if (d) {
      return NextResponse.json({
        deliveryId: id,
        keypointSchema: KEYPOINT_SCHEMA,
        algorithmVersion: "pose-0.1",
        videoDeleted: Boolean(s.video?.deleted),
        frames: d.trace,
      });
    }
  }
  return NextResponse.json({ code: "not_found" }, { status: 404 });
}
