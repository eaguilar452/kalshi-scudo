"use client";

import { useState } from "react";

interface Greenlight {
  id: string;
  name: string;
  conditions: string[];
  action: "notify" | "auto-bet";
  side: "yes" | "no";
  amount: number;
  status: "active" | "paused" | "triggered";
  createdAt: string;
}

export default function GreenlightsPage() {
  const [greenlights, setGreenlights] = useState<Greenlight[]>([
    // Example presets to show the UI
    {
      id: "1",
      name: "Dodgers Home Game",
      conditions: ["Dodgers playing at home", "Starting pitcher ERA < 3.5"],
      action: "auto-bet",
      side: "yes",
      amount: 10,
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Tommy Paul Match",
      conditions: ["Tommy Paul in ATP match", "Opponent ranked below #30"],
      action: "notify",
      side: "yes",
      amount: 25,
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newConditions, setNewConditions] = useState<string[]>([]);
  const [newAction, setNewAction] = useState<"notify" | "auto-bet">("notify");
  const [newSide, setNewSide] = useState<"yes" | "no">("yes");
  const [newAmount, setNewAmount] = useState(10);

  const addCondition = () => {
    if (newCondition.trim()) {
      setNewConditions([...newConditions, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const removeCondition = (idx: number) => {
    setNewConditions(newConditions.filter((_, i) => i !== idx));
  };

  const createGreenlight = () => {
    if (!newName || newConditions.length === 0) return;

    const gl: Greenlight = {
      id: Date.now().toString(),
      name: newName,
      conditions: newConditions,
      action: newAction,
      side: newSide,
      amount: newAmount,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setGreenlights([gl, ...greenlights]);
    setShowCreate(false);
    setNewName("");
    setNewConditions([]);
    setNewAction("notify");
    setNewSide("yes");
    setNewAmount(10);
  };

  const toggleStatus = (id: string) => {
    setGreenlights(
      greenlights.map((gl) =>
        gl.id === id
          ? { ...gl, status: gl.status === "active" ? "paused" : "active" }
          : gl
      )
    );
  };

  const deleteGreenlight = (id: string) => {
    setGreenlights(greenlights.filter((gl) => gl.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <span className="light-green" />
            Greenlights
          </h1>
          <p className="mt-1 text-sm text-slate-muted">
            Set conditions. When they&apos;re met, we notify you or auto-bet.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-green text-xs"
        >
          + New Greenlight
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="gl-card p-6 border-green-muted animate-slide-up" style={{ opacity: 0 }}>
          <h3 className="font-display text-lg font-bold text-white mb-4">
            Create Greenlight
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Dodgers Home Game"
                className="text-sm"
              />
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                Conditions
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCondition()}
                  placeholder="e.g., Dodgers playing at home"
                  className="text-sm flex-1"
                />
                <button onClick={addCondition} className="btn-ghost text-xs px-4">
                  Add
                </button>
              </div>
              {newConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {newConditions.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-green-subtle border border-green-muted text-green-glow text-xs"
                    >
                      {c}
                      <button
                        onClick={() => removeCondition(i)}
                        className="text-green-glow/50 hover:text-red-glow ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                  When triggered
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewAction("notify")}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      newAction === "notify"
                        ? "bg-electric/10 border border-electric/30 text-electric"
                        : "bg-bg-secondary border border-slate-border text-slate-muted"
                    }`}
                  >
                    🔔 Notify Me
                  </button>
                  <button
                    onClick={() => setNewAction("auto-bet")}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      newAction === "auto-bet"
                        ? "bg-green-subtle border border-green-muted text-green-glow"
                        : "bg-bg-secondary border border-slate-border text-slate-muted"
                    }`}
                  >
                    ⚡ Auto-Bet
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                  Position
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSide("yes")}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      newSide === "yes"
                        ? "bg-green-subtle border border-green-muted text-green-glow"
                        : "bg-bg-secondary border border-slate-border text-slate-muted"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setNewSide("no")}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      newSide === "no"
                        ? "bg-red-subtle border border-red-muted text-red-glow"
                        : "bg-bg-secondary border border-slate-border text-slate-muted"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Amount */}
            {newAction === "auto-bet" && (
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">
                  Bet Amount ($)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  min={1}
                  className="text-sm w-32"
                />
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button onClick={createGreenlight} className="btn-green">
                Create Greenlight
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Greenlights list */}
      <div className="space-y-3">
        {greenlights.map((gl) => (
          <div key={gl.id} className="gl-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {/* Status light */}
                <div className="mt-1">
                  <div
                    className={
                      gl.status === "active"
                        ? "light-green animate-pulse-dot"
                        : gl.status === "triggered"
                        ? "light-yellow"
                        : "light-red"
                    }
                    style={{ width: "10px", height: "10px" }}
                  />
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    {gl.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {gl.conditions.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-pill text-[10px] font-medium bg-bg-secondary border border-slate-border text-slate-text"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span
                      className={`text-xs font-medium ${
                        gl.action === "auto-bet"
                          ? "text-green-glow"
                          : "text-electric"
                      }`}
                    >
                      {gl.action === "auto-bet" ? "⚡ Auto-bet" : "🔔 Notify"}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        gl.side === "yes" ? "text-green-glow" : "text-red-glow"
                      }`}
                    >
                      {gl.side.toUpperCase()}
                    </span>
                    {gl.action === "auto-bet" && (
                      <span className="text-xs font-mono text-slate-text">
                        ${gl.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div
                  onClick={() => toggleStatus(gl.id)}
                  className={`toggle-track ${gl.status === "active" ? "active" : ""}`}
                >
                  <div className="toggle-thumb" />
                </div>
                <button
                  onClick={() => deleteGreenlight(gl.id)}
                  className="text-slate-muted hover:text-red-glow transition-colors text-sm p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {greenlights.length === 0 && (
        <div className="gl-card p-10 text-center">
          <div className="light-yellow mx-auto mb-4" style={{ width: "16px", height: "16px" }} />
          <h3 className="font-display text-lg font-bold text-white mb-2">
            No Greenlights Yet
          </h3>
          <p className="text-sm text-slate-muted max-w-sm mx-auto mb-4">
            Create your first greenlight to start getting notified or auto-betting
            when your conditions are met.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-green text-xs">
            + New Greenlight
          </button>
        </div>
      )}
    </div>
  );
}
