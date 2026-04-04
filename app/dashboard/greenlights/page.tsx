"use client";
import { useState } from "react";

interface GL { id: string; name: string; conditions: string[]; action: "notify" | "auto-bet"; side: "yes" | "no"; amount: number; status: "active" | "paused"; }

export default function GreenlightsPage() {
  const [gls, setGls] = useState<GL[]>([
    { id: "1", name: "Dodgers Home Game", conditions: ["Dodgers playing at home", "Starting pitcher ERA < 3.5"], action: "auto-bet", side: "yes", amount: 10, status: "active" },
    { id: "2", name: "Tommy Paul Match", conditions: ["Tommy Paul in ATP match", "Opponent ranked below #30"], action: "notify", side: "yes", amount: 25, status: "active" },
  ]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [cond, setCond] = useState("");
  const [conds, setConds] = useState<string[]>([]);
  const [action, setAction] = useState<"notify" | "auto-bet">("notify");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amt, setAmt] = useState(10);

  const addCond = () => { if (cond.trim()) { setConds([...conds, cond.trim()]); setCond(""); } };
  const create = () => {
    if (!name || conds.length === 0) return;
    setGls([{ id: Date.now().toString(), name, conditions: conds, action, side, amount: amt, status: "active" }, ...gls]);
    setShow(false); setName(""); setConds([]); setAction("notify"); setSide("yes"); setAmt(10);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3"><span className="light-green" />Greenlights</h1>
          <p className="mt-1 text-sm text-slate-muted">Set conditions. When met, we notify you or auto-bet.</p>
        </div>
        <button onClick={() => setShow(!show)} className="btn-green text-xs">+ New Greenlight</button>
      </div>

      {show && (
        <div className="gl-card p-6 border-green-muted anim-slide" style={{ opacity: 0 }}>
          <h3 className="font-display text-lg font-bold text-white mb-4">Create Greenlight</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Dodgers Home Game" className="text-sm" /></div>
            <div>
              <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Conditions</label>
              <div className="flex gap-2"><input type="text" value={cond} onChange={e => setCond(e.target.value)} onKeyDown={e => e.key === "Enter" && addCond()} placeholder="e.g., Dodgers playing at home" className="text-sm flex-1" /><button onClick={addCond} className="btn-ghost text-xs px-4">Add</button></div>
              {conds.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{conds.map((c, i) => <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-subtle border border-green-muted text-xs" style={{ color: "#00FF88" }}>{c}<button onClick={() => setConds(conds.filter((_, j) => j !== i))} className="ml-1 opacity-50 hover:opacity-100">×</button></span>)}</div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">When triggered</label>
                <div className="flex gap-2">
                  <button onClick={() => setAction("notify")} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${action === "notify" ? "bg-blue-900/20 border border-blue-500/30 text-blue-400" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>Notify Me</button>
                  <button onClick={() => setAction("auto-bet")} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${action === "auto-bet" ? "bg-green-subtle border border-green-muted text-green-glow" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>Auto-Bet</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Position</label>
                <div className="flex gap-2">
                  <button onClick={() => setSide("yes")} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${side === "yes" ? "bg-green-subtle border border-green-muted text-green-glow" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>Yes</button>
                  <button onClick={() => setSide("no")} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${side === "no" ? "bg-red-subtle border border-red-muted text-red-glow" : "bg-bg-secondary border border-slate-border text-slate-muted"}`}>No</button>
                </div>
              </div>
            </div>
            {action === "auto-bet" && <div><label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Bet Amount ($)</label><input type="number" value={amt} onChange={e => setAmt(Number(e.target.value))} min={1} className="text-sm w-32" /></div>}
            <div className="flex gap-3 pt-2"><button onClick={create} className="btn-green">Create Greenlight</button><button onClick={() => setShow(false)} className="btn-ghost">Cancel</button></div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {gls.map(gl => (
          <div key={gl.id} className="gl-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1"><div className={gl.status === "active" ? "light-green anim-pulse" : "light-red"} style={{ width: 10, height: 10 }} /></div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">{gl.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">{gl.conditions.map((c, i) => <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-bg-secondary border border-slate-border text-slate-text">{c}</span>)}</div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`text-xs font-medium ${gl.action === "auto-bet" ? "text-green-glow" : "text-blue-400"}`}>{gl.action === "auto-bet" ? "⚡ Auto-bet" : "🔔 Notify"}</span>
                    <span className={`text-xs font-mono font-bold ${gl.side === "yes" ? "text-green-glow" : "text-red-glow"}`}>{gl.side.toUpperCase()}</span>
                    {gl.action === "auto-bet" && <span className="text-xs font-mono text-slate-text">${gl.amount}</span>}
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

      {gls.length === 0 && (
        <div className="gl-card p-10 text-center">
          <div className="light-yellow mx-auto mb-4" style={{ width: 16, height: 16 }} />
          <h3 className="font-display text-lg font-bold text-white mb-2">No Greenlights Yet</h3>
          <p className="text-sm text-slate-muted max-w-sm mx-auto mb-4">Create your first greenlight to start.</p>
          <button onClick={() => setShow(true)} className="btn-green text-xs">+ New Greenlight</button>
        </div>
      )}
    </div>
  );
}
