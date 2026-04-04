"use client";
import { useState, useEffect } from "react";

export default function PortfolioPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/kalshi/portfolio").then(r => r.json()).then(d => {
      setBalance(d.balance); setPositions(d.positions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-white flex items-center gap-3"><span className="text-xl">◆</span>Portfolio</h1><p className="mt-1 text-sm text-slate-muted">Your positions and performance</p></div>
      <div className="gl-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div><p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Balance</p><p className="font-mono text-3xl font-bold text-white">{balance !== null ? `$${(balance / 100).toFixed(2)}` : "—"}</p></div>
          <div><p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Open Positions</p><p className="font-mono text-3xl font-bold text-white">{positions.length}</p></div>
          <div><p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Total P&L</p><p className="font-mono text-3xl font-bold" style={{ color: "#00FF88" }}>—</p></div>
        </div>
      </div>
      {positions.length > 0 ? (
        <div className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">Open Positions</h2>
          {positions.map((p: any, i: number) => (
            <div key={i} className="gl-card p-4 flex items-center justify-between">
              <div><p className="font-mono text-sm font-bold text-white">{p.market_ticker || p.ticker}</p><p className={`text-xs font-bold ${p.side === "yes" ? "text-green-glow" : "text-red-glow"}`}>{p.side?.toUpperCase()} × {p.count}</p></div>
              <div className="text-right"><p className="font-mono text-sm text-white">{p.avg_price ? `${Math.round(p.avg_price * 100)}¢ avg` : "—"}</p></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gl-card p-10 text-center">
          <div className="light-yellow mx-auto mb-4" style={{ width: 16, height: 16 }} />
          <h3 className="font-display text-lg font-bold text-white mb-2">No Positions</h3>
          <p className="text-sm text-slate-muted max-w-sm mx-auto">{loading ? "Loading..." : "Trade from Markets or set up a Greenlight."}</p>
        </div>
      )}
    </div>
  );
}
