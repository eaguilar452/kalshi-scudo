"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setMessage(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard"); router.refresh();
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,255,136,0.4) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle, rgba(0,255,136,0.4), transparent 70%)" }} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle, rgba(0,191,255,0.3), transparent 70%)" }} />

      {/* Left — value prop */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-bg-card border border-slate-border flex items-center justify-center"><div className="light-green" /></div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">Greenlight</span>
          </div>
          <h1 className="font-display text-[56px] font-extrabold text-white leading-[1.05] mb-6">
            Build your<br />bracket.<br /><span style={{ color: "#00FF88" }}>We handle<br />the rest.</span>
          </h1>
          <p className="text-slate-text text-lg max-w-lg leading-relaxed mb-10">
            Set your conditions for any sporting event. When they line up, Greenlight automatically places the trade on Kalshi — the only federally regulated prediction market.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="light-green" style={{ width: 8, height: 8 }} />
              <span className="text-sm text-slate-text">Auto-bet when conditions hit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="light-green" style={{ width: 8, height: 8 }} />
              <span className="text-sm text-slate-text">Sports markets only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="light-green" style={{ width: 8, height: 8 }} />
              <span className="text-sm text-slate-text">CFTC regulated</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <p className="text-slate-muted text-xs">Powered by Kalshi</p>
          <span className="text-slate-border">|</span>
          <p className="text-slate-muted text-xs">14-day free trial, then $14.99/mo</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg-card border border-slate-border flex items-center justify-center"><div className="light-green" /></div>
              <span className="font-display text-2xl font-bold text-white">Greenlight</span>
            </div>
            <p className="text-sm text-slate-muted">Automated sports prediction trading</p>
          </div>
          <div className="gl-card-static p-8">
            <h2 className="font-display text-xl font-bold text-white mb-1">{isSignUp ? "Start your free trial" : "Welcome back"}</h2>
            <p className="text-sm text-slate-muted mb-6">{isSignUp ? "14 days free. No card required." : "Sign in to your dashboard."}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div><label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} /></div>
              {error && <div className="text-red-glow text-sm bg-red-subtle border border-red-muted rounded-lg px-4 py-3">{error}</div>}
              {message && <div style={{ color: "#00FF88" }} className="text-sm bg-green-subtle border border-green-muted rounded-lg px-4 py-3">{message}</div>}
              <button type="submit" disabled={loading} className="btn-green w-full py-3 disabled:opacity-50">{loading ? "..." : isSignUp ? "Start Free Trial" : "Sign In"}</button>
            </form>
            <div className="mt-5 text-center space-y-2">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="text-sm transition-opacity hover:opacity-80" style={{ color: "#00E67A" }}>
                {isSignUp ? "Already have an account? Sign in" : "New here? Start your free trial"}
              </button>
              {!isSignUp && (
                <div><a href="/forgot-password" className="text-xs text-slate-muted hover:text-white transition-colors">Forgot your password?</a></div>
              )}
            </div>
          </div>
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <a href="/terms" className="text-[11px] text-slate-muted hover:text-white transition-colors">Terms of Service</a>
              <span className="text-slate-border">·</span>
              <a href="/privacy" className="text-[11px] text-slate-muted hover:text-white transition-colors">Privacy Policy</a>
            </div>
            <p className="text-[10px] text-slate-muted leading-relaxed max-w-sm mx-auto">Trading involves risk. You may lose your entire investment. Greenlight is not a sportsbook — all trades execute on Kalshi, a CFTC-regulated exchange.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
