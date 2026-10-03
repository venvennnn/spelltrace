import { NextResponse } from "next/server";
import { nativeIngestSchema } from "@spelltrace/shared";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const parsed = nativeIngestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_ingest", message: parsed.error.issues[0]?.message }, { status: 400 });
  }
  return NextResponse.json(getStore().nativeIngest(parsed.data.records));
}
