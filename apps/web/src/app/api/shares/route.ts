import { NextResponse } from "next/server";
import { shareCreateSchema } from "@spelltrace/shared";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const parsed = shareCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_share", message: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const share = getStore().createShare(parsed.data);
  return NextResponse.json(share, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ shares: getStore().snapshot().shares });
}
