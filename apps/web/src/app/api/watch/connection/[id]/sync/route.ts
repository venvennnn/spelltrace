import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({
    connectionId: (await params).id,
    imported: 0,
    skipped: 0,
    message: "Incremental sync runs on native app open. Web uses CSV import.",
  });
}
