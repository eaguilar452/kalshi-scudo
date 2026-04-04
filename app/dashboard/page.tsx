"use client";

import { useState, useEffect, useCallback } from "react";

interface Market {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  no_subtitle: string;
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

interface TradeState {
  market: Market | null;
  side: "yes" | "no";
  count: number;
  type: "market" | "limit";
  limitPrice: number;
  loading: boolean;
  result: { success: boolean; message: string } | null;
}

export default function DashboardPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalLoaded, setTotalLoaded] = useState(0);

  // Trade modal state
  const [trade, setTrade] = useState<TradeState>({
    market: null,
    side: "yes",
    count: 1,
    type: "market",
    limitPrice: 50,
    loading: false,
    result: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [marketsRes, balanceRes] = await Promise.allSettled([
        fetch("/api/kalshi/markets?fetch_all=true"),
        fetch("/api/kalshi/portfolio"),
      ]);

      if (marketsRes.status === "fulfilled" && marketsRes.value.ok) {
        const data = await marketsRes.value.json();
        setMarkets(data.markets || []);
        setTotalLoaded(data.total || 0);
      } else if (marketsRes.status === "fulfilled") {
        const data = await marketsRes.value.json();
        setError(data.error || "Failed to load markets");
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

  // Trade execution
  const executeTrade = async () => {
    if (!trade.market) return;

    setTrade((t) => ({ ...t, loading: true, result: null }));

    try {
      const body: any = {
        ticker: trade.market.ticker,
        action: "buy",
        side: trade.side,
        type: trade.type,
        count: trade.count,
      };

      if (trade.type === "limit") {
        // Convert cents to dollars for API
        const priceInDollars = trade.limitPrice / 100;
        if (trade.side === "yes") {
          body.yes_price = priceInDollars;
        } else {
          body.no_price = priceInDollars;
        }
      }

      const res = await fetch("/api/kalshi/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTrade((t) => ({
          ...t,
          loading: false,
          result: {
            success: true,
            message: `Order placed: ${trade.count} ${trade.side.toUpperCase()} on ${trade.market!.ticker}`,
          },
        }));
        // Refresh balance
        fetch("/api/kalshi/portfolio")
          .then((r) => r.json())
          .then((d) => setBalance(d.balance))
          .catch(() => {});
      } else {
        setTrade((t) => ({
          ...t,
          loading: false,
          result: {
            success: false,
            message: data.error || "Order failed",
          },
        }));
      }
    } catch (err: any) {
      setTrade((t) => ({
        ...t,
        loading: false,
        result: { success: false, message: err.message },
      }));
    }
  };

  const openTrade = (market: Market, side: "yes" | "no") => {
    const price =
      side === "yes"
        ? Math.round(market.yes_ask * 100)
        : Math.round(market.no_ask * 100);
    setTrade({
      market,
      side,
      count: 1,
      type: "market",
      limitPrice: price || 50,
      loading: false,
      result: null,
    });
  };

  const closeTrade = () => {
    setTrade({
      market: null,
      side: "yes",
      count: 1,
      type: "market",
      limitPrice: 50,
      loading: false,
      result: null,
    });
  };

  // Helpers
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
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
    return Math.round(vol).toString();
  };

  const timeUntilClose = (closeTime: string) => {
    if (!closeTime) return "";
    const now = new Date();
    const close = new Date(closeTime);
    const diff = close.getTime() - now.getTime();
    if (diff < 0) return "Closed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    if (days > 0) return `${days}d`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(
      new Set(markets.map((m) => m.category).filter(Boolean))
    ).sort(),
  ];

  // Filter + search
  const filteredMarkets = markets.filter((m) => {
    const matchesCategory = filter === "all" || m.category === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.ticker.toLowerCase().includes(q) ||
      m.event_ticker.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Estimate cost for trade modal
  const estimatedCost = () => {
    if (!trade.market) return 0;
    const price =
      trade.type === "limit"
        ? trade.limitPrice
        : trade.side === "yes"
        ? Math.round(trade.market.yes_ask * 100)
        : Math.round(trade.market.no_ask * 100);
    return ((price * trade.count) / 100).toFixed(2);
  };

  const maxPayout = () => {
    return (trade.count * 1).toFixed(2); // Each contract pays $1 on win
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            Live Markets
            {!loading && !error && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-green-subtle border border-green-muted text-green-glow text-xs font-medium">
                <span
                  className="light-green animate-pulse-dot"
                  style={{ width: "6px", height: "6px" }}
                />
                {totalLoaded} contracts
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-muted">
            Sorted by volume &middot; All categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-slate-muted">
              Balance
            </p>
            <p className="font-mono text-sm font-bold text-white">
              {balance !== null ? `$${(balance / 100).toFixed(2)}` : "—"}
            </p>
          </div>
          <button onClick={fetchData} className="btn-ghost text-xs">
            ↻
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ticker, or keyword..."
          className="text-sm"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                filter === cat
                  ? "bg-green-glow text-black"
                  : "bg-bg-card border border-slate-border text-slate-muted hover:text-white hover:border-slate-divider"
              }`}
            >
              {cat === "all"
                ? `All (${markets.length})`
                : `${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-xs text-slate-muted">
          {filteredMarkets.length} result{filteredMarkets.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {/* Market cards */}
      {!loading && filteredMarkets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMarkets.slice(0, 300).map((market, i) => {
            const prob = formatProbability(market.last_price);
            const change = priceChange(market.last_price, market.prev_price);

            return (
              <div
                key={market.ticker}
                className="gl-card p-4 flex flex-col animate-slide-up"
                style={{
                  animationDelay: `${Math.min(i * 0.02, 0.2)}s`,
                  opacity: 0,
                }}
              >
                {/* Top — category + time */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-muted font-medium truncate mr-2">
                    {market.category || market.event_ticker}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {change !== 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          change > 0 ? "text-green-glow" : "text-red-glow"
                        }`}
                      >
                        {change > 0 ? "▲" : "▼"}
                        {Math.abs(change)}¢
                      </span>
                    )}
                    <span className="text-[10px] text-slate-muted font-mono">
                      {timeUntilClose(market.close_time)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-[15px] font-semibold text-white mb-3 leading-snug flex-1 line-clamp-2">
                  {market.title}
                </h3>

                {/* Probability bar */}
                {prob > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-green-glow font-bold">
                        {prob}%
                      </span>
                      <span className="text-[11px] font-mono text-red-glow font-bold">
                        {100 - prob}%
                      </span>
                    </div>
                    <div className="prob-bar">
                      <div
                        className="prob-fill-green"
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Price row */}
                <div className="flex items-end justify-between pt-2 border-t border-slate-border">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-muted">
                        Bid / Ask
                      </p>
                      <p className="font-mono text-xs text-white">
                        {formatPrice(market.yes_bid)}{" "}
                        <span className="text-slate-muted">/</span>{" "}
                        {formatPrice(market.yes_ask)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-slate-muted">
                      Vol
                    </p>
                    <p className="font-mono text-xs text-slate-text">
                      {formatVolume(market.volume)}
                    </p>
                  </div>
                </div>

                {/* Trade buttons */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openTrade(market, "yes")}
                    className="flex-1 btn-green py-2 text-xs"
                  >
                    Yes {formatPrice(market.yes_ask)}
                  </button>
                  <button
                    onClick={() => openTrade(market, "no")}
                    className="flex-1 btn-red py-2 text-xs"
                  >
                    No {formatPrice(market.no_ask)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show more indicator */}
      {!loading && filteredMarkets.length > 300 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-muted">
            Showing 300 of {filteredMarkets.length} markets. Use search to find specific contracts.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="light-green mx-auto mb-3 animate-glow-pulse" style={{ width: "16px", height: "16px" }} />
            <p className="text-sm text-slate-muted">Loading all markets from Kalshi...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="gl-card p-4 animate-pulse">
                <div className="h-2 bg-bg-hover rounded w-16 mb-3" />
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
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="gl-card p-10 text-center">
          <div
            className="light-red mx-auto mb-4"
            style={{ width: "16px", height: "16px" }}
          />
          <h3 className="font-display text-lg font-bold text-white mb-2">
            Connection Error
          </h3>
          <p className="text-sm text-slate-muted max-w-md mx-auto">{error}</p>
          <button onClick={fetchData} className="btn-ghost text-xs mt-4">
            Retry
          </button>
        </div>
      )}

      {/* ═══════════ TRADE MODAL ═══════════ */}
      {trade.market && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeTrade();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div className="relative bg-bg-secondary border border-slate-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up shadow-2xl">
            {/* Close */}
            <button
              onClick={closeTrade}
              className="absolute top-4 right-4 text-slate-muted hover:text-white text-lg"
            >
              ✕
            </button>

            {/* Market info */}
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1">
                {trade.market.category || trade.market.event_ticker}
              </p>
              <h3 className="font-display text-lg font-bold text-white leading-snug">
                {trade.market.title}
              </h3>
            </div>

            {/* Side selector */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setTrade((t) => ({ ...t, side: "yes" }))}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                  trade.side === "yes"
                    ? "bg-green-glow text-black shadow-green-glow"
                    : "bg-bg-card border border-slate-border text-slate-muted"
                }`}
              >
                YES {formatPrice(trade.market.yes_ask)}
              </button>
              <button
                onClick={() => setTrade((t) => ({ ...t, side: "no" }))}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                  trade.side === "no"
                    ? "bg-red-glow text-white shadow-red-glow"
                    : "bg-bg-card border border-slate-border text-slate-muted"
                }`}
              >
                NO {formatPrice(trade.market.no_ask)}
              </button>
            </div>

            {/* Order type */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTrade((t) => ({ ...t, type: "market" }))}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  trade.type === "market"
                    ? "bg-bg-card border border-green-muted text-green-glow"
                    : "bg-bg-card border border-slate-border text-slate-muted"
                }`}
              >
                Market Order
              </button>
              <button
                onClick={() => setTrade((t) => ({ ...t, type: "limit" }))}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  trade.type === "limit"
                    ? "bg-bg-card border border-green-muted text-green-glow"
                    : "bg-bg-card border border-slate-border text-slate-muted"
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Contracts count */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                Contracts
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setTrade((t) => ({
                      ...t,
                      count: Math.max(1, t.count - 1),
                    }))
                  }
                  className="w-10 h-10 rounded-lg bg-bg-card border border-slate-border text-white font-bold hover:border-slate-divider transition-all"
                >
                  −
                </button>
                <input
                  type="number"
                  value={trade.count}
                  onChange={(e) =>
                    setTrade((t) => ({
                      ...t,
                      count: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className="w-20 text-center font-mono text-lg font-bold"
                  min={1}
                />
                <button
                  onClick={() =>
                    setTrade((t) => ({ ...t, count: t.count + 1 }))
                  }
                  className="w-10 h-10 rounded-lg bg-bg-card border border-slate-border text-white font-bold hover:border-slate-divider transition-all"
                >
                  +
                </button>
                <div className="flex gap-1 ml-auto">
                  {[5, 10, 25].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTrade((t) => ({ ...t, count: n }))}
                      className="px-2 py-1 rounded text-[10px] font-mono bg-bg-card border border-slate-border text-slate-muted hover:text-white transition-all"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Limit price */}
            {trade.type === "limit" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                  Limit Price (¢)
                </label>
                <input
                  type="number"
                  value={trade.limitPrice}
                  onChange={(e) =>
                    setTrade((t) => ({
                      ...t,
                      limitPrice: Number(e.target.value),
                    }))
                  }
                  min={1}
                  max={99}
                  className="w-32 font-mono"
                />
              </div>
            )}

            {/* Cost summary */}
            <div className="bg-bg-card rounded-lg p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-muted">Estimated cost</span>
                <span className="font-mono font-bold text-white">
                  ${estimatedCost()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-muted">Max payout</span>
                <span className="font-mono font-bold text-green-glow">
                  ${maxPayout()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-muted">Potential profit</span>
                <span className="font-mono font-bold text-green-glow">
                  $
                  {(
                    parseFloat(maxPayout()) - parseFloat(estimatedCost())
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Result message */}
            {trade.result && (
              <div
                className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                  trade.result.success
                    ? "bg-green-subtle border border-green-muted text-green-glow"
                    : "bg-red-subtle border border-red-muted text-red-glow"
                }`}
              >
                {trade.result.message}
              </div>
            )}

            {/* Execute button */}
            <button
              onClick={executeTrade}
              disabled={trade.loading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                trade.side === "yes"
                  ? "btn-green shadow-green-glow"
                  : "btn-red shadow-red-glow"
              }`}
            >
              {trade.loading
                ? "Placing order..."
                : `Buy ${trade.count} ${trade.side.toUpperCase()} → $${estimatedCost()}`}
            </button>

            <p className="text-[10px] text-slate-muted text-center mt-3">
              Real money. Orders execute immediately on Kalshi.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-slate-border text-center">
        <p className="text-[10px] text-slate-muted">
          Greenlight &middot; Market data by Kalshi Inc. &middot; Not financial
          advice.
        </p>
      </div>
    </div>
  );
}
