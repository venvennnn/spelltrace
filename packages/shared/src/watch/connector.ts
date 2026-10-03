import type { WatchConnection } from "../schemas/index";
import { LIVE_PROVIDERS, NATIVE_SCOPES, type PROVIDERS } from "../constants";
import { providerCopy } from "../copy";

export type WatchProvider = (typeof PROVIDERS)[number];

export type WatchConnector = {
  authorize(provider: WatchProvider): Promise<{ status: WatchConnection["status"]; error?: string }>;
  capabilities(provider: WatchProvider): {
    live: boolean;
    scopes: readonly string[];
    reason: string | null;
  };
  backfill(connectionId: string, fromIso: string, toIso: string): Promise<{ imported: number; skipped: number }>;
  syncSince(connectionId: string, cursor: string | null): Promise<{ imported: number; cursor: string }>;
  disconnect(connectionId: string, eraseImported: boolean): Promise<void>;
};

export function providerCard(
  provider: WatchProvider,
  platform: "ios" | "android" | "web",
  connection?: Partial<WatchConnection>,
): WatchConnection {
  const liveOn = LIVE_PROVIDERS[provider];
  const live = liveOn === "all" || liveOn === platform;
  const copy = providerCopy[provider];
  const comingSoon = !live && provider !== "csv";
  return {
    id: connection?.id ?? `conn-${provider}`,
    provider,
    status: comingSoon
      ? "coming_soon"
      : (connection?.status ?? (provider === "csv" ? "not_connected" : "not_connected")),
    scopes: [...NATIVE_SCOPES],
    lastSyncedAt: connection?.lastSyncedAt ?? null,
    firstSyncedAt: connection?.firstSyncedAt ?? null,
    availableMetrics: connection?.availableMetrics ?? [],
    missingMetrics: connection?.missingMetrics ?? ["sleep", "heart_rate", "hrv", "steps", "workouts"],
    errorCode: connection?.errorCode ?? null,
    preferred: connection?.preferred,
    live,
    comingSoonReason: comingSoon ? copy.experience : null,
  };
}

export function isLiveActionAllowed(provider: WatchProvider, platform: "ios" | "android" | "web"): boolean {
  const liveOn = LIVE_PROVIDERS[provider];
  return liveOn === "all" || liveOn === platform;
}
