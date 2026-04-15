"use client";
import { useState, useEffect } from "react";

// Featured bracket templates — curated edge conditions
const FEATURED_BRACKETS = [
  {
    id: "1", title: "Home Favorite Pitching Edge",
    description: "MLB home teams with a starting pitcher ERA under 3.5 against sub-.500 opponents",
    sport: "MLB", emoji: "⚾",
    conditions: ["Playing at home", "Starting pitcher ERA < 3.5", "Opponent below .500"],
    side: "yes" as const, winRate: "64%",
  },
  {
    id: "2", title: "Top Seed on Best Surface",
    description: "Top 15 ATP players competing on their strongest surface type",
    sport: "Tennis", emoji: "🎾",
    conditions: ["Player ranked top 15", "Playing on preferred surface", "Won last 2 matches"],
    side: "yes" as const, winRate: "71%",
  },
  {
    id: "3", title: "Rested Home Team Edge",
    description: "NHL home teams with 2+ days rest against opponents on a back-to-back",
    sport: "NHL", emoji: "🏒",
    conditions: ["Playing at home", "2+ days rest", "Opponent on back-to-back"],
    side: "yes" as const, winRate: "59%",
  },
  {
    id: "4", title: "Dominant Favorite Streak",
    description: "NBA teams favored by 5+ on a 3-game win streak at home",
    sport: "NBA", emoji: "🏀",
    conditions: ["Favored by 5+", "On 3+ game win streak", "Playing at home"],
    side: "yes" as const, winRate: "67%",
  },
];

interface Market {
  ticker: string; event_ticker: string; event_title: string; title: string;
  category: string; yes_bid: number; yes_ask: number; no_bid: number; no_ask: number;
  last_price: number; prev_price: number; volume: number; close_time: string;
}

