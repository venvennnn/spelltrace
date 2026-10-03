import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = getStore().publicShare(token);
  if (result && typeof result === "object" && "code" in result) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
