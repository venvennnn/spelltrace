"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/today", label: "Today" },
  { href: "/review", label: "Review" },
  { href: "/sessions/new", label: "Log" },
  { href: "/sessions", label: "Sessions" },
];

function isActive(path: string, href: string) {
  if (path === href) return true;
  if (href === "/review" && path.includes("/review")) return true;
  if (href === "/sessions" && path.startsWith("/sessions") && path !== "/sessions/new") return true;
  return false;
}

function Tabs({ path, className }: { path: string; className?: string }) {
  return (
    <nav aria-label="Primary" className={className}>
      {items.map((item) => {
        const active = isActive(path, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`min-h-tap py-3.5 text-center text-[12px] ${
              active ? "-mt-px border-t-2 border-brick font-semibold text-ink" : "font-medium text-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const path = usePathname();
  return (
    <div className={`mx-auto min-h-dvh overflow-x-hidden bg-paper pb-[72px] md:pb-0 ${wide ? "max-w-page" : "max-w-phone"}`}>
      <header className="flex items-center justify-between px-6 pt-5">
        <Link href="/today" className="font-display text-[18px] font-semibold">
          Spelltrace
        </Link>
        <span className="text-[12px] text-muted">Demo</span>
      </header>
      <nav aria-label="Desktop" className="hidden grid-cols-4 border-b border-line px-2 md:grid">
        {items.map((item) => {
          const active = isActive(path, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-tap py-3 text-center text-[12px] ${
                active ? "border-b-2 border-brick font-semibold text-ink" : "font-medium text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <main className="px-6 pb-6 pt-4">{children}</main>
      <Tabs
        path={path}
        className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-phone grid-cols-4 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
      />
    </div>
  );
}
