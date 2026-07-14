"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

const AGENCY_PRICE_ID = "price_1TdE2FF1sqhMmpQduvrjgJxI"

export function PricingCards() {
  const [userPlan, setUserPlan] = React.useState<"pro" | "agency" | "none" | "loading">("loading")
  const [loadingPro, setLoadingPro] = React.useState(false)
  const [loadingAgency, setLoadingAgency] = React.useState(false)

  React.useEffect(() => {
    async function fetchPlan() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session?.user) { setUserPlan("none"); return }
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("subscription_status, trial_ends_at, stripe_price_id")
          .eq("user_id", sessionData.session.user.id)
          .single()
        if (!sub) { setUserPlan("none"); return }
        const now = new Date()
        const trialEndsAt = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null
        const isActive = sub.subscription_status === "active" || (trialEndsAt !== null && trialEndsAt > now)
        if (!isActive) { setUserPlan("none"); return }
        if (sub.stripe_price_id === AGENCY_PRICE_ID) setUserPlan("agency")
        else setUserPlan("pro")
      } catch {
        setUserPlan("none")
      }
    }
    fetchPlan()
  }, [])

  async function handleCheckout(plan: "pro" | "agency") {
    const setLoading = plan === "pro" ? setLoadingPro : setLoadingAgency
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.access_token) {
        sessionStorage.setItem("pending_plan", plan)
        window.location.href = "/login"
        return
      }
      const response = await fetch("https://api.pegasxs.com/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ plan }),
      })
      const result = await response.json()
      if (!response.ok || !result.url) { alert(result.error || "Checkout failed."); setLoading(false); return }
      window.location.href = result.url
    } catch (err: any) {
      alert(err?.message || "Checkout failed.")
      setLoading(false)
    }
  }

  function handleCancel() {
    window.location.href = "/cancel"
  }

  return (
    <>
      {/* Pro Card */}
      <div className="plan reveal" style={{ position: "relative" }}>
        {userPlan === "pro" && (
          <div style={{
            position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: "#22c55e", color: "#000", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "4px 14px", borderRadius: 999, zIndex: 10, whiteSpace: "nowrap",
          }}>Current plan</div>
        )}
        <div className="plan-top"><div className="plan-name">Pro</div></div>
        <div className="price">$35<em> / mo</em></div>
        <p className="tag">For working creators. <em>The standard.</em></p>
        <ul>
          <li><em>50</em> renders / week</li>
          <li>4K MP4 · ProRes export</li>
          <li>Cinema palettes &amp; presets</li>
          <li>Private project library</li>
          <li>~<em>$0.15</em> avg per video</li>
        </ul>
        {userPlan === "pro" ? (
          <button onClick={handleCancel} className="btn btn-ghost" style={{ border: "1px solid rgba(255,80,80,0.5)", color: "#ef4444", cursor: "pointer", background: "none", borderRadius: 999, padding: "12px 28px", fontSize: 16, fontWeight: 600, fontFamily: "inherit" }}>
            Cancel plan
          </button>
        ) : (
          <button onClick={() => handleCheckout("pro")} disabled={loadingPro} className="btn btn-ghost" style={{ cursor: loadingPro ? "default" : "pointer", opacity: loadingPro ? 0.7 : 1 }}>
            {loadingPro ? "Redirecting..." : <>Start with Pro <span className="arrow">→</span></>}
          </button>
        )}
      </div>

      {/* Max/Agency Card */}
      <div className="plan dark reveal" style={{ position: "relative" }}>
        {userPlan === "agency" && (
          <div style={{
            position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
            background: "#22c55e", color: "#000", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "4px 14px", borderRadius: 999, zIndex: 10, whiteSpace: "nowrap",
          }}>Current plan</div>
        )}
        <div className="plan-top"><div className="plan-name">Max</div><span className="badge">most chosen</span></div>
        <div className="price">$150<em> / mo</em></div>
        <p className="tag">For studios shipping in motion. <em>Built to scale.</em></p>
        <ul>
          <li><em>Unlimited</em> renders</li>
          <li>No weekly cap</li>
          <li>Priority GPU queue</li>
          <li>4K MP4 export</li>
          <li>Brand kits &amp; team libraries</li>
          <li>Dedicated success partner</li>
        </ul>
        {userPlan === "agency" ? (
          <button onClick={handleCancel} className="btn" style={{ border: "1px solid rgba(255,80,80,0.5)", color: "#ef4444", cursor: "pointer", background: "rgba(255,60,60,0.1)", borderRadius: 999, padding: "12px 28px", fontSize: 16, fontWeight: 600, fontFamily: "inherit" }}>
            Cancel plan
          </button>
        ) : (
          <button onClick={() => handleCheckout("agency")} disabled={loadingAgency} className="btn" style={{ cursor: loadingAgency ? "default" : "pointer", opacity: loadingAgency ? 0.7 : 1 }}>
            {loadingAgency ? "Redirecting..." : <>Upgrade to Max <span className="arrow">→</span></>}
          </button>
        )}
      </div>
    </>
  )
}

export function ProPlanCard() { return <PricingCards /> }
export function AgencyPlanCard() { return null }
