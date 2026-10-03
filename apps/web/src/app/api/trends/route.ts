import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const grain = (url.searchParams.get("grain") ?? "day") as "ball" | "day" | "month";
  return NextResponse.json({
    grain,
    rows: getStore().trends(grain, {
      view: url.searchParams.get("view") ?? undefined,
      drill: url.searchParams.get("drill") ?? undefined,
      effort: url.searchParams.get("effort") ?? undefined,
    }),
    timezone: "Australia/Melbourne",
    demo: true,
  });
}
