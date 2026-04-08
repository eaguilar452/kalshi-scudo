"use client";
import { useState } from "react";

// Predefined condition templates by sport
const SPORT_CONDITIONS: Record<string, { label: string; conditions: string[] }[]> = {
  MLB: [
    { label: "Home game", conditions: ["Playing at home"] },
    { label: "Away game", conditions: ["Playing away"] },
    { label: "Starting pitcher ERA", conditions: ["Starting pitcher ERA < 3.0", "Starting pitcher ERA < 3.5", "Starting pitcher ERA < 4.0"] },
    { label: "Win streak", conditions: ["On 3+ game win streak", "On 5+ game win streak"] },
    { label: "Against losing team", conditions: ["Opponent below .500", "Opponent below .400"] },
    { label: "Run line", conditions: ["Favored by 1.5+", "Underdog"] },
  ],
  Tennis: [
    { label: "Surface", conditions: ["Hard court", "Clay court", "Grass court"] },
    { label: "Opponent ranking", conditions: ["Opponent ranked below #20", "Opponent ranked below #30", "Opponent ranked below #50"] },
    { label: "Tournament round", conditions: ["Round of 64 or earlier", "Quarterfinals or later", "Semifinals or later"] },
    { label: "Head-to-head", conditions: ["Positive H2H record vs opponent"] },
    { label: "Recent form", conditions: ["Won last 2 matches", "Won last 3 matches"] },
  ],
  NHL: [
    { label: "Home game", conditions: ["Playing at home"] },
    { label: "Away game", conditions: ["Playing away"] },
    { label: "Goalie", conditions: ["Starting goalie SV% > .920", "Starting goalie SV% > .910"] },
    { label: "Back-to-back", conditions: ["Not on back-to-back", "Opponent on back-to-back"] },
    { label: "Division rival", conditions: ["Playing division rival"] },
  ],
  NBA: [
    { label: "Home game", conditions: ["Playing at home"] },
    { label: "Away game", conditions: ["Playing away"] },
    { label: "Rest advantage", conditions: ["2+ days rest", "Opponent on back-to-back"] },
    { label: "Point spread", conditions: ["Favored by 5+", "Favored by 10+", "Underdog"] },
    { label: "Key player", conditions: ["Star player active", "Opponent star player out"] },
  ],
  UFC: [
    { label: "Weight class", conditions: ["At natural weight class", "Moving up in weight"] },
    { label: "Streak", conditions: ["On 3+ fight win streak"] },
    { label: "Finish rate", conditions: ["Finish rate > 60%"] },
    { label: "Title fight", conditions: ["Championship bout"] },
  ],
  Soccer: [
    { label: "Home game", conditions: ["Playing at home"] },
    { label: "League position", conditions: ["Top 4 in table", "Top 8 in table"] },
    { label: "Form", conditions: ["Unbeaten in last 5", "Won last 3"] },
    { label: "Derby", conditions: ["Rival derby match"] },
  ],
};

// Your locked roster
const ROSTER = [
  { name: "Dodgers", sport: "MLB", emoji: "⚾" },
  { name: "Ohtani", sport: "MLB", emoji: "⚾" },
  { name: "Yamamoto", sport: "MLB", emoji: "⚾" },
  { name: "Tommy Paul", sport: "Tennis", emoji: "🎾" },
  { name: "Ben Shelton", sport: "Tennis", emoji: "🎾" },
  { name: "Taylor Fritz", sport: "Tennis", emoji: "🎾" },
  { name: "Marcos Giron", sport: "Tennis", emoji: "🎾" },
  { name: "Nakashima", sport: "Tennis", emoji: "🎾" },
  { name: "Jack Draper", sport: "Tennis", emoji: "🎾" },
  { name: "Joao Fonseca", sport: "Tennis", emoji: "🎾" },
  { name: "Madison Keys", sport: "Tennis", emoji: "🎾" },
  { name: "Coco Gauff", sport: "Tennis", emoji: "🎾" },
  { name: "Florida Panthers", sport: "NHL", emoji: "🏒" },
  { name: "Ilia Topuria", sport: "UFC", emoji: "🥊" },
  { name: "Islam Makhachev", sport: "UFC", emoji: "🥊" },
  { name: "Spain", sport: "Soccer", emoji: "⚽" },
  { name: "Barcelona", sport: "Soccer", emoji: "⚽" },
  { name: "LA Galaxy", sport: "Soccer", emoji: "⚽" },
  { name: "Inter Miami", sport: "Soccer", emoji: "⚽" },
];

interface Greenlight {
  id: string;
  subject: string;
  sport: string;
  conditions: string[];
  action: "notify" | "auto-bet";
  side: "yes" | "no";
  amount: number;
  status: "active" | "paused" | "triggered";
}

