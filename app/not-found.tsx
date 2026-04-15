import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚦</div>
        <h1 className="font-display text-4xl font-extrabold text-white mb-2">404</h1>
        <p className="text-slate-muted text-base mb-8">This page doesn&apos;t exist. Red light.</p>
        <Link href="/dashboard" className="btn-green text-sm py-3 px-8 inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
