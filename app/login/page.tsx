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
        setMessage("Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard"); router.refresh();
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,255,136,0.3) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(0,255,136,0.3), transparent 70%)" }} />

      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-bg-card border border-slate-border flex items-center justify-center"><div className="light-green" /></div>
            <span className="font-display text-xl font-bold text-white tracking-tight">Greenlight</span>
          </div>
          <h1 className="font-display text-6xl font-extrabold text-white leading-[1.05] mb-6">
            Set your<br />conditions.<br /><span style={{ color: "#00FF88" }}>Greenlight it.</span>
          </h1>
          <p className="text-slate-text text-lg max-w-md leading-relaxed">Automated prediction market trading on Kalshi. Define triggers, fund your account, let Greenlight execute.</p>
          <div className="flex flex-wrap gap-3 mt-10">
            {["Auto-bet", "Condition alerts", "Live markets", "P&L tracking"].map(f => (
              <span key={f} className="px-4 py-2 rounded-full text-xs font-medium bg-bg-card border border-slate-border text-slate-text">{f}</span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-slate-muted text-xs">Powered by Kalshi &middot; CFTC-regulated</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-bg-card border border-slate-border flex items-center justify-center"><div className="light-green" /></div>
              <span className="font-display text-2xl font-bold text-white">Greenlight</span>
            </div>
          </div>
          <div className="gl-card p-8">
            <h2 className="font-display text-xl font-bold text-white mb-1">{isSignUp ? "Create account" : "Sign in"}</h2>
            <p className="text-sm text-slate-muted mb-6">{isSignUp ? "Start trading prediction markets." : "Welcome back."}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div><label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} /></div>
              {error && <div className="text-red-glow text-sm bg-red-subtle border border-red-muted rounded-lg px-4 py-3">{error}</div>}
              {message && <div style={{ color: "#00FF88" }} className="text-sm bg-green-subtle border border-green-muted rounded-lg px-4 py-3">{message}</div>}
              <button type="submit" disabled={loading} className="btn-green w-full py-3 disabled:opacity-50">{loading ? "..." : isSignUp ? "Create Account" : "Sign In"}</button>
            </form>
            <div className="mt-5 text-center">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#00E67A" }}>
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
