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
    if (type === "limit") {
      if (side === "yes" && body.yes_price) order.yes_price = Number(body.yes_price);
      else if (side === "no" && body.no_price) order.no_price = Number(body.no_price);
      else return NextResponse.json({ error: "Limit orders require a price" }, { status: 400 });
    }

    const data = await kalshi.placeOrder(order);
    return NextResponse.json({ success: true, order: data.order || data });
  } catch (error: any) {
    console.error("Trade error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
