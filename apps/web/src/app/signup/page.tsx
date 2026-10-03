import Link from "next/link";
import { limits } from "@spelltrace/shared";

export default function SignupPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-12">
      <h1 className="font-display text-4xl">Create a private account</h1>
      <p className="mt-2 text-sm text-muted">{limits.adultOnly} Signing in with Google does not grant health-data access.</p>
      <form className="mt-6 space-y-3" action="/today">
        <label className="block text-sm">
          Email
          <input required type="email" name="email" className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <label className="block text-sm">
          Password
          <input required type="password" name="password" className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <label className="flex items-start gap-2 text-sm text-muted">
          <input required type="checkbox" className="mt-1" />
          I am 18 or older and I understand Spelltrace does not diagnose injury.
        </label>
        <button className="min-h-tap w-full rounded-full bg-teal font-semibold text-white" type="submit">
          Continue
        </button>
      </form>
      <p className="mt-4 text-sm">
        Prefer to look around first?{" "}
        <Link href="/today" className="text-teal underline">
          Open the demonstration
        </Link>
      </p>
    </div>
  );
}
