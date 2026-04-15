"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface MarketDetail {
  ticker: string; event_ticker: string; title: string; event_title: string;
  category: string; yes_bid: number; yes_ask: number; no_bid: number; no_ask: number;
  last_price: number; prev_price: number; volume: number; volume_24h: number;
  open_interest: number; close_time: string;
}

interface OrderbookLevel { price: number; quantity: number; }

export default function MarketDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [orderbook, setOrderbook] = useState<{ yes: OrderbookLevel[]; no: OrderbookLevel[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [count, setCount] = useState(1);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [lp, setLp] = useState(50);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeResult, setTradeResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    // Fetch market from our markets endpoint filtered by ticker
    Promise.all([
      fetch(`/api/kalshi/markets?limit=1000&fetch_all=true`).then(r => r.json()),
      fetch(`/api/kalshi/orderbook?ticker=${ticker}`).then(r => r.json()).catch(() => null),
    ]).then(([mkts, ob]) => {
      const found = (mkts.markets || []).find((m: any) => m.ticker === ticker);
      if (found) {
        setMarket(found);
        setLp(Math.round(found.yes_ask * 100) || 50);
      }
      if (ob && ob.orderbook) {
        setOrderbook({
          yes: (ob.orderbook.yes || []).map((l: any) => ({ price: parseFloat(l[0] || l.price || "0"), quantity: parseFloat(l[1] || l.quantity || "0") })),
          no: (ob.orderbook.no || []).map((l: any) => ({ price: parseFloat(l[0] || l.price || "0"), quantity: parseFloat(l[1] || l.quantity || "0") })),
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [ticker]);

  const doTrade = async (action: "buy" | "sell") => {
    if (!market) return;
    setTradeLoading(true); setTradeResult(null);
    try {
      const b: any = { ticker: market.ticker, action, side, type: orderType, count };
      const askPrice = orderType === "limit" ? lp / 100 : (side === "yes" ? market.yes_ask : market.no_ask);
      if (side === "yes") b.yes_price = askPrice || 0.99; else b.no_price = askPrice || 0.99;
      const r = await fetch("/api/kalshi/trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
      const d = await r.json();
      if (r.ok && d.success) setTradeResult({ ok: true, msg: `${action === "buy" ? "Bought" : "Sold"} ${count} ${side.toUpperCase()}` });
      else setTradeResult({ ok: false, msg: d.error || "Failed" });
    } catch (e: any) { setTradeResult({ ok: false, msg: e.message }); }
    setTradeLoading(false);
  };

  const fmt = (d: number) => !d ? "—" : `${Math.round(d * 100)}¢`;
  const pct = (d: number) => !d ? 0 : Math.round(d * 100);
  const vol = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${Math.round(v)}`;
  const chg = (c: number, p: number) => !p || !c ? 0 : Math.round((c - p) * 100);

  const ttc = (t: string) => {
    if (!t) return "";
    const d = new Date(t).getTime() - Date.now();
    if (d < 0) return "Ended";
    const days = Math.floor(d / 864e5); const hrs = Math.floor((d % 864e5) / 36e5); const mins = Math.floor((d % 36e5) / 6e4);
    if (days > 0) return `${days}d ${hrs}h`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const costEst = () => {
    if (!market) return "0.00";
    const p = orderType === "limit" ? lp : (side === "yes" ? Math.round(market.yes_ask * 100) : Math.round(market.no_ask * 100));
    return ((p * count) / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="light-green mx-auto mb-3 anim-glow" style={{ width: 16, height: 16 }} />
        <p className="text-sm text-slate-muted">Loading market...</p>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Market Not Found</h2>
        <p className="text-sm text-slate-muted mb-6">Ticker: {ticker}</p>
        <a href="/dashboard/markets" className="btn-ghost text-xs">← Back to Markets</a>
      </div>
    );
  }

  const p = pct(market.last_price);
  const c = chg(market.last_price, market.prev_price);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <a href="/dashboard/markets" className="text-xs text-slate-muted hover:text-green-glow transition-colors inline-flex items-center gap-1">← Markets</a>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-muted">{market.category}</span>
          {c !== 0 && <span className={`text-[11px] font-mono font-bold ${c > 0 ? "text-green-glow" : "text-red-glow"}`}>{c > 0 ? "▲" : "▼"}{Math.abs(c)}¢</span>}
        </div>
        {market.event_title && market.event_title !== market.title && (
          <p className="text-sm text-slate-muted mb-1">{market.event_title}</p>
        )}
        <h1 className="font-display text-2xl font-bold text-white leading-snug">{market.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Market info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Probability */}
          <div className="gl-card-static p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Probability</span>
              <span className="font-mono text-2xl font-bold" style={{ color: "#00FF88" }}>{p > 0 ? `${p}%` : "—"}</span>
            </div>
            {p > 0 && (
              <div className="prob-bar" style={{ height: 8, borderRadius: 4 }}>
                <div className="prob-fill" style={{ width: `${p}%`, borderRadius: 4 }} />
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="gl-card-static p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Yes Bid/Ask</p>
              <p className="font-mono text-sm font-bold text-white">{fmt(market.yes_bid)} / {fmt(market.yes_ask)}</p>
            </div>
            <div className="gl-card-static p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">No Bid/Ask</p>
              <p className="font-mono text-sm font-bold text-white">{fmt(market.no_bid)} / {fmt(market.no_ask)}</p>
            </div>
            <div className="gl-card-static p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Volume</p>
              <p className="font-mono text-sm font-bold text-white">{vol(market.volume)}</p>
            </div>
            <div className="gl-card-static p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Closes in</p>
              <p className="font-mono text-sm font-bold text-white">{ttc(market.close_time)}</p>
            </div>
          </div>

          {/* Orderbook */}
          {orderbook && (orderbook.yes.length > 0 || orderbook.no.length > 0) && (
            <div className="gl-card-static p-5">
              <h3 className="font-display text-base font-bold text-white mb-3">Order Book</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-2">Yes Bids</p>
                  <div className="space-y-1">
                    {orderbook.yes.slice(0, 8).map((l, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="font-mono" style={{ color: "#00FF88" }}>{Math.round(l.price * 100)}¢</span>
                        <span className="font-mono text-slate-muted">{Math.round(l.quantity)}</span>
                      </div>
                    ))}
                    {orderbook.yes.length === 0 && <p className="text-xs text-slate-muted">No bids</p>}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-2">No Bids</p>
                  <div className="space-y-1">
                    {orderbook.no.slice(0, 8).map((l, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="font-mono text-red-glow">{Math.round(l.price * 100)}¢</span>
                        <span className="font-mono text-slate-muted">{Math.round(l.quantity)}</span>
                      </div>
                    ))}
                    {orderbook.no.length === 0 && <p className="text-xs text-slate-muted">No bids</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Market info */}
          <div className="gl-card-static p-5">
            <h3 className="font-display text-base font-bold text-white mb-3">Market Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-muted">Ticker</span><span className="font-mono text-white">{market.ticker}</span></div>
              <div className="flex justify-between"><span className="text-slate-muted">Event</span><span className="font-mono text-white text-right max-w-[250px] truncate">{market.event_ticker}</span></div>
              <div className="flex justify-between"><span className="text-slate-muted">Open Interest</span><span className="font-mono text-white">{vol(market.open_interest)}</span></div>
              <div className="flex justify-between"><span className="text-slate-muted">24h Volume</span><span className="font-mono text-white">{vol(market.volume_24h || 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-muted">Last Price</span><span className="font-mono text-white">{fmt(market.last_price)}</span></div>
              <div className="flex justify-between"><span className="text-slate-muted">Previous Price</span><span className="font-mono text-white">{fmt(market.prev_price)}</span></div>
            </div>
          </div>
        </div>

        {/* Right: Trade panel */}
        <div className="space-y-4">
          <div className="gl-card-static p-5 sticky top-20">
            <h3 className="font-display text-base font-bold text-white mb-4">Trade</h3>

            {/* Side */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setSide("yes")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${side === "yes" ? "bg-green-glow text-black" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>Yes {fmt(market.yes_ask)}</button>
              <button onClick={() => setSide("no")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${side === "no" ? "bg-red-glow text-white" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>No {fmt(market.no_ask)}</button>
            </div>

            {/* Order type */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setOrderType("market")} className={`flex-1 py-2 rounded-lg text-xs font-medium ${orderType === "market" ? "bg-bg-card border border-green-muted text-green-glow" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>Market</button>
              <button onClick={() => setOrderType("limit")} className={`flex-1 py-2 rounded-lg text-xs font-medium ${orderType === "limit" ? "bg-bg-card border border-green-muted text-green-glow" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>Limit</button>
            </div>

            {/* Count */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Contracts</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setCount(Math.max(1, count - 1))} className="w-9 h-9 rounded-lg bg-bg-secondary border border-slate-border text-white font-bold text-sm">−</button>
                <input type="number" value={count} onChange={e => setCount(Math.max(1, Number(e.target.value)))} className="w-16 text-center font-mono font-bold" min={1} />
                <button onClick={() => setCount(count + 1)} className="w-9 h-9 rounded-lg bg-bg-secondary border border-slate-border text-white font-bold text-sm">+</button>
                <div className="flex gap-1 ml-auto">{[5, 10, 25].map(n => <button key={n} onClick={() => setCount(n)} className="px-1.5 py-1 rounded text-[9px] font-mono bg-bg-secondary border border-slate-border text-slate-muted hover:text-white">{n}</button>)}</div>
              </div>
            </div>

            {orderType === "limit" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Price (¢)</label>
                <input type="number" value={lp} onChange={e => setLp(Number(e.target.value))} min={1} max={99} className="w-24 font-mono" />
              </div>
            )}

            {/* Summary */}
            <div className="bg-bg-secondary rounded-xl p-3.5 mb-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-slate-muted">Cost</span><span className="font-mono font-bold text-white">${costEst()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-muted">Payout</span><span className="font-mono font-bold" style={{ color: "#00FF88" }}>${count.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-muted">Profit</span><span className="font-mono font-bold" style={{ color: "#00FF88" }}>${(count - Number(costEst())).toFixed(2)}</span></div>
            </div>

            {tradeResult && (
              <div className={`mb-3 px-3 py-2.5 rounded-lg text-xs ${tradeResult.ok ? "bg-green-subtle border border-green-muted text-green-glow" : "bg-red-subtle border border-red-muted text-red-glow"}`}>{tradeResult.msg}</div>
            )}

            {/* Buy / Sell buttons */}
            <div className="flex gap-2">
              <button onClick={() => doTrade("buy")} disabled={tradeLoading} className={`flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50 ${side === "yes" ? "btn-green" : "btn-red"}`}>
                {tradeLoading ? "..." : `Buy ${side.toUpperCase()}`}
              </button>
              <button onClick={() => doTrade("sell")} disabled={tradeLoading} className="flex-1 py-3 rounded-xl text-sm font-bold btn-ghost disabled:opacity-50">
                Sell
              </button>
            </div>
            <p className="text-[9px] text-slate-muted text-center mt-2">Real money on Kalshi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
