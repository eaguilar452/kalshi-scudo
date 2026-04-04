import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export const revalidate = 30; // Cache for 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "40";
    const status = searchParams.get("status") || "open";
    const cursor = searchParams.get("cursor") || undefined;
    const eventTicker = searchParams.get("event_ticker") || undefined;

    const params: Record<string, string> = { limit, status };
    if (cursor) params.cursor = cursor;
    if (eventTicker) params.event_ticker = eventTicker;

    const data = await kalshi.getMarkets(params);

    // Transform markets to clean format with correct field names
    const markets = (data.markets || []).map((m: any) => ({
      ticker: m.ticker,
      event_ticker: m.event_ticker,
      title: m.title || "",
      subtitle: m.yes_sub_title || m.subtitle || "",
      category: m.category || "",
      status: m.status,
      // Use the new _dollars fields
      yes_bid: m.yes_bid_dollars ? parseFloat(m.yes_bid_dollars) : 0,
      yes_ask: m.yes_ask_dollars ? parseFloat(m.yes_ask_dollars) : 0,
      no_bid: m.no_bid_dollars ? parseFloat(m.no_bid_dollars) : 0,
      no_ask: m.no_ask_dollars ? parseFloat(m.no_ask_dollars) : 0,
      last_price: m.last_price_dollars ? parseFloat(m.last_price_dollars) : 0,
      prev_price: m.previous_price_dollars ? parseFloat(m.previous_price_dollars) : 0,
      volume: m.volume_fp ? parseFloat(m.volume_fp) : 0,
      volume_24h: m.volume_24h_fp ? parseFloat(m.volume_24h_fp) : 0,
      open_interest: m.open_interest_fp ? parseFloat(m.open_interest_fp) : 0,
      close_time: m.close_time,
      open_time: m.open_time,
    }));

    return NextResponse.json({
      markets,
      cursor: data.cursor || null,
    });
  } catch (error: any) {
    console.error("Kalshi markets error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
