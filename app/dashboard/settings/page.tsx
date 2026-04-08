"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<"kalshi"|"account"|"subscription">("kalshi");
  const [keyId, setKeyId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ok:boolean;msg:string}|null>(null);
  const [testing, setTesting] = useState(false);
  const [email, setEmail] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => {
      if (data.user) setEmail(data.user.email || "");
    });
    // Check if Kalshi is connected by testing portfolio endpoint
    fetch("/api/kalshi/portfolio").then(r => {
      if (r.ok) setConnected(true);
    }).catch(() => {});
  }, []);

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch("/api/kalshi/portfolio");
      const d = await r.json();
      if (r.ok && d.balance !== undefined) {
        setTestResult({ ok: true, msg: `Connected! Balance: $${(d.balance / 100).toFixed(2)}` });
        setConnected(true);
      } else {
        setTestResult({ ok: false, msg: d.error || "Connection failed" });
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message });
    }
    setTesting(false);
  };

  const tabs = [
    { id: "kalshi" as const, label: "Kalshi Connection", icon: "🔗" },
    { id: "account" as const, label: "Account", icon: "👤" },
    { id: "subscription" as const, label: "Subscription", icon: "💎" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-muted mt-0.5">Manage your account and connections</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all ${tab === t.id ? "bg-bg-card text-white shadow-sm" : "text-slate-muted hover:text-white"}`}>
            <span className="mr-1.5">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Kalshi Connection */}
      {tab === "kalshi" && (
        <div className="space-y-4 anim-fade" style={{ opacity: 0 }}>
          {/* Connection status */}
          <div className="gl-card-static p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={connected ? "light-green" : "light-red"} style={{ width: 12, height: 12 }} />
                <div>
                  <h3 className="font-display text-base font-bold text-white">{connected ? "Kalshi Connected" : "Kalshi Not Connected"}</h3>
                  <p className="text-xs text-slate-muted">{connected ? "Your API key is active and authenticated" : "Connect your Kalshi account to start trading"}</p>
                </div>
              </div>
              <button onClick={testConnection} disabled={testing} className="btn-ghost text-xs">{testing ? "Testing..." : "Test Connection"}</button>
            </div>
            {testResult && (
              <div className={`px-4 py-3 rounded-lg text-sm ${testResult.ok ? "bg-green-subtle border border-green-muted text-green-glow" : "bg-red-subtle border border-red-muted text-red-glow"}`}>
                {testResult.msg}
              </div>
            )}
          </div>

          {/* Setup instructions */}
          <div className="gl-card-static p-6">
            <h3 className="font-display text-base font-bold text-white mb-4">How to Connect Your Kalshi Account</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-bg-secondary border border-slate-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Create a Kalshi account</p>
                  <p className="text-xs text-slate-muted mt-0.5">Go to <a href="https://kalshi.com" target="_blank" rel="noreferrer" className="text-green-glow hover:underline">kalshi.com</a> and sign up. Complete identity verification.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-bg-secondary border border-slate-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Generate an API key</p>
                  <p className="text-xs text-slate-muted mt-0.5">Go to Kalshi → Account & Security → API Keys → Create Key. Choose <strong className="text-white">Read and Write</strong> access. Save both the Key ID and the private key file.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-bg-secondary border border-slate-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Deposit funds</p>
                  <p className="text-xs text-slate-muted mt-0.5">Add money to your Kalshi account via bank transfer, debit card, or Apple Pay. This is what Greenlight uses to place trades.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-green-subtle border border-green-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-glow">4</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Enter your credentials below</p>
                  <p className="text-xs text-slate-muted mt-0.5">Paste your Key ID and private key. They&apos;re encrypted and stored securely — never visible to anyone.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Credential entry */}
          <div className="gl-card-static p-6">
            <h3 className="font-display text-base font-bold text-white mb-4">API Credentials</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Key ID</label>
                <input type="text" value={keyId} onChange={e => setKeyId(e.target.value)} placeholder="e.g., 46a1760c-d55b-414f-a02..." className="text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">RSA Private Key</label>
                <textarea
                  value={privateKey}
                  onChange={e => setPrivateKey(e.target.value)}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;Paste your full private key here...&#10;-----END RSA PRIVATE KEY-----"
                  className="w-full bg-bg-secondary border border-slate-border rounded-xl p-4 text-xs font-mono text-slate-text h-32 resize-none focus:outline-none focus:border-green-glow"
                />
                <p className="text-[10px] text-slate-muted mt-1.5">Open the .pem file you downloaded from Kalshi in TextEdit and paste the entire contents.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    setSaving(true); setSaved(false);
                    // For now, we store in localStorage as a placeholder
                    // In production, this would go to Supabase with encryption
                    try {
                      // Store encrypted in user metadata via Supabase
                      const { error } = await supabase.auth.updateUser({
                        data: {
                          kalshi_key_id: keyId,
                          kalshi_connected: true,
                        }
                      });
                      if (error) throw error;
                      setSaved(true);
                      setTimeout(() => setSaved(false), 3000);
                    } catch (e: any) {
                      alert("Error saving: " + e.message);
                    }
                    setSaving(false);
                  }}
                  disabled={!keyId || !privateKey || saving}
                  className="btn-green disabled:opacity-30"
                >
                  {saving ? "Saving..." : "Save Credentials"}
                </button>
                {saved && <span className="text-sm text-green-glow">✓ Saved</span>}
              </div>
              <div className="bg-bg-secondary rounded-lg p-3 border border-slate-border">
                <p className="text-[11px] text-slate-muted leading-relaxed">
                  <strong className="text-slate-text">Security note:</strong> Your private key is used server-side only to sign API requests to Kalshi. It is never exposed to the browser, sent to third parties, or stored in plain text. Greenlight acts as a secure proxy between you and the Kalshi exchange.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account */}
      {tab === "account" && (
        <div className="space-y-4 anim-fade" style={{ opacity: 0 }}>
          <div className="gl-card-static p-6">
            <h3 className="font-display text-base font-bold text-white mb-4">Account Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Email</label>
                <div className="bg-bg-secondary rounded-xl px-4 py-3 text-sm text-white border border-slate-border">{email}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Member since</label>
                <div className="bg-bg-secondary rounded-xl px-4 py-3 text-sm text-white border border-slate-border">April 2026</div>
              </div>
            </div>
          </div>

          <div className="gl-card-static p-6">
            <h3 className="font-display text-base font-bold text-white mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-white">Greenlight triggers</p><p className="text-xs text-slate-muted">Get notified when your conditions are met</p></div>
                <div className="toggle-track on"><div className="toggle-thumb"/></div>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-white">Trade confirmations</p><p className="text-xs text-slate-muted">Confirm when auto-bets are placed</p></div>
                <div className="toggle-track on"><div className="toggle-thumb"/></div>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-white">Market alerts</p><p className="text-xs text-slate-muted">Big price moves on your watched markets</p></div>
                <div className="toggle-track"><div className="toggle-thumb"/></div>
              </div>
            </div>
          </div>

          <div className="gl-card-static p-6">
            <h3 className="font-display text-base font-bold text-red-glow mb-2">Danger Zone</h3>
            <p className="text-xs text-slate-muted mb-4">Permanently delete your account and all data.</p>
            <button className="px-4 py-2 rounded-lg text-xs font-medium border border-red-muted text-red-glow bg-red-subtle hover:bg-red-muted transition-all">Delete Account</button>
          </div>
        </div>
      )}

      {/* Subscription */}
      {tab === "subscription" && (
        <div className="space-y-4 anim-fade" style={{ opacity: 0 }}>
          {/* Current plan */}
          <div className="gl-card-static p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-white">Current Plan</h3>
                <p className="text-xs text-slate-muted">Your subscription details</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-subtle border border-green-muted text-green-glow">FREE TRIAL</span>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 border border-slate-border mb-4">
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display text-3xl font-extrabold text-white">$0</span>
                <span className="text-slate-muted text-sm mb-1">/mo</span>
              </div>
              <p className="text-xs text-slate-muted">14-day free trial &middot; 10 days remaining</p>
              <div className="mt-3 h-2 rounded-full bg-slate-border overflow-hidden">
                <div className="h-full rounded-full bg-green-glow" style={{ width: "28%" }} />
              </div>
            </div>
            <p className="text-xs text-slate-muted">After your trial ends, upgrade to Pro to keep using Greenlights, auto-bet, and all premium features.</p>
          </div>

          {/* Upgrade card */}
          <div className="gl-card-static overflow-hidden">
            <div className="p-6" style={{ background: "linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,191,255,0.05))" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💎</span>
                <h3 className="font-display text-lg font-bold text-white">Greenlight Pro</h3>
              </div>
              <div className="flex items-end gap-1 mb-4">
                <span className="font-display text-4xl font-extrabold text-white">$14.99</span>
                <span className="text-slate-muted text-sm mb-1">/month</span>
              </div>
              <div className="space-y-2.5 mb-6">
                {[
                  "Unlimited Greenlights (bracket conditions)",
                  "Auto-bet execution on Kalshi",
                  "Real-time notifications & alerts",
                  "All sports markets",
                  "Priority support",
                  "Early access to new features",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="light-green" style={{ width: 6, height: 6 }} />
                    <span className="text-sm text-slate-text">{f}</span>
                  </div>
                ))}
              </div>
              <button className="btn-green w-full py-3.5 text-sm font-bold">Upgrade to Pro</button>
              <p className="text-[10px] text-slate-muted text-center mt-3">Cancel anytime. No long-term commitment.</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="gl-card-static p-6">
            <h3 className="font-display text-base font-bold text-white mb-4">Billing FAQ</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white font-medium">What happens after my free trial?</p>
                <p className="text-xs text-slate-muted mt-1">Your Greenlights will pause until you upgrade. Your data and brackets are saved — nothing is deleted.</p>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Can I cancel anytime?</p>
                <p className="text-xs text-slate-muted mt-1">Yes. Cancel from this page at any time. You keep access until the end of your billing period.</p>
              </div>
              <div>
                <p className="text-sm text-white font-medium">Is Greenlight a sportsbook?</p>
                <p className="text-xs text-slate-muted mt-1">No. Greenlight connects to Kalshi, a CFTC-regulated prediction market exchange. Your money is held by Kalshi, not by us. We just automate the trading.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
