export default function TermsPage() {
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
            Terms and Conditions
          </h1>
          <p style={{ fontFamily: INTER, fontSize: 14, color: "#888", margin: 0 }}>
            Pegasxs Studio — pegasxs.com · Last updated: June 2026
          </p>
        </div>

        <div style={{ width: 48, height: 1, background: "#ddd", marginBottom: 56 }} />

        {section("1. Provider", <p style={{ margin: 0 }}>Pegasxs Studio ("Pegasxs", "we", "us") is operated by Ian Kochenburger, Winterthur, Switzerland. Contact: <a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a></p>)}

        {section("2. Scope", <p style={{ margin: 0 }}>These Terms govern access to and use of the Pegasxs platform, including the web application at pegasxs.com and all associated services. By creating an account or using the service, you agree to these Terms.</p>)}

        {section("3. Service Description", <p style={{ margin: 0 }}>Pegasxs provides an AI-powered video generation service. Users submit text prompts and the platform generates short video files (MP4) using artificial intelligence. Generated videos are delivered digitally. Pegasxs does not guarantee specific creative outcomes — results depend on the content of the user's prompt.</p>)}

        {section("4. Account Registration", <p style={{ margin: 0 }}>Users must provide accurate information when registering. Accounts are personal and non-transferable. You are responsible for maintaining the confidentiality of your login credentials. Pegasxs reserves the right to suspend or terminate accounts that violate these Terms.</p>)}

        {section("5. Subscription and Payment", <>
          <p>Pegasxs offers paid subscription plans billed monthly. Pricing is displayed on pegasxs.com/pricing.</p>
          <p>Subscriptions renew automatically at the end of each billing period unless cancelled before the renewal date.</p>
          <p>Payments are processed by Stripe Inc. or another third-party payment processor. By subscribing, you authorise recurring charges to your chosen payment method.</p>
          <p>All prices are in USD and exclude applicable taxes unless stated otherwise.</p>
          <p style={{ margin: 0 }}>Free trial periods, where offered, automatically convert to paid subscriptions unless cancelled before the trial ends.</p>
        </>)}

        {section("6. Cancellation and Refunds", <>
          <p>You may cancel your subscription at any time through your account settings. Cancellation takes effect immediately.</p>
          <p>Pegasxs does not offer refunds for partial billing periods except where required by applicable law.</p>
          <p style={{ margin: 0 }}>If a technical error on our side prevents the service from functioning, we will assess refund or credit requests on a case-by-case basis.</p>
        </>)}

        {section("7. Render Credits and Usage Limits", <>
          <p>Subscription plans include a defined number of renders per week as stated on the pricing page.</p>
          <p>Unused render credits do not carry over to the following week.</p>
          <p style={{ margin: 0 }}>Pegasxs reserves the right to adjust usage limits with reasonable notice.</p>
        </>)}

        {section("8. Intellectual Property", <>
          <p>Videos generated using Pegasxs using your prompts are yours. You own the output and may use it commercially without restriction.</p>
          <p>Pegasxs retains ownership of the platform, its underlying technology, models, and infrastructure.</p>
          <p>You grant Pegasxs a limited licence to process your prompts and inputs solely for the purpose of delivering the service.</p>
          <p style={{ margin: 0 }}>You must not use the service to generate content that infringes third-party intellectual property rights.</p>
        </>)}

        {section("9. Acceptable Use", <>
          <p>You agree not to use Pegasxs to generate content that:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Is illegal under Swiss or applicable international law</li>
            <li>Infringes copyright, trademarks, or other intellectual property</li>
            <li>Contains hate speech, violence, or content that discriminates against individuals or groups</li>
            <li>Constitutes misinformation or intentional deception</li>
            <li>Violates the privacy or dignity of third parties</li>
          </ul>
          <p style={{ margin: 0 }}>Pegasxs reserves the right to remove content and suspend accounts that violate these rules without prior notice.</p>
        </>)}

        {section("10. Availability and Service Changes", <>
          <p>Pegasxs aims to maintain high availability but does not guarantee uninterrupted access. Scheduled or emergency maintenance may cause temporary downtime.</p>
          <p style={{ margin: 0 }}>Pegasxs reserves the right to modify, suspend, or discontinue any part of the service with reasonable notice where possible.</p>
        </>)}

        {section("11. Liability", <>
          <p>To the extent permitted by Swiss law, Pegasxs's liability for direct damages is limited to the amount paid by the user in the three months preceding the event giving rise to the claim.</p>
          <p>Pegasxs accepts no liability for indirect, incidental, or consequential damages including lost profits or data loss.</p>
          <p style={{ margin: 0 }}>These limitations do not apply in cases of gross negligence or intentional misconduct as defined under Swiss law (OR Art. 100).</p>
        </>)}

        {section("12. Data Protection", <>
          <p>Pegasxs processes personal data in accordance with the Swiss Federal Act on Data Protection (DSG/nDSG) and, where applicable, the EU General Data Protection Regulation (GDPR).</p>
          <p>Data collected includes account information, usage data, and submitted prompts. Data is used solely to provide and improve the service.</p>
          <p>Pegasxs does not sell personal data to third parties.</p>
          <p style={{ margin: 0 }}>Users may request access to, correction of, or deletion of their personal data by contacting <a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a>.</p>
        </>)}

        {section("13. Governing Law and Jurisdiction", <p style={{ margin: 0 }}>These Terms are governed by Swiss law. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Winterthur, Canton of Zurich, Switzerland, unless mandatory consumer protection provisions require otherwise.</p>)}

        {section("14. Changes to These Terms", <p style={{ margin: 0 }}>Pegasxs may update these Terms from time to time. Users will be notified of material changes by email or via a notice on the platform. Continued use of the service after changes take effect constitutes acceptance of the updated Terms.</p>)}

        {section("15. Contact", <>
          <p style={{ margin: 0 }}><a href="mailto:support@pegasxs.com" style={{ color: "#0b0b0b" }}>support@pegasxs.com</a><br />pegasxs.com</p>
        </>)}

      </div>
    </div>
  )
}
