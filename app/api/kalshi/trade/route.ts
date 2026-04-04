import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { ticker, action, side, type, count } = body;
    if (!ticker || !action || !side || !type || !count) {
      return NextResponse.json(
        { error: "Missing required fields: ticker, action, side, type, count" },
        { status: 400 }
      );
    }

    const order = {
      ticker,
      action,
      side,
      type,
      count: Number(count),
      ...(body.yes_price && { yes_price: Number(body.yes_price) }),
      ...(body.no_price && { no_price: Number(body.no_price) }),
    };

    const data = await kalshi.placeOrder(order);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Kalshi trade error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
