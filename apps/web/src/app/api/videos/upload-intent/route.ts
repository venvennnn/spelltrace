import { NextResponse } from "next/server";
import { uploadIntentSchema } from "@spelltrace/shared";
import { getStore } from "@/lib/store";

export async function POST(req: Request) {
  const parsed = uploadIntentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_upload", message: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const result = getStore().uploadIntent(parsed.data);
  if ("code" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
