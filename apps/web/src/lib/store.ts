import { createStore } from "@spelltrace/shared/store";

const globalForStore = globalThis as unknown as { spelltrace?: ReturnType<typeof createStore> };

export function getStore() {
  if (!globalForStore.spelltrace) {
    globalForStore.spelltrace = createStore("demo");
  }
  return globalForStore.spelltrace;
}