export default function GreenlightsPage() {
  const [gls, setGls] = useState<Greenlight[]>([]);
  const [building, setBuilding] = useState(false);

  // Builder state
  const [step, setStep] = useState(1); // 1=pick subject, 2=set conditions, 3=set action
  const [subject, setSubject] = useState<typeof ROSTER[0] | null>(null);
  const [selectedConds, setSelectedConds] = useState<string[]>([]);
  const [customCond, setCustomCond] = useState("");
  const [action, setAction] = useState<"notify" | "auto-bet">("notify");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState(10);

  const resetBuilder = () => {
    setBuilding(false); setStep(1); setSubject(null);
    setSelectedConds([]); setCustomCond(""); setAction("notify"); setSide("yes"); setAmount(10);
  };

  const toggleCond = (c: string) => {
    setSelectedConds(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const addCustomCond = () => {
    if (customCond.trim()) { setSelectedConds([...selectedConds, customCond.trim()]); setCustomCond(""); }
  };

  const createGL = () => {
    if (!subject || selectedConds.length === 0) return;
    const gl: Greenlight = {
      id: Date.now().toString(),
      subject: subject.name,
      sport: subject.sport,
      conditions: selectedConds,
      action, side, amount,
      status: "active",
    };
    setGls([gl, ...gls]);
    resetBuilder();
  };

  const sportConditions = subject ? SPORT_CONDITIONS[subject.sport] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <span className="light-green" />Greenlights
          </h1>
          <p className="mt-1 text-sm text-slate-muted">
            Build your brackets. When conditions are met — we go.
          </p>
        </div>
        {!building && (
          <button onClick={() => setBuilding(true)} className="btn-green text-xs">
            + New Greenlight
          </button>
        )}
      </div>

      {/* ═══ BRACKET BUILDER ═══ */}
      {building && (
        <div className="gl-card overflow-hidden">
          {/* Progress bar */}
          <div className="flex">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1 transition-all ${step >= s ? "bg-green-glow" : "bg-slate-border"}`} />
            ))}
          </div>

          <div className="p-6">
            {/* STEP 1: Pick subject */}
            {step === 1 && (
              <div className="anim-slide" style={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Who are you betting on?</h3>
                    <p className="text-sm text-slate-muted mt-1">Pick from your roster or add someone new</p>
                  </div>
                  <button onClick={resetBuilder} className="text-slate-muted hover:text-white text-sm">✕</button>
                </div>

                {/* Roster by sport */}
                {["MLB", "Tennis", "NHL", "UFC", "Soccer", "NBA"].map(sport => {
                  const players = ROSTER.filter(r => r.sport === sport);
                  if (players.length === 0) return null;
                  return (
                    <div key={sport} className="mb-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-2">{sport}</p>
                      <div className="flex flex-wrap gap-2">
                        {players.map(p => (
                          <button
                            key={p.name}
                            onClick={() => { setSubject(p); setStep(2); }}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                              subject?.name === p.name
                                ? "bg-green-subtle border-green-muted text-green-glow"
                                : "bg-bg-secondary border-slate-border text-slate-text hover:border-slate-divider hover:text-white"
                            }`}
                          >
                            {p.emoji} {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 2: Set conditions */}
            {step === 2 && subject && (
              <div className="anim-slide" style={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-muted">Setting conditions for</p>
                    <h3 className="font-display text-lg font-bold text-white">{subject.emoji} {subject.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setStep(1); setSelectedConds([]); }} className="btn-ghost text-xs">← Back</button>
                    <button onClick={resetBuilder} className="text-slate-muted hover:text-white text-sm">✕</button>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-3">
                  When should we greenlight? (pick one or more)
                </p>

                <div className="space-y-3 mb-4">
                  {sportConditions.map(group => (
                    <div key={group.label}>
                      <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-1.5">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.conditions.map(c => (
                          <button
                            key={c}
                            onClick={() => toggleCond(c)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                              selectedConds.includes(c)
                                ? "bg-green-subtle border-green-muted text-green-glow"
                                : "bg-bg-secondary border-slate-border text-slate-muted hover:text-white"
                            }`}
                          >
                            {selectedConds.includes(c) && "✓ "}{c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom condition */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={customCond}
                    onChange={e => setCustomCond(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCustomCond()}
                    placeholder="Add a custom condition..."
                    className="text-sm flex-1"
                  />
                  <button onClick={addCustomCond} className="btn-ghost text-xs px-4">Add</button>
                </div>

                {/* Selected conditions summary */}
                {selectedConds.length > 0 && (
                  <div className="bg-bg-secondary rounded-lg p-4 mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-2">Your bracket ({selectedConds.length} condition{selectedConds.length > 1 ? "s" : ""})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConds.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-subtle border border-green-muted" style={{ color: "#00FF88" }}>
                          {c}
                          <button onClick={() => toggleCond(c)} className="opacity-50 hover:opacity-100">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(3)}
                  disabled={selectedConds.length === 0}
                  className="btn-green disabled:opacity-30"
                >
                  Next: Set action →
                </button>
              </div>
            )}

            {/* STEP 3: Set action */}
            {step === 3 && subject && (
              <div className="anim-slide" style={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-muted">{subject.emoji} {subject.name} — {selectedConds.length} condition{selectedConds.length > 1 ? "s" : ""}</p>
                    <h3 className="font-display text-lg font-bold text-white">What happens when conditions are met?</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(2)} className="btn-ghost text-xs">← Back</button>
                    <button onClick={resetBuilder} className="text-slate-muted hover:text-white text-sm">✕</button>
                  </div>
                </div>

                {/* Action selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setAction("notify")}
                    className={`p-5 rounded-xl text-left transition-all border ${
                      action === "notify"
                        ? "bg-blue-900/20 border-blue-500/30"
                        : "bg-bg-secondary border-slate-border"
                    }`}
                  >
                    <div className="text-2xl mb-2">🔔</div>
                    <p className={`text-sm font-bold ${action === "notify" ? "text-blue-400" : "text-white"}`}>Notify Me</p>
                    <p className="text-xs text-slate-muted mt-1">Get alerted when conditions are met. You decide to trade.</p>
                  </button>
                  <button
                    onClick={() => setAction("auto-bet")}
                    className={`p-5 rounded-xl text-left transition-all border ${
                      action === "auto-bet"
                        ? "bg-green-subtle border-green-muted"
                        : "bg-bg-secondary border-slate-border"
                    }`}
                  >
                    <div className="text-2xl mb-2">⚡</div>
                    <p className={`text-sm font-bold ${action === "auto-bet" ? "text-green-glow" : "text-white"}`}>Auto-Bet</p>
                    <p className="text-xs text-slate-muted mt-1">Automatically place the trade when conditions hit.</p>
                  </button>
                </div>

                {/* Side */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Position</p>
                  <div className="flex gap-2">
                    <button onClick={() => setSide("yes")} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${side === "yes" ? "bg-green-glow text-black" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>YES — they win / it happens</button>
                    <button onClick={() => setSide("no")} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${side === "no" ? "bg-red-glow text-white" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>NO — they lose / it doesn&apos;t</button>
                  </div>
                </div>

                {/* Amount */}
                {action === "auto-bet" && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Bet Amount</p>
                    <div className="flex gap-2">
                      {[5, 10, 25, 50, 100].map(a => (
                        <button
                          key={a}
                          onClick={() => setAmount(a)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-mono font-bold transition-all ${
                            amount === a
                              ? "bg-green-subtle border border-green-muted text-green-glow"
                              : "bg-bg-secondary border border-slate-border text-slate-muted"
                          }`}
                        >
                          ${a}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      min={1}
                      className="text-sm mt-2 w-32 font-mono"
                      placeholder="Custom"
                    />
                  </div>
                )}

                {/* Summary card */}
                <div className="bg-bg-secondary rounded-xl p-5 mb-6 border border-slate-border">
                  <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-3">Greenlight Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-muted">Subject</span>
                      <span className="text-white font-medium">{subject.emoji} {subject.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-muted">Conditions</span>
                      <span className="text-white font-medium">{selectedConds.length} rules</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-muted">Action</span>
                      <span className={action === "auto-bet" ? "text-green-glow font-medium" : "text-blue-400 font-medium"}>
                        {action === "auto-bet" ? `⚡ Auto-bet $${amount}` : "🔔 Notify"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-muted">Side</span>
                      <span className={`font-mono font-bold ${side === "yes" ? "text-green-glow" : "text-red-glow"}`}>{side.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <button onClick={createGL} className="btn-green w-full py-3.5 text-sm">
                  🚦 Create Greenlight
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ACTIVE GREENLIGHTS ═══ */}
      {gls.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white">Active Greenlights</h2>
          {gls.map(gl => (
            <div key={gl.id} className="gl-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1"><div className={gl.status === "active" ? "light-green anim-pulse" : "light-red"} style={{ width: 10, height: 10 }} /></div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      {ROSTER.find(r => r.name === gl.subject)?.emoji} {gl.subject}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {gl.conditions.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-bg-secondary border border-slate-border text-slate-text">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-xs font-medium ${gl.action === "auto-bet" ? "text-green-glow" : "text-blue-400"}`}>
                        {gl.action === "auto-bet" ? `⚡ $${gl.amount}` : "🔔 Notify"}
                      </span>
                      <span className={`text-xs font-mono font-bold ${gl.side === "yes" ? "text-green-glow" : "text-red-glow"}`}>{gl.side.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-muted uppercase">{gl.sport}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div onClick={() => setGls(gls.map(g => g.id === gl.id ? { ...g, status: g.status === "active" ? "paused" : "active" } : g))} className={`toggle-track ${gl.status === "active" ? "on" : ""}`}><div className="toggle-thumb" /></div>
                  <button onClick={() => setGls(gls.filter(g => g.id !== gl.id))} className="text-slate-muted hover:text-red-glow transition-colors text-sm p-1">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!building && gls.length === 0 && (
        <div className="gl-card p-12 text-center">
          <div className="text-4xl mb-4">🚦</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Build Your First Bracket</h3>
          <p className="text-sm text-slate-muted max-w-md mx-auto mb-6">
            Pick a player or team from your roster, set the conditions you want to see,
            and choose whether to get notified or auto-bet when everything lines up.
          </p>
          <button onClick={() => setBuilding(true)} className="btn-green">
            + New Greenlight
          </button>
        </div>
      )}
    </div>
  );
}