export default function HomePage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/kalshi/markets?limit=12&sports_only=true")
      .then(r => r.json()).then(d => setMarkets(d.markets || []))
      .catch(() => {}).finally(() => setLoading(false));
    fetch("/api/kalshi/portfolio").then(r => { setConnected(r.ok); }).catch(() => setConnected(false));
  }, []);

  const fmt = (d: number) => !d ? "—" : `${Math.round(d * 100)}¢`;
  const pct = (d: number) => !d ? 0 : Math.round(d * 100);
  const vol = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : `${Math.round(v)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center pt-6 pb-2">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Set your conditions. <span style={{ color: "#00FF88" }}>We execute.</span>
        </h1>
        <p className="text-slate-muted text-base max-w-xl mx-auto">
          Build brackets for any sports matchup. When your conditions are met, Greenlight auto-trades on Kalshi.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <a href="/dashboard/greenlights" className="btn-green text-sm py-3 px-8">Build a Bracket</a>
          <a href="/dashboard/markets" className="btn-ghost text-sm py-3 px-8">Browse Markets</a>
        </div>
      </div>

      {/* Connection CTA */}
      {connected === false && (
        <a href="/dashboard/settings" className="block gl-card-static p-5 border-yellow-500/20 hover:border-yellow-500/40 transition-all" style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.03), rgba(255,215,0,0.01))" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-bg-secondary border border-slate-border flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🔗</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Connect your Kalshi account to start trading</p>
              <p className="text-xs text-slate-muted mt-0.5">Link your API key to enable auto-bet, portfolio tracking, and live trading.</p>
            </div>
            <span className="text-xs font-medium text-yellow-400 flex-shrink-0">Set up →</span>
          </div>
        </a>
      )}

      {/* Featured Brackets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Featured Brackets</h2>
            <p className="text-sm text-slate-muted mt-0.5">Proven edge conditions — tap to use</p>
          </div>
          <a href="/dashboard/greenlights" className="text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: "#00E67A" }}>Build your own →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURED_BRACKETS.map((b, i) => (
            <a key={b.id} href="/dashboard/greenlights" className="gl-card p-5 block anim-slide" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.emoji}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-muted">{b.sport}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-green-subtle border border-green-muted" style={{ color: "#00FF88" }}>{b.winRate} edge</span>
              </div>
              <h3 className="font-display text-base font-bold text-white mb-1">{b.title}</h3>
              <p className="text-xs text-slate-muted mb-3 leading-relaxed">{b.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {b.conditions.map((c, j) => (
                  <span key={j} className="px-2 py-1 rounded-full text-[10px] font-medium bg-bg-secondary border border-slate-border text-slate-text">{c}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Trending Sports Markets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Trending Sports Markets</h2>
            <p className="text-sm text-slate-muted mt-0.5">Most active contracts on Kalshi right now</p>
          </div>
          <a href="/dashboard/markets" className="text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: "#00E67A" }}>See all →</a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="gl-card-static p-4 animate-pulse">
                <div className="h-2 bg-bg-hover rounded w-16 mb-3" />
                <div className="h-4 bg-bg-hover rounded w-full mb-2" />
                <div className="h-4 bg-bg-hover rounded w-2/3 mb-4" />
                <div className="h-1 bg-bg-hover rounded mb-4" />
                <div className="flex gap-2"><div className="flex-1 h-8 bg-green-subtle rounded-lg" /><div className="flex-1 h-8 bg-red-subtle rounded-lg" /></div>
              </div>
            ))}
          </div>
        ) : markets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {markets.slice(0, 6).map((m, i) => {
              const p = pct(m.last_price);
              return (
                <div key={m.ticker} className="gl-card p-4 flex flex-col anim-slide" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-slate-muted">{m.category}</span>
                    <span className="text-[10px] text-slate-muted font-mono">{vol(m.volume)} vol</span>
                  </div>
                  {m.event_title && m.event_title !== m.title && <p className="text-[10px] text-slate-muted truncate">{m.event_title}</p>}
                  <a href={`/dashboard/market/${m.ticker}`} className="font-display text-[14px] font-semibold text-white mb-3 leading-snug flex-1 line-clamp-2 hover:text-green-glow transition-colors">{m.title}</a>
                  {p > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-mono font-bold" style={{ color: "#00FF88" }}>{p}%</span>
                        <span className="text-[11px] font-mono font-bold text-red-glow">{100-p}%</span>
                      </div>
                      <div className="prob-bar"><div className="prob-fill" style={{ width: `${p}%` }} /></div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto">
                    <a href="/dashboard/markets" className="flex-1 btn-green py-2 text-xs text-center">Yes {fmt(m.yes_ask)}</a>
                    <a href="/dashboard/markets" className="flex-1 btn-red py-2 text-xs text-center">No {fmt(m.no_ask)}</a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="gl-card-static p-10 text-center">
            <p className="text-sm text-slate-muted">No sports markets available right now.</p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="gl-card-static p-8">
        <h2 className="font-display text-xl font-bold text-white text-center mb-8">How Greenlight Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-bg-secondary border border-slate-border flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🏗</span>
            </div>
            <h3 className="font-display text-sm font-bold text-white mb-1">1. Build Your Bracket</h3>
            <p className="text-xs text-slate-muted leading-relaxed">Search any team or player. Set conditions like home game, pitcher ERA, surface type, opponent rank.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-bg-secondary border border-slate-border flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🚦</span>
            </div>
            <h3 className="font-display text-sm font-bold text-white mb-1">2. Set Your Action</h3>
            <p className="text-xs text-slate-muted leading-relaxed">Choose to get notified or auto-bet. Set your position (Yes/No) and how much you want to risk.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-bg-secondary border border-slate-border flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="font-display text-sm font-bold text-white mb-1">3. We Execute</h3>
            <p className="text-xs text-slate-muted leading-relaxed">When conditions are met, Greenlight places the trade on Kalshi automatically. You just watch it hit.</p>
          </div>
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-[11px] text-slate-muted">Greenlight &middot; Market data by Kalshi Inc. &middot; CFTC regulated &middot; Not financial advice</p>
      </div>
    </div>
  );
}
