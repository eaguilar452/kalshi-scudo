import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { ticker, action, side, type, count, yes_price, no_price } = body;

    // Validate required fields
    if (!ticker || !action || !side || !type || !count) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: ticker, action, side, type, count",
        },
        { status: 400 }
      );
    }

    // Validate values
    if (!["buy", "sell"].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "buy" or "sell"' },
        { status: 400 }
      );
    }
    if (!["yes", "no"].includes(side)) {
      return NextResponse.json(
        { error: 'side must be "yes" or "no"' },
        { status: 400 }
      );
    }
    if (!["market", "limit"].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "market" or "limit"' },
        { status: 400 }
      );
    }
    if (Number(count) < 1) {
      return NextResponse.json(
        { error: "count must be at least 1" },
        { status: 400 }
      );
    }

    const order: any = {
      ticker,
      action,
      side,
      type,
      count: Number(count),
    };

    // For limit orders, price is required
    if (type === "limit") {
      if (side === "yes" && yes_price) {
        order.yes_price = Number(yes_price);
      } else if (side === "no" && no_price) {
        order.no_price = Number(no_price);
      } else {
        return NextResponse.json(
          { error: "Limit orders require a price" },
          { status: 400 }
        );
      }
    }

    const data = await kalshi.placeOrder(order);

    return NextResponse.json({
      success: true,
      order: data.order || data,
    });
  } catch (error: any) {
    console.error("Kalshi trade error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
