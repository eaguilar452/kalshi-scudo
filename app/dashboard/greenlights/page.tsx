"use client";
import { useState } from "react";

const SPORT_CONDITIONS: Record<string, { label: string; options: string[] }[]> = {
  Baseball: [
    { label: "Venue", options: ["Playing at home", "Playing away"] },
    { label: "Pitching", options: ["Starting pitcher ERA < 3.0", "Starting pitcher ERA < 3.5", "Starting pitcher ERA < 4.0", "Bullpen ERA < 3.5"] },
    { label: "Opponent", options: ["Opponent below .500", "Opponent below .400", "Opponent on losing streak"] },
    { label: "Streaks", options: ["On 3+ game win streak", "On 5+ game win streak", "Won last series"] },
  ],
  Tennis: [
    { label: "Surface", options: ["Hard court", "Clay court", "Grass court", "Indoor"] },
    { label: "Ranking", options: ["Opponent ranked below #20", "Opponent ranked below #30", "Opponent ranked below #50", "Opponent outside top 100"] },
    { label: "Form", options: ["Won last 2 matches", "Won last 3 matches", "Positive H2H vs opponent"] },
    { label: "Tournament", options: ["Grand Slam", "Masters 1000", "ATP 500", "First round"] },
  ],
  Hockey: [
    { label: "Venue", options: ["Playing at home", "Playing away"] },
    { label: "Goalie", options: ["Starting goalie SV% > .920", "Starting goalie SV% > .910"] },
    { label: "Schedule", options: ["Not on back-to-back", "Opponent on back-to-back", "3+ days rest"] },
    { label: "Context", options: ["Division rival", "Playoff contender", "Top 5 in conference"] },
  ],
  Basketball: [
    { label: "Venue", options: ["Playing at home", "Playing away"] },
    { label: "Spread", options: ["Favored by 3+", "Favored by 5+", "Favored by 10+", "Underdog"] },
    { label: "Rest", options: ["2+ days rest", "Opponent on back-to-back", "Not on back-to-back"] },
    { label: "Streaks", options: ["On 3+ game win streak", "On 5+ game win streak"] },
  ],
  Football: [
    { label: "Venue", options: ["Playing at home", "Playing away"] },
    { label: "Spread", options: ["Favored by 3+", "Favored by 7+", "Underdog", "Home underdog"] },
    { label: "Context", options: ["Division game", "Primetime game", "Playoff game"] },
    { label: "Streaks", options: ["On 3+ game win streak", "Coming off a bye week"] },
  ],
  Soccer: [
    { label: "Venue", options: ["Playing at home", "Playing away"] },
    { label: "Form", options: ["Unbeaten last 5", "Won last 3", "Clean sheet last 2"] },
    { label: "Table", options: ["Top 4 in league", "Top 8 in league", "Opponent in bottom 5"] },
    { label: "Context", options: ["Derby match", "Cup match", "Champions League"] },
  ],
  MMA: [
    { label: "Fighter", options: ["On 3+ fight win streak", "Finish rate > 60%", "Champion or top 5"] },
    { label: "Context", options: ["Title fight", "Main event", "At natural weight class"] },
    { label: "Odds", options: ["Betting favorite", "Underdog +200 or more"] },
  ],
  Golf: [
    { label: "Course", options: ["Course specialist (top 10 last visit)", "Links course", "Par 72+"] },
    { label: "Form", options: ["Top 20 last tournament", "Made cut last 3 events"] },
    { label: "Ranking", options: ["Top 20 in world", "Top 50 in world"] },
  ],
};

const SPORT_LIST = ["Baseball", "Basketball", "Football", "Hockey", "Tennis", "Soccer", "MMA", "Golf"];

interface GL { id: string; subject: string; sport: string; conditions: string[]; action: "notify"|"auto-bet"; side: "yes"|"no"; amount: number; status: "active"|"paused"; }

