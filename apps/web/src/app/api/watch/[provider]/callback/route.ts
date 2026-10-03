import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return NextResponse.json({
    provider,
    status: "provider_unavailable",
    message: "Server OAuth callbacks for Garmin and Google Health are feature-gated until credentials exist.",
  });
}
