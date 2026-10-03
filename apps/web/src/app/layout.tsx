import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Spelltrace — personal bowling review",
  description:
    "Spot a change in your bowling, understand why, decide what to share. Athlete-owned, evidence-backed, never a diagnosis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} bg-surface font-sans text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
