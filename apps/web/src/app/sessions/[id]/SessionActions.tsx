"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function SessionActions({
  sessionId,
  videoId,
  videoDeleted,
}: {
  sessionId: string;
  videoId?: string;
  videoDeleted: boolean;
}) {
  const router = useRouter();
  async function del(keep: boolean) {
    if (!videoId) return;
    await api(`/api/videos/${videoId}?keep_movement=${keep}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <div className="mt-8 space-y-2 rounded-2xl border border-line bg-paper p-4">
      <h2 className="font-display text-2xl">Retention</h2>
      <p className="text-sm text-muted">
        After extraction you may delete the source video and keep timestamped landmarks. Pixels cannot be reconstructed.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button disabled={!videoId || videoDeleted} onClick={() => del(true)} className="min-h-tap rounded-full border border-ink px-4 text-sm">
          Keep movement only
        </button>
        <button disabled={!videoId && !videoDeleted} onClick={() => del(false)} className="min-h-tap rounded-full border border-red-800 px-4 text-sm text-red-800">
          Delete video and movement
        </button>
      </div>
      <p className="text-xs text-muted">Session {sessionId}</p>
    </div>
  );
}
