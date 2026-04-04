"use client";
import { useState, useEffect } from "react";

interface Market {
  ticker: string; event_ticker: string; event_title: string; title: string;
  category: string; yes_bid: number; yes_ask: number; no_bid: number; no_ask: number;
  last_price: number; prev_price: number; volume: number; volume_24h: number;
  open_interest: number; close_time: string;
}

export default function DashboardPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  // Trade modal
  const [tm, setTm] = useState<{ market: Market; side: "yes" | "no"; count: number; type: "market" | "limit"; lp: number; loading: boolean; result: { ok: boolean; msg: string } | null } | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError(null);
    const [mr, br] = await Promise.allSettled([
      fetch("/api/kalshi/markets?fetch_all=true"), fetch("/api/kalshi/portfolio"),
    ]);
    if (mr.status === "fulfilled" && mr.value.ok) {
      const d = await mr.value.json(); setMarkets(d.markets || []); setTotal(d.total || 0);
    } else if (mr.status === "fulfilled") {
      const d = await mr.value.json(); setError(d.error || "Failed");
    }
    if (br.status === "fulfilled" && br.value.ok) {
      const d = await br.value.json(); setBalance(d.balance);
    }
    setLoading(false);
  };

  const doTrade = async () => {
    if (!tm) return;
    setTm({ ...tm, loading: true, result: null });
    try {
      const b: any = { ticker: tm.market.ticker, action: "buy", side: tm.side, type: tm.type, count: tm.count };
      if (tm.type === "limit") {
        if (tm.side === "yes") b.yes_price = tm.lp / 100; else b.no_price = tm.lp / 100;
      }
      const r = await fetch("/api/kalshi/trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
      const d = await r.json();
      if (r.ok && d.success) {
        setTm({ ...tm, loading: false, result: { ok: true, msg: `Placed: ${tm.count} ${tm.side.toUpperCase()} on ${tm.market.ticker}` } });
        fetch("/api/kalshi/portfolio").then(r => r.json()).then(d => setBalance(d.balance)).catch(() => {});
      } else {
        setTm({ ...tm, loading: false, result: { ok: false, msg: d.error || "Failed" } });
      }
    } catch (e: any) { setTm({ ...tm, loading: false, result: { ok: false, msg: e.message } }); }
  };

  const fmt = (d: number) => !d ? "—" : `${Math.round(d * 100)}¢`;
  const pct = (d: number) => !d ? 0 : Math.round(d * 100);
  const chg = (c: number, p: number) => !p || !c ? 0 : Math.round((c - p) * 100);
  const vol = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${Math.round(v)}`;
  const ttc = (t: string) => {
    if (!t) return ""; const d = new Date(t).getTime() - Date.now();
    if (d < 0) return "Ended"; const days = Math.floor(d / 864e5); const hrs = Math.floor((d % 864e5) / 36e5);
    return days > 0 ? `${days}d` : hrs > 0 ? `${hrs}h` : `${Math.floor((d % 36e5) / 6e4)}m`;
  };

  const cats = ["all", ...Array.from(new Set(markets.map(m => m.category).filter(Boolean))).sort()];
  const filtered = markets.filter(m => {
    if (filter !== "all" && m.category !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.event_title.toLowerCase().includes(q) || m.ticker.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
  });

  const cost = () => {
    if (!tm) return "0.00";
    const p = tm.type === "limit" ? tm.lp : (tm.side === "yes" ? Math.round(tm.market.yes_ask * 100) : Math.round(tm.market.no_ask * 100));
    return ((p * tm.count) / 100).toFixed(2);
  };
  const pay = () => tm ? (tm.count).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            Live Markets
            {!loading && !error && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-subtle border border-green-muted text-xs font-medium" style={{ color: "#00FF88" }}><span className="light-green anim-pulse" style={{ width: 6, height: 6 }} />{total}</span>}
          </h1>
          <p className="mt-1 text-sm text-slate-muted">Sorted by volume</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-slate-muted">Balance</p>
            <p className="font-mono text-sm font-bold text-white">{balance !== null ? `$${(balance / 100).toFixed(2)}` : "—"}</p>
          </div>
          <button onClick={load} className="btn-ghost text-xs">↻</button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search markets..." className="text-sm" />
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${filter === c ? "bg-green-glow text-black" : "bg-bg-card border border-slate-border text-slate-muted hover:text-white"}`}>
              {c === "all" ? `All (${markets.length})` : c}
            </button>
          ))}
        </div>
      </div>

      {search && <p className="text-xs text-slate-muted">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>}

      {/* Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.slice(0, 300).map((m, i) => {
            const p = pct(m.last_price); const c = chg(m.last_price, m.prev_price);
            return (
              <div key={m.ticker} className="gl-card p-4 flex flex-col anim-slide" style={{ animationDelay: `${Math.min(i * 0.02, 0.2)}s`, opacity: 0 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-slate-muted truncate mr-2">{m.category}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c !== 0 && <span className={`text-[10px] font-mono font-bold ${c > 0 ? "text-green-glow" : "text-red-glow"}`}>{c > 0 ? "▲" : "▼"}{Math.abs(c)}¢</span>}
                    <span className="text-[10px] text-slate-muted font-mono">{ttc(m.close_time)}</span>
                  </div>
                </div>
                {m.event_title && m.event_title !== m.title && <p className="text-[10px] text-slate-muted mb-0.5 truncate">{m.event_title}</p>}
                <h3 className="font-display text-[15px] font-semibold text-white mb-3 leading-snug flex-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.title}</h3>
                {p > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold" style={{ color: "#00FF88" }}>{p}%</span>
                      <span className="text-[11px] font-mono font-bold text-red-glow">{100 - p}%</span>
                    </div>
                    <div className="prob-bar"><div className="prob-fill" style={{ width: `${p}%` }} /></div>
                  </div>
                )}
                <div className="flex items-end justify-between pt-2 border-t border-slate-border">
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-muted">Bid / Ask</p><p className="font-mono text-xs text-white">{fmt(m.yes_bid)} <span className="text-slate-muted">/</span> {fmt(m.yes_ask)}</p></div>
                  <div className="text-right"><p className="text-[9px] uppercase tracking-wider text-slate-muted">Vol</p><p className="font-mono text-xs text-slate-text">{vol(m.volume)}</p></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setTm({ market: m, side: "yes", count: 1, type: "market", lp: Math.round(m.yes_ask * 100) || 50, loading: false, result: null })} className="flex-1 btn-green py-2 text-xs">Yes {fmt(m.yes_ask)}</button>
                  <button onClick={() => setTm({ market: m, side: "no", count: 1, type: "market", lp: Math.round(m.no_ask * 100) || 50, loading: false, result: null })} className="flex-1 btn-red py-2 text-xs">No {fmt(m.no_ask)}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 300 && <p className="text-center text-sm text-slate-muted py-4">Showing 300 of {filtered.length}. Search to narrow.</p>}
      {loading && <div className="text-center py-12"><div className="light-green mx-auto mb-3 anim-glow" style={{ width: 16, height: 16 }} /><p className="text-sm text-slate-muted">Loading markets...</p></div>}
      {!loading && error && <div className="gl-card p-10 text-center"><div className="light-red mx-auto mb-4" style={{ width: 16, height: 16 }} /><h3 className="font-display text-lg font-bold text-white mb-2">Error</h3><p className="text-sm text-slate-muted mb-4">{error}</p><button onClick={load} className="btn-ghost text-xs">Retry</button></div>}

      {/* TRADE MODAL */}
      {tm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={e => { if (e.target === e.currentTarget) setTm(null); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-bg-secondary border border-slate-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 anim-slide shadow-2xl" style={{ opacity: 0 }}>
            <button onClick={() => setTm(null)} className="absolute top-4 right-4 text-slate-muted hover:text-white text-lg">✕</button>
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">{tm.market.category}</p>
              {tm.market.event_title && tm.market.event_title !== tm.market.title && <p className="text-xs text-slate-muted mb-1">{tm.market.event_title}</p>}
              <h3 className="font-display text-lg font-bold text-white leading-snug">{tm.market.title}</h3>
            </div>
            {/* Side */}
            <div className="flex gap-2 mb-5">
              <button onClick={() => setTm({ ...tm, side: "yes" })} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${tm.side === "yes" ? "bg-green-glow text-black" : "bg-bg-card border border-slate-border text-slate-muted"}`}>YES {fmt(tm.market.yes_ask)}</button>
              <button onClick={() => setTm({ ...tm, side: "no" })} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${tm.side === "no" ? "bg-red-glow text-white" : "bg-bg-card border border-slate-border text-slate-muted"}`}>NO {fmt(tm.market.no_ask)}</button>
            </div>
            {/* Order type */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTm({ ...tm, type: "market" })} className={`flex-1 py-2 rounded-lg text-xs font-medium ${tm.type === "market" ? "bg-bg-card border border-green-muted text-green-glow" : "bg-bg-card border border-slate-border text-slate-muted"}`}>Market</button>
              <button onClick={() => setTm({ ...tm, type: "limit" })} className={`flex-1 py-2 rounded-lg text-xs font-medium ${tm.type === "limit" ? "bg-bg-card border border-green-muted text-green-glow" : "bg-bg-card border border-slate-border text-slate-muted"}`}>Limit</button>
            </div>
            {/* Count */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Contracts</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setTm({ ...tm, count: Math.max(1, tm.count - 1) })} className="w-10 h-10 rounded-lg bg-bg-card border border-slate-border text-white font-bold">−</button>
                <input type="number" value={tm.count} onChange={e => setTm({ ...tm, count: Math.max(1, Number(e.target.value)) })} className="w-20 text-center font-mono text-lg font-bold" min={1} />
                <button onClick={() => setTm({ ...tm, count: tm.count + 1 })} className="w-10 h-10 rounded-lg bg-bg-card border border-slate-border text-white font-bold">+</button>
                <div className="flex gap-1 ml-auto">
                  {[5, 10, 25].map(n => <button key={n} onClick={() => setTm({ ...tm, count: n })} className="px-2 py-1 rounded text-[10px] font-mono bg-bg-card border border-slate-border text-slate-muted hover:text-white">{n}</button>)}
                </div>
              </div>
            </div>
            {tm.type === "limit" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Limit Price (¢)</label>
                <input type="number" value={tm.lp} onChange={e => setTm({ ...tm, lp: Number(e.target.value) })} min={1} max={99} className="w-32 font-mono" />
              </div>
            )}
            {/* Summary */}
            <div className="bg-bg-card rounded-lg p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-muted">Cost</span><span className="font-mono font-bold text-white">${cost()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-muted">Max payout</span><span className="font-mono font-bold" style={{ color: "#00FF88" }}>${pay()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-muted">Profit if win</span><span className="font-mono font-bold" style={{ color: "#00FF88" }}>${(Number(pay()) - Number(cost())).toFixed(2)}</span></div>
            </div>
            {tm.result && <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${tm.result.ok ? "bg-green-subtle border border-green-muted text-green-glow" : "bg-red-subtle border border-red-muted text-red-glow"}`}>{tm.result.msg}</div>}
            <button onClick={doTrade} disabled={tm.loading} className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${tm.side === "yes" ? "btn-green" : "btn-red"}`}>
              {tm.loading ? "Placing..." : `Buy ${tm.count} ${tm.side.toUpperCase()} → $${cost()}`}
            </button>
            <p className="text-[10px] text-slate-muted text-center mt-3">Real money. Orders execute on Kalshi.</p>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-slate-border text-center"><p className="text-[10px] text-slate-muted">Greenlight &middot; Kalshi Inc. &middot; Not financial advice.</p></div>
    </div>
  );
}
