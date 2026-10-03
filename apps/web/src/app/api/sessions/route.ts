import { NextResponse } from "next/server";
import { sessionCreateSchema } from "@spelltrace/shared";
import { getStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ sessions: getStore().listSessions(), demo: true });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = sessionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_session", message: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const session = getStore().createSession(parsed.data);
  return NextResponse.json(session, { status: 201 });
}
