import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "200";
    const status = searchParams.get("status") || "open";
    const cursor = searchParams.get("cursor") || undefined;
    const eventTicker = searchParams.get("event_ticker") || undefined;
    const seriesTicker = searchParams.get("series_ticker") || undefined;
    const fetchAll = searchParams.get("fetch_all") === "true";

    let allMarkets: any[] = [];
    let currentCursor = cursor;
    let pages = 0;
    const maxPages = fetchAll ? 20 : 1; // Safety cap

    do {
      const params: Record<string, string> = {
        limit: fetchAll ? "1000" : limit,
        status,
      };
      if (currentCursor) params.cursor = currentCursor;
      if (eventTicker) params.event_ticker = eventTicker;
      if (seriesTicker) params.series_ticker = seriesTicker;

      const data = await kalshi.getMarkets(params);
      const markets = data.markets || [];

      const transformed = markets.map((m: any) => ({
        ticker: m.ticker || "",
        event_ticker: m.event_ticker || "",
        title: m.title || m.yes_sub_title || m.ticker || "",
        subtitle: m.yes_sub_title || "",
        no_subtitle: m.no_sub_title || "",
        category: m.category || "",
        status: m.status || "",
        market_type: m.market_type || "binary",
        // Prices in dollars (0.00 to 1.00)
        yes_bid: m.yes_bid_dollars ? parseFloat(m.yes_bid_dollars) : 0,
        yes_ask: m.yes_ask_dollars ? parseFloat(m.yes_ask_dollars) : 0,
        no_bid: m.no_bid_dollars ? parseFloat(m.no_bid_dollars) : 0,
        no_ask: m.no_ask_dollars ? parseFloat(m.no_ask_dollars) : 0,
        last_price: m.last_price_dollars ? parseFloat(m.last_price_dollars) : 0,
        prev_price: m.previous_price_dollars
          ? parseFloat(m.previous_price_dollars)
          : 0,
        volume: m.volume_fp ? parseFloat(m.volume_fp) : 0,
        volume_24h: m.volume_24h_fp ? parseFloat(m.volume_24h_fp) : 0,
        open_interest: m.open_interest_fp ? parseFloat(m.open_interest_fp) : 0,
        close_time: m.close_time || "",
        open_time: m.open_time || "",
        can_close_early: m.can_close_early || false,
      }));

      allMarkets = allMarkets.concat(transformed);
      currentCursor = data.cursor || null;
      pages++;
    } while (fetchAll && currentCursor && pages < maxPages);

    // Sort by volume descending so most active markets show first
    allMarkets.sort((a, b) => b.volume - a.volume);

    return NextResponse.json({
      markets: allMarkets,
      cursor: currentCursor,
      total: allMarkets.length,
    });
  } catch (error: any) {
    console.error("Kalshi markets error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
