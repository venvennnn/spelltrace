import Link from "next/link";
import { limits } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";

export default function ProfilePage() {
  return (
    <AppShell>
      <h1 className="font-display text-4xl">Profile</h1>
      <p className="mt-2 text-sm text-muted">Asha (demonstration) · right-arm · Australia/Melbourne · adult pilot</p>
      <ul className="mt-6 space-y-3">
        {[
          ["/watch", "Watch connections"],
          ["/shares", "Share links"],
          ["/trends", "History and export"],
          ["/onboarding", "Privacy and filming"],
        ].map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="flex min-h-tap items-center rounded-2xl border border-line bg-paper px-4">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 space-y-2 text-sm text-muted">
        <p>{limits.noDiagnosis}</p>
        <p>{limits.noMaleNorms}</p>
        <p>{limits.shareRevoke}</p>
        <p>No unsolicited injury alerts. Coaches only see what you share.</p>
      </div>
    </AppShell>
  );
}
