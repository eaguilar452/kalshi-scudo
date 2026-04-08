import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, action, side, type, count } = body;

    if (!ticker || !action || !side || !type || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["buy", "sell"].includes(action)) return NextResponse.json({ error: 'action must be "buy" or "sell"' }, { status: 400 });
    if (!["yes", "no"].includes(side)) return NextResponse.json({ error: 'side must be "yes" or "no"' }, { status: 400 });
    if (!["market", "limit"].includes(type)) return NextResponse.json({ error: 'type must be "market" or "limit"' }, { status: 400 });

    const order: any = { ticker, action, side, type, count: Number(count) };

    // Kalshi requires exactly one price field on every order
    if (type === "limit") {
      if (side === "yes" && body.yes_price) order.yes_price_dollars = String(Number(body.yes_price).toFixed(2));
      else if (side === "no" && body.no_price) order.no_price_dollars = String(Number(body.no_price).toFixed(2));
      else return NextResponse.json({ error: "Limit orders require a price" }, { status: 400 });
    } else {
      // Market orders: use the ask price passed from frontend
      if (side === "yes" && body.yes_price) order.yes_price_dollars = String(Number(body.yes_price).toFixed(2));
      else if (side === "no" && body.no_price) order.no_price_dollars = String(Number(body.no_price).toFixed(2));
      else {
        // Fallback: buy at $0.99 (worst case, acts like market order)
        if (side === "yes") order.yes_price_dollars = "0.99";
        else order.no_price_dollars = "0.99";
      }
    }

    const data = await kalshi.placeOrder(order);
    return NextResponse.json({ success: true, order: data.order || data });
  } catch (error: any) {
    console.error("Trade error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
