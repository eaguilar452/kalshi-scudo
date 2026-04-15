import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greenlight — Automated Sports Prediction Trading",
  description: "Build your bracket. Set your conditions. Greenlight auto-trades sports prediction markets on Kalshi when your conditions are met. 14-day free trial.",
  keywords: ["prediction markets", "kalshi", "sports trading", "auto bet", "sports predictions", "greenlight"],
  openGraph: {
    title: "Greenlight — Automated Sports Prediction Trading",
    description: "Build your bracket. Set conditions. We auto-trade on Kalshi when they hit.",
    type: "website",
    siteName: "Greenlight",
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenlight — Automated Sports Prediction Trading",
    description: "Build your bracket. Set conditions. We auto-trade on Kalshi when they hit.",
  },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
