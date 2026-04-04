import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export async function GET() {
  try {
    const [bal, pos] = await Promise.allSettled([kalshi.getBalance(), kalshi.getPortfolio()]);
    return NextResponse.json({
      balance: bal.status === "fulfilled" ? bal.value?.balance : null,
      positions: pos.status === "fulfilled" ? pos.value?.market_positions || [] : [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
