import { NextResponse } from "next/server";
import { kalshi } from "@/lib/kalshi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });
    const data = await kalshi.getOrderbook(ticker);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
