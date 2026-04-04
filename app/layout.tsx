import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greenlight — Prediction Market Trading",
  description: "Set conditions. Greenlight it. Auto-trade on Kalshi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
