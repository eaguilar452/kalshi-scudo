"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/settings`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-bg-card border border-slate-border flex items-center justify-center"><div className="light-green" /></div>
          <span className="font-display text-2xl font-bold text-white">Greenlight</span>
        </div>
        <div className="gl-card-static p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="font-display text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-sm text-slate-muted mb-6">We sent a password reset link to <strong className="text-white">{email}</strong></p>
              <a href="/login" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#00E67A" }}>← Back to sign in</a>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-white mb-1">Reset your password</h2>
              <p className="text-sm text-slate-muted mb-6">Enter your email and we&apos;ll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-text uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                {error && <div className="text-red-glow text-sm bg-red-subtle border border-red-muted rounded-lg px-4 py-3">{error}</div>}
                <button type="submit" disabled={loading} className="btn-green w-full py-3 disabled:opacity-50">{loading ? "Sending..." : "Send Reset Link"}</button>
              </form>
              <div className="mt-5 text-center">
                <a href="/login" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#00E67A" }}>← Back to sign in</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
