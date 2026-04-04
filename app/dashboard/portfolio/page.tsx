"use client";

import { useState, useEffect } from "react";

interface Position {
  ticker: string;
  market_ticker: string;
  side: string;
  count: number;
  avg_price: number;
  current_price: number;
}

export default function PortfolioPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kalshi/portfolio");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setPositions(data.positions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-xl">◆</span>
          Portfolio
        </h1>
        <p className="mt-1 text-sm text-slate-muted">
          Your positions and performance
        </p>
      </div>

      {/* Balance card */}
      <div className="gl-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">
              Account Balance
            </p>
            <p className="font-mono text-3xl font-bold text-white">
              {balance !== null ? `$${(balance / 100).toFixed(2)}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">
              Open Positions
            </p>
            <p className="font-mono text-3xl font-bold text-white">
              {positions.length}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">
              Total P&L
            </p>
            <p className="font-mono text-3xl font-bold text-green-glow">
              —
            </p>
          </div>
        </div>
      </div>

      {/* Positions */}
      {positions.length > 0 ? (
        <div className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">Open Positions</h2>
          {positions.map((pos, i) => (
            <div key={i} className="gl-card p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-white">
                  {pos.market_ticker || pos.ticker}
                </p>
                <p className={`text-xs font-bold ${pos.side === "yes" ? "text-green-glow" : "text-red-glow"}`}>
                  {pos.side?.toUpperCase()} × {pos.count}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-white">
                  {pos.avg_price ? `${Math.round(pos.avg_price * 100)}¢ avg` : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gl-card p-10 text-center">
          <div className="light-yellow mx-auto mb-4" style={{ width: "16px", height: "16px" }} />
          <h3 className="font-display text-lg font-bold text-white mb-2">
            No Open Positions
          </h3>
          <p className="text-sm text-slate-muted max-w-sm mx-auto">
            {loading
              ? "Loading your portfolio..."
              : "Start trading from the Markets tab or set up a Greenlight to auto-bet."}
          </p>
        </div>
      )}
    </div>
  );
}
