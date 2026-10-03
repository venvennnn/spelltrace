"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function SessionActions({
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
    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
      <button disabled={!videoId || videoDeleted} onClick={() => del(true)} className="min-h-tap rounded-full border px-4 text-sm">
        Keep movement only
      </button>
      <button disabled={!videoId && !videoDeleted} onClick={() => del(false)} className="min-h-tap rounded-full border border-red-800 px-4 text-sm text-red-800">
        Delete both
      </button>
    </div>
  );
}
