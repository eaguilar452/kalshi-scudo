export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-sm text-green-glow hover:underline mb-8 inline-block">← Back to Greenlight</a>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-muted mb-8">Last updated: April 2026</p>
        <div className="space-y-6 text-sm text-slate-text leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">Information We Collect</h2>
            <p>We collect your email address and password (hashed) for account creation. If you connect your Kalshi account, we store your API Key ID and encrypted RSA private key. We collect usage data including pages visited, features used, and brackets created. We do not collect financial information — all funds are held by Kalshi.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">How We Use Your Information</h2>
            <p>Your email is used for account authentication and notifications you opt into. Your Kalshi API credentials are used solely to execute trades on your behalf through the Kalshi exchange. Usage data helps us improve the product. We never sell your personal information to third parties.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">Data Security</h2>
            <p>API credentials are encrypted at rest and transmitted over HTTPS. We use Supabase for authentication with industry-standard security practices. Your Kalshi private key is used server-side only and never exposed to the browser or stored in plain text.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Upon account deletion, all personal data including API credentials are permanently removed within 30 days. Usage analytics may be retained in anonymized form.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">Third-Party Services</h2>
            <p>Greenlight integrates with Kalshi (trade execution), Supabase (authentication and data storage), and Vercel (hosting). Each service has its own privacy policy. We do not share your data with advertisers or data brokers.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">Your Rights</h2>
            <p>You may request a copy of your data, correction of inaccurate data, or deletion of your account at any time. Contact support@greenlight.app for data requests.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">Contact</h2>
            <p>For privacy concerns, contact us at privacy@greenlight.app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
