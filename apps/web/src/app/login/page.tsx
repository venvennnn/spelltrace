import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-12">
      <h1 className="font-display text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted">A Google sign-in is only an account. It does not connect Apple Health, Health Connect, or Garmin.</p>
      <form className="mt-6 space-y-3" action="/today">
        <label className="block text-sm">
          Email
          <input type="email" required className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" required className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <button className="min-h-tap w-full rounded-full bg-teal font-semibold text-white">Sign in</button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/signup" className="text-teal underline">
          Create an account
        </Link>{" "}
        ·{" "}
        <Link href="/today" className="text-teal underline">
          Demonstration
        </Link>
      </p>
    </div>
  );
}
