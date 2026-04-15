export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-sm text-green-glow hover:underline mb-8 inline-block">← Back to Greenlight</a>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-muted mb-8">Last updated: April 2026</p>
        <div className="space-y-6 text-sm text-slate-text leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">1. Service Description</h2>
            <p>Greenlight is a third-party trading automation tool that connects to Kalshi, a CFTC-regulated prediction market exchange. Greenlight does not hold, custody, or manage user funds. All trades are executed directly on the Kalshi exchange using your Kalshi account credentials.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">2. Not Financial Advice</h2>
            <p>Greenlight does not provide financial, investment, or trading advice. Featured brackets, condition templates, and win rate estimates are for informational purposes only and do not guarantee future results. All trading involves risk, and you may lose your entire investment. Past performance does not predict future results.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">3. Eligibility</h2>
            <p>You must be at least 18 years old and a legal resident of a jurisdiction where prediction market trading is permitted. You must have a valid, verified Kalshi account to use trading features. You are responsible for compliance with all applicable laws in your jurisdiction.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">4. Account Security</h2>
            <p>You are responsible for maintaining the security of your Greenlight account credentials and your Kalshi API keys. Greenlight uses your API credentials solely to execute trades on your behalf as configured through the Greenlights (bracket conditions) feature. Never share your credentials with third parties.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">5. Auto-Bet Disclaimer</h2>
            <p>The auto-bet feature executes trades automatically when user-defined conditions are met. By enabling auto-bet, you acknowledge that trades will be placed without manual confirmation and that you accept full responsibility for the outcomes. You may disable auto-bet at any time.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">6. Fees and Subscription</h2>
            <p>Greenlight offers a 14-day free trial followed by a monthly subscription of $14.99/month. Kalshi may charge separate trading fees on executed trades. Greenlight does not charge per-trade fees. You may cancel your subscription at any time.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">7. Limitation of Liability</h2>
            <p>Greenlight is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for trading losses, missed trades due to technical issues, Kalshi platform downtime, or any other damages arising from your use of the service. Our total liability is limited to the subscription fees you have paid in the preceding 12 months.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">8. Termination</h2>
            <p>We may suspend or terminate your access to Greenlight at any time for violation of these terms. You may delete your account at any time through Settings. Upon termination, all active Greenlights will be deactivated and no further auto-bets will be placed.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-white mb-2">9. Contact</h2>
            <p>For questions about these terms, contact us at support@greenlight.app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
