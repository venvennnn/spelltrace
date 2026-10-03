import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Source_Serif_4({ subsets: ["latin"], variable: "--font-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Spelltrace",
  description: "See what changed in your bowling vs your usual.",
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
