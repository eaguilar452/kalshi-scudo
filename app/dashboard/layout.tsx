import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <DashboardNav email={user.email || ""} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">{children}</main>
      <footer className="border-t border-slate-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-muted">© 2026 Greenlight. Not financial advice. All trades executed on Kalshi.</p>
          <div className="flex items-center gap-4">
            <a href="/terms" className="text-[11px] text-slate-muted hover:text-white transition-colors">Terms</a>
            <a href="/privacy" className="text-[11px] text-slate-muted hover:text-white transition-colors">Privacy</a>
            <a href="/dashboard/settings" className="text-[11px] text-slate-muted hover:text-white transition-colors">Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
