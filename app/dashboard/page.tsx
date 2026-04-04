"use client";

import { useState, useEffect } from "react";

interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  category: string;
  status: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  prev_price: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  close_time: string;
}

export default function DashboardPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marketsRes, balanceRes] = await Promise.allSettled([
        fetch("/api/kalshi/markets?limit=40"),
        fetch("/api/kalshi/portfolio"),
      ]);

      if (marketsRes.status === "fulfilled" && marketsRes.value.ok) {
        const data = await marketsRes.value.json();
        setMarkets(data.markets || []);
      }

      if (balanceRes.status === "fulfilled" && balanceRes.value.ok) {
        const data = await balanceRes.value.json();
        setBalance(data.balance);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (dollars: number) => {
    if (!dollars || dollars === 0) return "—";
    return `${Math.round(dollars * 100)}¢`;
  };

  const formatProbability = (dollars: number) => {
    if (!dollars) return 0;
    return Math.round(dollars * 100);
  };

  const priceChange = (current: number, prev: number) => {
    if (!prev || !current) return 0;
    return Math.round((current - prev) * 100);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
    return Math.round(vol).toString();
  };

  const timeUntilClose = (closeTime: string) => {
    const now = new Date();
    const close = new Date(closeTime);
    const diff = close.getTime() - now.getTime();
    if (diff < 0) return "Closed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const categories = ["all", ...Array.from(new Set(markets.map((m) => m.category).filter(Boolean)))];

  const filteredMarkets = markets.filter((m) => {
    const matchesCategory = filter === "all" || m.category === filter;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <span>Live Markets</span>
            {!loading && !error && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-green-subtle border border-green-muted text-green-glow text-xs font-medium">
                <span className="animate-pulse-dot light-green" style={{ width: "6px", height: "6px" }} />
                Connected
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-muted">
            {markets.length} contracts available on Kalshi
          </p>
        </div>
        <button onClick={fetchData} className="btn-ghost text-xs">
          ↻ Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="gl-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Balance</p>
          <p className="font-mono text-lg font-bold text-white">
            {balance !== null ? `$${(balance / 100).toFixed(2)}` : "—"}
          </p>
        </div>
        <div className="gl-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Markets</p>
          <p className="font-mono text-lg font-bold text-white">{markets.length}</p>
        </div>
        <div className="gl-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Greenlights</p>
          <p className="font-mono text-lg font-bold text-green-glow">0</p>
        </div>
        <div className="gl-card p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">Auto-bets</p>
          <p className="font-mono text-lg font-bold text-gold">0</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets..."
            className="text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-all ${
                filter === cat
                  ? "bg-green-glow text-black"
                  : "bg-bg-card border border-slate-border text-slate-muted hover:text-white hover:border-slate-divider"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Market cards */}
      {!loading && filteredMarkets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMarkets.map((market, i) => {
            const prob = formatProbability(market.last_price);
            const change = priceChange(market.last_price, market.prev_price);
            const isUp = change > 0;
            const isDown = change < 0;

            return (
              <div
                key={market.ticker}
                className="gl-card p-4 flex flex-col animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s`, opacity: 0 }}
              >
                {/* Top row — category + time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-slate-muted font-medium">
                    {market.category || market.event_ticker}
                  </span>
                  <span className="text-[10px] text-slate-muted font-mono">
                    {timeUntilClose(market.close_time)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-sm font-semibold text-white mb-1 leading-snug flex-1">
                  {market.title}
                </h3>
                {market.subtitle && (
                  <p className="text-xs text-slate-muted mb-3">{market.subtitle}</p>
                )}

                {/* Probability bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-green-glow font-bold">
                      {prob > 0 ? `${prob}%` : "—"} Yes
                    </span>
                    <span className="text-xs font-mono text-red-glow font-bold">
                      {prob > 0 ? `${100 - prob}%` : "—"} No
                    </span>
                  </div>
                  <div className="prob-bar">
                    <div
                      className="prob-fill-green"
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                </div>

                {/* Price + Volume row */}
                <div className="flex items-end justify-between pt-3 border-t border-slate-border">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-muted">
                        Last
                      </p>
                      <p className="font-mono text-sm font-bold text-white">
                        {formatPrice(market.last_price)}
                      </p>
                    </div>
                    {change !== 0 && (
                      <span
                        className={`text-xs font-mono font-bold ${
                          isUp ? "text-green-glow" : "text-red-glow"
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {change}¢
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-slate-muted">Vol</p>
                    <p className="font-mono text-xs text-slate-text">
                      {formatVolume(market.volume)}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 btn-green py-2 text-xs">
                    Yes {formatPrice(market.yes_ask)}
                  </button>
                  <button className="flex-1 btn-red py-2 text-xs">
                    No {formatPrice(market.no_ask)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gl-card p-4 animate-pulse">
              <div className="h-2 bg-bg-hover rounded w-16 mb-4" />
              <div className="h-4 bg-bg-hover rounded w-full mb-2" />
              <div className="h-4 bg-bg-hover rounded w-3/4 mb-4" />
              <div className="h-1 bg-bg-hover rounded w-full mb-4" />
              <div className="flex gap-2 mt-3">
                <div className="flex-1 h-8 bg-green-subtle rounded-lg" />
                <div className="flex-1 h-8 bg-red-subtle rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty / error states */}
      {!loading && error && (
        <div className="gl-card p-10 text-center">
          <div className="light-red mx-auto mb-4" style={{ width: "16px", height: "16px" }} />
          <h3 className="font-display text-lg font-bold text-white mb-2">Connection Error</h3>
          <p className="text-sm text-slate-muted max-w-md mx-auto">{error}</p>
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="gl-card p-10 text-center">
          <div className="light-yellow mx-auto mb-4" style={{ width: "16px", height: "16px" }} />
          <h3 className="font-display text-lg font-bold text-white mb-2">No Markets Loaded</h3>
          <p className="text-sm text-slate-muted max-w-md mx-auto">
            Add your Kalshi API key in Vercel environment variables to connect.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-slate-border text-center">
        <p className="text-[10px] text-slate-muted">
          Greenlight &middot; Market data by Kalshi Inc. &middot; Not financial advice.
        </p>
      </div>
    </div>
  );
}
