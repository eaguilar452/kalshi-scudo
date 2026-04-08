import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export const dynamic = "force-dynamic";

const SPORTS_CATEGORIES = new Set([
  "Sports", "NFL", "NBA", "MLB", "NHL", "MLS", "Soccer", "Tennis",
  "Golf", "UFC", "MMA", "Boxing", "F1", "NASCAR", "College Football",
  "College Basketball", "WNBA", "Cricket", "Rugby",
  // Kalshi sometimes uses lowercase
  "sports", "nfl", "nba", "mlb", "nhl", "mls", "soccer", "tennis",
  "golf", "ufc", "mma", "boxing", "f1",
]);

function isSportsCategory(cat: string): boolean {
  if (!cat) return false;
  if (SPORTS_CATEGORIES.has(cat)) return true;
  const lower = cat.toLowerCase();
  return lower.includes("sport") || lower.includes("nba") || lower.includes("nfl") ||
    lower.includes("mlb") || lower.includes("nhl") || lower.includes("soccer") ||
    lower.includes("tennis") || lower.includes("golf") || lower.includes("ufc") ||
    lower.includes("mma") || lower.includes("boxing") || lower.includes("mls") ||
    lower.includes("f1") || lower.includes("nascar") || lower.includes("college") ||
    lower.includes("wnba") || lower.includes("cricket");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("fetch_all") === "true";
    const sportsOnly = searchParams.get("sports_only") !== "false";
    const limit = searchParams.get("limit") || "100";

    type M = { ticker: string; event_ticker: string; event_title: string; title: string; category: string; yes_bid: number; yes_ask: number; no_bid: number; no_ask: number; last_price: number; prev_price: number; volume: number; volume_24h: number; open_interest: number; close_time: string };
    const all: M[] = [];
    let cursor: string | undefined;
    let pages = 0;

    do {
      const params: Record<string, string> = { limit: fetchAll ? "200" : limit, with_nested_markets: "true", status: "open" };
      if (cursor) params.cursor = cursor;
      const data = await kalshi.getEvents(params);

      for (const ev of data.events || []) {
        if (sportsOnly && !isSportsCategory(ev.category || "")) continue;

        for (const m of ev.markets || []) {
          if (m.status !== "open" && m.status !== "active") continue;
          let title = m.yes_sub_title || m.title || ev.title || "";
          if (title.includes(",yes ") || title.includes(",no ")) title = ev.title || m.ticker;

          all.push({
            ticker: m.ticker || "",
            event_ticker: m.event_ticker || ev.event_ticker || "",
            event_title: ev.title || "",
            title,
            category: ev.category || "",
            yes_bid: m.yes_bid_dollars ? parseFloat(m.yes_bid_dollars) : 0,
            yes_ask: m.yes_ask_dollars ? parseFloat(m.yes_ask_dollars) : 0,
            no_bid: m.no_bid_dollars ? parseFloat(m.no_bid_dollars) : 0,
            no_ask: m.no_ask_dollars ? parseFloat(m.no_ask_dollars) : 0,
            last_price: m.last_price_dollars ? parseFloat(m.last_price_dollars) : 0,
            prev_price: m.previous_price_dollars ? parseFloat(m.previous_price_dollars) : 0,
            volume: m.volume_fp ? parseFloat(m.volume_fp) : 0,
            volume_24h: m.volume_24h_fp ? parseFloat(m.volume_24h_fp) : 0,
            open_interest: m.open_interest_fp ? parseFloat(m.open_interest_fp) : 0,
            close_time: m.close_time || "",
          });
        }
      }
      cursor = data.cursor || null;
      pages++;
    } while (fetchAll && cursor && pages < 10);

    all.sort((a, b) => b.volume - a.volume);
    return NextResponse.json({ markets: all, total: all.length });
  } catch (error: any) {
    console.error("Markets error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