export default function GreenlightsPage() {
  const [gls, setGls] = useState<GL[]>([]);
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(1);

  // Builder
  const [subjectName, setSubjectName] = useState("");
  const [sport, setSport] = useState("");
  const [conds, setConds] = useState<string[]>([]);
  const [customCond, setCustomCond] = useState("");
  const [action, setAction] = useState<"notify"|"auto-bet">("notify");
  const [side, setSide] = useState<"yes"|"no">("yes");
  const [amount, setAmount] = useState(10);

  const reset = () => { setBuilding(false); setStep(1); setSubjectName(""); setSport(""); setConds([]); setCustomCond(""); setAction("notify"); setSide("yes"); setAmount(10); };
  const toggle = (c: string) => setConds(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const addCustom = () => { if (customCond.trim()) { setConds([...conds, customCond.trim()]); setCustomCond(""); } };

  const create = () => {
    if (!subjectName || !sport || conds.length === 0) return;
    setGls([{ id: Date.now().toString(), subject: subjectName, sport, conditions: conds, action, side, amount, status: "active" }, ...gls]);
    reset();
  };

  const sportConds = sport ? SPORT_CONDITIONS[sport] || [] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3"><span className="light-green"/>Greenlights</h1>
          <p className="text-sm text-slate-muted mt-0.5">Build brackets. Set conditions. We execute when they hit.</p>
        </div>
        {!building && <button onClick={() => setBuilding(true)} className="btn-green text-xs">+ Build Bracket</button>}
      </div>

      {/* BUILDER */}
      {building && (
        <div className="gl-card-static overflow-hidden">
          <div className="flex">{[1,2,3].map(s => <div key={s} className={`flex-1 h-1.5 transition-all ${step>=s?"bg-green-glow":"bg-slate-border"}`}/>)}</div>
          <div className="p-6 sm:p-8">

            {/* Step 1: Who + Sport */}
            {step === 1 && (
              <div className="anim-slide" style={{opacity:0}}>
                <div className="flex justify-between mb-6">
                  <div><h3 className="font-display text-xl font-bold text-white">Who are you betting on?</h3><p className="text-sm text-slate-muted mt-1">Search any team, player, or fighter</p></div>
                  <button onClick={reset} className="text-slate-muted hover:text-white">✕</button>
                </div>
                <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="e.g., Dodgers, Tommy Paul, Panthers, Topuria..." className="text-base mb-6" autoFocus />
                {subjectName && (
                  <>
                    <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-3">What sport?</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                      {SPORT_LIST.map(s => (
                        <button key={s} onClick={() => setSport(s)} className={`py-3 rounded-xl text-sm font-medium transition-all border ${sport===s?"bg-green-subtle border-green-muted text-green-glow":"bg-bg-secondary border-slate-border text-slate-muted hover:text-white hover:border-slate-divider"}`}>{s}</button>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => setStep(2)} disabled={!subjectName || !sport} className="btn-green disabled:opacity-30">Next: Set conditions →</button>
              </div>
            )}

            {/* Step 2: Conditions */}
            {step === 2 && (
              <div className="anim-slide" style={{opacity:0}}>
                <div className="flex justify-between mb-6">
                  <div><p className="text-sm text-slate-muted">Conditions for</p><h3 className="font-display text-xl font-bold text-white">{subjectName} <span className="text-slate-muted font-normal text-base">· {sport}</span></h3></div>
                  <div className="flex gap-2"><button onClick={() => {setStep(1);setConds([]);}} className="btn-ghost text-xs">← Back</button><button onClick={reset} className="text-slate-muted hover:text-white">✕</button></div>
                </div>
                <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-4">When should we greenlight? Tap to select.</p>
                <div className="space-y-4 mb-5">
                  {sportConds.map(g => (
                    <div key={g.label}>
                      <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-2">{g.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {g.options.map(c => (
                          <button key={c} onClick={() => toggle(c)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${conds.includes(c)?"bg-green-subtle border-green-muted text-green-glow":"bg-bg-secondary border-slate-border text-slate-muted hover:text-white"}`}>
                            {conds.includes(c) && "✓ "}{c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-5">
                  <input type="text" value={customCond} onChange={e => setCustomCond(e.target.value)} onKeyDown={e => e.key==="Enter"&&addCustom()} placeholder="Add a custom condition..." className="text-sm flex-1"/>
                  <button onClick={addCustom} className="btn-ghost text-xs px-4">Add</button>
                </div>
                {conds.length > 0 && (
                  <div className="bg-bg-secondary rounded-xl p-4 mb-5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-2">Your conditions ({conds.length})</p>
                    <div className="flex flex-wrap gap-2">{conds.map((c,i) => <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-subtle border border-green-muted" style={{color:"#00FF88"}}>{c}<button onClick={() => toggle(c)} className="opacity-50 hover:opacity-100">×</button></span>)}</div>
                  </div>
                )}
                <button onClick={() => setStep(3)} disabled={conds.length===0} className="btn-green disabled:opacity-30">Next: Set action →</button>
              </div>
            )}

            {/* Step 3: Action */}
            {step === 3 && (
              <div className="anim-slide" style={{opacity:0}}>
                <div className="flex justify-between mb-6">
                  <div><p className="text-sm text-slate-muted">{subjectName} · {conds.length} conditions</p><h3 className="font-display text-xl font-bold text-white">What happens when it hits?</h3></div>
                  <div className="flex gap-2"><button onClick={() => setStep(2)} className="btn-ghost text-xs">← Back</button><button onClick={reset} className="text-slate-muted hover:text-white">✕</button></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => setAction("notify")} className={`p-5 rounded-xl text-left border transition-all ${action==="notify"?"bg-blue-900/15 border-blue-500/30":"bg-bg-secondary border-slate-border"}`}>
                    <div className="text-2xl mb-2">🔔</div><p className={`text-sm font-bold ${action==="notify"?"text-blue-400":"text-white"}`}>Notify Me</p><p className="text-[11px] text-slate-muted mt-1">Alert when conditions are met. You decide.</p>
                  </button>
                  <button onClick={() => setAction("auto-bet")} className={`p-5 rounded-xl text-left border transition-all ${action==="auto-bet"?"bg-green-subtle border-green-muted":"bg-bg-secondary border-slate-border"}`}>
                    <div className="text-2xl mb-2">⚡</div><p className={`text-sm font-bold ${action==="auto-bet"?"text-green-glow":"text-white"}`}>Auto-Bet</p><p className="text-[11px] text-slate-muted mt-1">Automatically place the trade when conditions hit.</p>
                  </button>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Position</p>
                  <div className="flex gap-2">
                    <button onClick={() => setSide("yes")} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${side==="yes"?"bg-green-glow text-black":"bg-bg-secondary border border-slate-border text-slate-muted"}`}>YES — they win</button>
                    <button onClick={() => setSide("no")} className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${side==="no"?"bg-red-glow text-white":"bg-bg-secondary border border-slate-border text-slate-muted"}`}>NO — they lose</button>
                  </div>
                </div>
                {action === "auto-bet" && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Bet amount per trigger</p>
                    <div className="flex gap-2 mb-2">{[5,10,25,50,100].map(a => <button key={a} onClick={() => setAmount(a)} className={`flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-all ${amount===a?"bg-green-subtle border border-green-muted text-green-glow":"bg-bg-secondary border border-slate-border text-slate-muted"}`}>${a}</button>)}</div>
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={1} className="text-sm w-32 font-mono mt-1" placeholder="Custom"/>
                  </div>
                )}
                <div className="bg-bg-secondary rounded-xl p-5 mb-6 border border-slate-border">
                  <p className="text-[10px] uppercase tracking-widest text-slate-muted mb-3">Greenlight Summary</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm"><span className="text-slate-muted">Subject</span><span className="text-white font-medium">{subjectName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-muted">Sport</span><span className="text-white">{sport}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-muted">Conditions</span><span className="text-white">{conds.length} rules</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-muted">Action</span><span className={action==="auto-bet"?"text-green-glow":"text-blue-400"}>{action==="auto-bet"?`⚡ Auto-bet $${amount}`:"🔔 Notify"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-muted">Side</span><span className={`font-mono font-bold ${side==="yes"?"text-green-glow":"text-red-glow"}`}>{side.toUpperCase()}</span></div>
                  </div>
                </div>
                <button onClick={create} className="btn-green w-full py-3.5 text-sm font-bold">🚦 Create Greenlight</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active list */}
      {gls.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white">Active Greenlights</h2>
          {gls.map(gl => (
            <div key={gl.id} className="gl-card-static p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1"><div className={gl.status==="active"?"light-green anim-pulse":"light-red"} style={{width:10,height:10}}/></div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">{gl.subject} <span className="text-slate-muted font-normal text-sm">· {gl.sport}</span></h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">{gl.conditions.map((c,i) => <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-bg-secondary border border-slate-border text-slate-text">{c}</span>)}</div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-xs font-medium ${gl.action==="auto-bet"?"text-green-glow":"text-blue-400"}`}>{gl.action==="auto-bet"?`⚡ $${gl.amount}`:"🔔 Notify"}</span>
                      <span className={`text-xs font-mono font-bold ${gl.side==="yes"?"text-green-glow":"text-red-glow"}`}>{gl.side.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div onClick={() => setGls(gls.map(g => g.id===gl.id?{...g,status:g.status==="active"?"paused":"active"}:g))} className={`toggle-track ${gl.status==="active"?"on":""}`}><div className="toggle-thumb"/></div>
                  <button onClick={() => setGls(gls.filter(g => g.id!==gl.id))} className="text-slate-muted hover:text-red-glow transition-colors text-sm p-1">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!building && gls.length === 0 && (
        <div className="gl-card-static p-12 text-center">
          <div className="text-5xl mb-4">🚦</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Build Your First Bracket</h3>
          <p className="text-sm text-slate-muted max-w-md mx-auto mb-6">Search any team, player, or fighter. Set the conditions you care about. Choose notify or auto-bet. When everything lines up — Greenlight goes.</p>
          <button onClick={() => setBuilding(true)} className="btn-green text-sm py-3 px-8">+ Build Bracket</button>
        </div>
      )}
    </div>
  );
}
