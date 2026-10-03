import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(_: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const result = getStore().authorize(provider);
  if (result && typeof result === "object" && "code" in result) {
    return NextResponse.json(result, { status: 403 });
  }
  return NextResponse.json(result);
}

export async function GET(_: Request, { params }: { params: Promise<{ provider: string }> }) {
  return NextResponse.json({
    provider: (await params).provider,
    message: "OAuth callback stub. Garmin and Google Health remain feature-gated.",
  });
}
