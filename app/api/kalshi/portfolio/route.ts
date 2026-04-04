import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export async function GET() {
  try {
    const [balanceData, positionsData] = await Promise.allSettled([
      kalshi.getBalance(),
      kalshi.getPortfolio(),
    ]);

    const balance =
      balanceData.status === "fulfilled" ? balanceData.value?.balance : null;
    const positions =
      positionsData.status === "fulfilled"
        ? positionsData.value?.market_positions || []
        : [];

    return NextResponse.json({ balance, positions });
  } catch (error: any) {
    console.error("Kalshi portfolio error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
