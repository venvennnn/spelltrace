import { NATIVE_SCOPES, type WatchConnector, type WatchProvider, isLiveActionAllowed } from "@spelltrace/shared";

/** Development-build modules only — not Expo Go. */
export const nativeWatch: WatchConnector = {
  async authorize(provider: WatchProvider) {
    if (!isLiveActionAllowed(provider, platform())) {
      return {
        status: provider === "csv" ? "connected" : "coming_soon",
        error: "This provider is not live on this platform.",
      };
    }
    return { status: "authorizing" };
  },
  capabilities(provider) {
    return {
      live: isLiveActionAllowed(provider, platform()),
      scopes: NATIVE_SCOPES,
      reason: isLiveActionAllowed(provider, platform())
        ? null
        : "HealthKit (iOS) and Health Connect (Android) require a native development build.",
    };
  },
  async backfill() {
    return { imported: 0, skipped: 0 };
  },
  async syncSince() {
    return { imported: 0, cursor: new Date().toISOString() };
  },
  async disconnect() {
    return;
  },
};

function platform(): "ios" | "android" | "web" {
  const { Platform } = require("react-native") as { Platform: { OS: string } };
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}
