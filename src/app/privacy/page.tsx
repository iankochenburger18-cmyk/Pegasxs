export default function PrivacyPage() {
  const SERIF = '"Instrument Serif", Georgia, serif'
  const INTER = "Inter, -apple-system, sans-serif"

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#0b0b0b", marginBottom: 16, marginTop: 0 }}>
        {title}
      </h2>
      <div style={{ fontFamily: INTER, fontSize: 16, lineHeight: 1.75, color: "#3a3a3a" }}>
        {children}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f4", padding: "80px 24px 120px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <a href="/" style={{ fontFamily: INTER, fontSize: 13, color: "#888", textDecoration: "none", letterSpacing: "0.06em" }}>← pegasxs.com</a>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 52, color: "#0b0b0b", marginTop: 32, marginBottom: 8, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: INTER, fontSize: 14, color: "#888", margin: 0 }}>
            Pegasxs Studio — pegasxs.com · Last updated: June 2026
          </p>
        </div>

        <div style={{ width: 48, height: 1, background: "#ddd", marginBottom: 56 }} />

        {section("1. Controller", <p style={{ margin: 0 }}>The data controller responsible for processing your personal data is:<br /><br />Pegasxs Studio<br />Zurich, Switzerland<br /><a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a></p>)}

        {section("2. Legal Basis", <p style={{ margin: 0 }}>This Privacy Policy is based on the Swiss Federal Act on Data Protection (DSG/nDSG), effective September 1, 2023. Where users are located in the European Union or European Economic Area, the EU General Data Protection Regulation (GDPR) also applies. Processing of your data is based on your consent (Art. 6(1)(a) GDPR), the performance of a contract (Art. 6(1)(b) GDPR), and our legitimate interests (Art. 6(1)(f) GDPR) where applicable.</p>)}

        {section("3. Data We Collect", <>
          <p>We collect the following categories of personal data:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Account data:</strong> Email address, password (hashed), and display name provided at registration</li>
            <li><strong>Usage data:</strong> Video prompts you submit, renders you create, and timestamps of activity</li>
            <li><strong>Payment data:</strong> Billing information processed by Stripe Inc. — we do not store card numbers</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, and session data collected automatically</li>
            <li><strong>Communication data:</strong> Any messages you send us via email or support channels</li>
          </ul>
        </>)}

        {section("4. How We Use Your Data", <>
          <p>We process your data for the following purposes:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Providing and operating the Pegasxs service</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Sending transactional emails (account confirmation, receipts, service notices)</li>
            <li>Improving the quality and performance of our AI pipeline</li>
            <li>Complying with legal obligations</li>
            <li>Preventing fraud and abuse</li>
          </ul>
          <p style={{ margin: 0 }}>We do not use your data for advertising, and we do not sell your data to third parties under any circumstances.</p>
        </>)}

        {section("5. Third-Party Services", <>
          <p>We use the following third-party services that may process your personal data:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Supabase</strong> (database and authentication) — servers located in EU regions</li>
            <li><strong>Stripe Inc.</strong> (payment processing) — governed by Stripe's own Privacy Policy</li>
            <li><strong>Anthropic PBC</strong> (AI generation) — prompts you submit are sent to Anthropic's API</li>
            <li><strong>Vercel Inc.</strong> (web hosting) — serves the frontend application</li>
            <li><strong>Hetzner Online GmbH</strong> (server infrastructure) — VPS located in Helsinki, Finland (EU)</li>
          </ul>
          <p style={{ margin: 0 }}>Each provider is bound by data processing agreements and applicable data protection law.</p>
        </>)}

        {section("6. Data Retention", <>
          <p>We retain your personal data for as long as your account is active or as needed to provide the service.</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Account data is retained until you delete your account</li>
            <li>Generated videos are stored for as long as your subscription is active</li>
            <li>Payment records are retained for 10 years as required by Swiss accounting law</li>
            <li>Technical logs are retained for 30 days</li>
          </ul>
          <p style={{ margin: 0 }}>Upon account deletion, personal data is erased within 30 days, except where retention is required by law.</p>
        </>)}

        {section("7. Your Rights", <>
          <p>Under the Swiss DSG/nDSG and GDPR, you have the following rights:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Right to erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Right to restriction:</strong> Request that we limit how we use your data</li>
            <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time</li>
          </ul>
          <p style={{ margin: 0 }}>To exercise any of these rights, contact us at <a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a>. We will respond within 30 days.</p>
        </>)}

        {section("8. Cookies and Tracking", <>
          <p>Pegasxs uses essential cookies required for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics.</p>
          <p style={{ margin: 0 }}>You can disable cookies in your browser settings, but this may prevent the service from functioning correctly.</p>
        </>)}

        {section("9. Data Security", <p style={{ margin: 0 }}>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or destruction. These include encrypted connections (HTTPS), hashed password storage, and access controls. No system is completely secure — if you suspect a security incident, contact us immediately at <a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a>.</p>)}

        {section("10. International Data Transfers", <p style={{ margin: 0 }}>Some third-party providers we use (including Anthropic and Stripe) are based in the United States. Where data is transferred outside Switzerland or the EU/EEA, we ensure adequate protection through Standard Contractual Clauses or equivalent mechanisms recognised under Swiss and EU law.</p>)}

        {section("11. Children", <p style={{ margin: 0 }}>Pegasxs is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.</p>)}

        {section("12. Changes to This Policy", <p style={{ margin: 0 }}>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via a notice on the platform. The date at the top of this page reflects the most recent update. Continued use of the service after changes take effect constitutes acceptance of the updated policy.</p>)}

        {section("13. Complaints", <p style={{ margin: 0 }}>If you believe we have not handled your data correctly, you have the right to lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC) at <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" style={{ color: "#0b0b0b" }}>edoeb.admin.ch</a>, or with the supervisory authority in your EU member state if applicable.</p>)}

        {section("14. Contact", <p style={{ margin: 0 }}><a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a><br />pegasxs.com</p>)}

      </div>
    </div>
  )
}
