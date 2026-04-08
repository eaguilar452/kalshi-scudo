"use client";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardNav({ email }: { email: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const signOut = async () => { await supabase.auth.signOut(); router.push("/login"); router.refresh(); };

  const nav = [
    { label: "Home", href: "/dashboard" },
    { label: "Markets", href: "/dashboard/markets" },
    { label: "Greenlights", href: "/dashboard/greenlights" },
    { label: "Portfolio", href: "/dashboard/portfolio" },
  ];

  return (
    <nav className="border-b border-slate-border bg-bg-secondary/90 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <a href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bg-card border border-slate-border flex items-center justify-center"><div className="light-green" style={{ width: 7, height: 7 }} /></div>
            <span className="font-display text-lg font-bold text-white tracking-tight">Greenlight</span>
          </a>
          <div className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <a key={n.href} href={n.href} className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${pathname === n.href ? "text-green-glow bg-green-subtle" : "text-slate-muted hover:text-white hover:bg-bg-hover"}`}>{n.label}</a>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-sm text-slate-muted hover:text-white transition-colors">
              <div className="w-7 h-7 rounded-full bg-green-muted flex items-center justify-center"><span className="text-[11px] font-bold" style={{ color: "#00E67A" }}>{email.charAt(0).toUpperCase()}</span></div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 gl-card-static p-1.5 shadow-2xl z-50">
                <div className="px-3 py-2 text-xs text-slate-muted truncate border-b border-slate-border mb-1">{email}</div>
                <a href="/dashboard/settings" className="block px-3 py-2 text-sm text-slate-text hover:text-white hover:bg-bg-hover rounded-lg transition-colors">Settings</a>
                <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-slate-text hover:text-red-glow hover:bg-red-subtle rounded-lg transition-colors">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden border-t border-slate-border flex">
        {nav.map(n => (
          <a key={n.href} href={n.href} className={`flex-1 text-center py-3 text-[11px] font-medium ${pathname === n.href ? "text-green-glow border-b-2 border-green-glow" : "text-slate-muted"}`}>{n.label}</a>
        ))}
      </div>
    </nav>
  );
}
