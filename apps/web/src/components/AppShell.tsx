"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, product } from "@spelltrace/shared";
import { DemoBanner } from "./DemoBanner";

const items = [
  { href: "/today", label: nav.today },
  { href: "/sessions", label: nav.sessions },
  { href: "/sessions/new", label: nav.add },
  { href: "/review", label: nav.review },
  { href: "/profile", label: nav.profile },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-page bg-surface pb-24 md:pb-8">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/today" className="font-display text-xl text-ink">
            {product.name}
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {items.map((item) => {
              const active = path === item.href || (item.href !== "/today" && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-h-tap rounded-full px-3 py-2 text-sm ${active ? "bg-teal text-white" : "text-muted hover:bg-teal-soft"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-2">
          <DemoBanner compact />
        </div>
      </header>
      <main className="px-4 py-5">{children}</main>
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {items.map((item) => {
            const active = path === item.href || (item.href !== "/today" && path.startsWith(item.href) && item.href !== "/sessions/new");
            const add = item.href === "/sessions/new";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-tap flex-col items-center justify-center text-xs ${
                    add ? "font-semibold text-teal" : active ? "font-semibold text-teal" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
