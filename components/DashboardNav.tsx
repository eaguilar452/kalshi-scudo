"use client";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardNav({ email }: { email: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const signOut = async () => { await supabase.auth.signOut(); router.push("/login"); router.refresh(); };

  useEffect(() => {
    fetch("/api/kalshi/portfolio").then(r => { if (r.ok) setConnected(true); }).catch(() => {});
  }, []);

  const nav = [
    { label: "Home", href: "/dashboard" },
    { label: "Markets", href: "/dashboard/markets" },
    { label: "Greenlights", href: "/dashboard/greenlights" },
    { label: "Portfolio", href: "/dashboard/portfolio" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-slate-border bg-bg-secondary/90 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[56px]">
          <a href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-bg-card border border-slate-border flex items-center justify-center group-hover:border-green-muted transition-colors">
              <div className="light-green" style={{ width: 7, height: 7 }} />
            </div>
            <span className="font-display text-[17px] font-bold text-white tracking-tight">Greenlight</span>
          </a>

          <div className="hidden md:flex items-center gap-0.5">
            {nav.map(n => (
              <a key={n.href} href={n.href} className={`px-3.5 py-[7px] rounded-lg text-[13px] font-medium transition-all ${isActive(n.href) ? "text-green-glow bg-green-subtle" : "text-slate-muted hover:text-white hover:bg-bg-hover"}`}>{n.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Connection badge */}
            {!connected && (
              <a href="/dashboard/settings" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-subtle border border-red-muted text-[10px] font-medium text-red-glow hover:bg-red-muted transition-colors">
                <div className="light-red" style={{ width: 5, height: 5 }}/>Not connected
              </a>
            )}
            {connected && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-subtle border border-green-muted text-[10px] font-medium text-green-glow">
                <div className="light-green anim-pulse" style={{ width: 5, height: 5 }}/>Kalshi
              </div>
            )}

            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-sm text-slate-muted hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-bg-card border border-slate-border flex items-center justify-center hover:border-slate-divider transition-colors">
                  <span className="text-[11px] font-bold text-slate-text">{email.charAt(0).toUpperCase()}</span>
                </div>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 gl-card-static p-1.5 shadow-2xl z-50 border border-slate-border">
                    <div className="px-3 py-2.5 text-xs text-slate-muted truncate border-b border-slate-border mb-1">{email}</div>
                    <a href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-text hover:text-white hover:bg-bg-hover rounded-lg transition-colors">
                      <span className="text-xs">⚙</span> Settings
                    </a>
                    <a href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-text hover:text-white hover:bg-bg-hover rounded-lg transition-colors">
                      <span className="text-xs">🔗</span> Kalshi Connection
                    </a>
                    <div className="border-t border-slate-border my-1" />
                    <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-text hover:text-red-glow hover:bg-red-subtle rounded-lg transition-colors">
                      <span className="text-xs">↩</span> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-slate-border flex">
        {nav.map(n => (
          <a key={n.href} href={n.href} className={`flex-1 text-center py-2.5 text-[10px] font-medium ${isActive(n.href) ? "text-green-glow border-b-2 border-green-glow" : "text-slate-muted"}`}>{n.label}</a>
        ))}
      </div>
    </nav>
  );
}
