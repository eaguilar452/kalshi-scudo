"use client";
import { useState, useEffect } from "react";

export default function PortfolioPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/kalshi/portfolio").then(r => {
      if (r.ok) { setConnected(true); return r.json(); }
      throw new Error("Not connected");
    }).then(d => {
      setBalance(d.balance); setPositions(d.positions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!loading && !connected) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-white mb-6">Portfolio</h1>
        <div className="gl-card-static p-10 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Connect Kalshi to View Portfolio</h3>
          <p className="text-sm text-slate-muted max-w-md mx-auto mb-6">Link your Kalshi account to see your balance, positions, and trading history.</p>
          <a href="/dashboard/settings" className="btn-green text-sm py-3 px-8 inline-block">Connect Kalshi Account</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-sm text-slate-muted mt-0.5">Your positions and performance on Kalshi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="gl-card-static p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1.5">Balance</p>
          <p className="font-mono text-2xl font-bold text-white">{balance !== null ? `$${(balance / 100).toFixed(2)}` : "—"}</p>
        </div>
        <div className="gl-card-static p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1.5">Positions</p>
          <p className="font-mono text-2xl font-bold text-white">{positions.length}</p>
        </div>
        <div className="gl-card-static p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1.5">Invested</p>
          <p className="font-mono text-2xl font-bold text-white">—</p>
        </div>
        <div className="gl-card-static p-5">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1.5">Total P&L</p>
          <p className="font-mono text-2xl font-bold" style={{ color: "#00FF88" }}>—</p>
        </div>
      </div>

      {/* Positions */}
      <div>
        <h2 className="font-display text-lg font-bold text-white mb-3">Open Positions</h2>
        {loading ? (
          <div className="gl-card-static p-8 text-center"><p className="text-sm text-slate-muted">Loading positions...</p></div>
        ) : positions.length > 0 ? (
          <div className="space-y-2">
            {positions.map((p: any, i: number) => (
              <div key={i} className="gl-card-static p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={p.side === "yes" ? "light-green" : "light-red"} style={{ width: 8, height: 8 }} />
                  <div>
                    <p className="text-sm font-medium text-white">{p.market_ticker || p.ticker}</p>
                    <p className={`text-xs font-bold ${p.side === "yes" ? "text-green-glow" : "text-red-glow"}`}>{p.side?.toUpperCase()} × {p.count}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-white">{p.avg_price ? `${Math.round(p.avg_price * 100)}¢` : "—"}</p>
                  <p className="text-[10px] text-slate-muted">avg price</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gl-card-static p-8 text-center">
            <p className="text-sm text-slate-muted mb-4">No open positions yet.</p>
            <a href="/dashboard/markets" className="btn-green text-xs py-2.5 px-6 inline-block">Browse Markets</a>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="font-display text-lg font-bold text-white mb-3">Recent Activity</h2>
        <div className="gl-card-static p-8 text-center">
          <p className="text-sm text-slate-muted">Trade history will appear here once you start trading.</p>
        </div>
      </div>

      <div className="pt-4 text-center">
        <p className="text-[10px] text-slate-muted">Portfolio data from Kalshi. Updates in real-time.</p>
      </div>
    </div>
  );
}
