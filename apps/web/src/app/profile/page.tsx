import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function ProfilePage() {
  return (
    <AppShell>
      <h1 className="font-display text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-muted">Asha · right-arm · Melbourne</p>
      <ul className="mt-5 space-y-2">
        {[
          ["/watch", "Watch"],
          ["/shares", "Shares"],
          ["/trends", "History"],
        ].map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="flex min-h-tap items-center rounded-2xl border border-line px-4">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
