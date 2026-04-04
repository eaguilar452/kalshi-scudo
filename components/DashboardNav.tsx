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
    { label: "Markets", href: "/dashboard", icon: "◉" },
    { label: "Greenlights", href: "/dashboard/greenlights", icon: "●" },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: "◆" },
  ];

  return (
    <nav className="border-b border-slate-border bg-bg-secondary/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bg-card border border-slate-border flex items-center justify-center">
              <div className="light-green" style={{ width: 8, height: 8 }} />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">Greenlight</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <a key={n.href} href={n.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === n.href ? "text-green-glow bg-green-subtle" : "text-slate-text hover:text-white hover:bg-bg-hover"}`}>
                <span className={`text-xs ${pathname === n.href ? "text-green-glow" : "text-slate-muted"}`}>{n.icon}</span>{n.label}
              </a>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-sm text-slate-text hover:text-white transition-colors">
              <div className="w-7 h-7 rounded-full bg-green-muted border border-green-bright/30 flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: "#00E67A" }}>{email.charAt(0).toUpperCase()}</span>
              </div>
              <span className="hidden sm:inline text-xs">{email}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 gl-card p-1 shadow-xl z-50">
                <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-slate-text hover:text-red-glow hover:bg-red-subtle rounded-lg transition-colors">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden border-t border-slate-border flex">
        {nav.map(n => (
          <a key={n.href} href={n.href} className={`flex-1 text-center py-3 text-xs font-medium transition-all ${pathname === n.href ? "text-green-glow border-b-2 border-green-glow" : "text-slate-muted"}`}>{n.label}</a>
        ))}
      </div>
    </nav>
  );
}
