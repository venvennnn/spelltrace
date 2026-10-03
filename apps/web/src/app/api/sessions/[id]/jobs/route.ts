import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getStore().getSession(id);
  if (!session) return NextResponse.json({ code: "not_found" }, { status: 404 });
  const jobs = Object.values(getStore().snapshot().jobs).filter((j) => session.video && j.videoId === session.video.id);
  return NextResponse.json({ jobs });
}
