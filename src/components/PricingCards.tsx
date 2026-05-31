"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

interface PricingCardProps {
  plan: "pro" | "agency"
  title: string
  price: string
  bulletItems: string[]
  glowColor: string
}

function PricingCard({ plan, title, price, bulletItems, glowColor }: PricingCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [angle, setAngle] = React.useState(120)
  const [edge, setEdge] = React.useState(0)
  const [loadingCheckout, setLoadingCheckout] = React.useState(false)

  const borderRadius = 34
  const borderWidth = 1
  const edgeSensitivity = 52
  const coneSpread = 16

  function parseHSL(hslStr: string) {
    const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
    if (!match) return { h: 40, s: 80, l: 80 }
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) }
  }
  function glowColorFromHSL(hslStr: string, alpha: number) {
    const { h, s, l } = parseHSL(hslStr)
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
  }

  const strongGlow = glowColorFromHSL(glowColor, 0.95)
  const mediumGlow = glowColorFromHSL(glowColor, 0.55)
  const softGlow = glowColorFromHSL(glowColor, 0.18)

  function getCursorAngle(el: HTMLElement, x: number, y: number) {
    const rect = el.getBoundingClientRect()
    const cx = rect.width / 2; const cy = rect.height / 2
    const dx = x - cx; const dy = y - cy
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (degrees < 0) degrees += 360
    return degrees
  }
  function getEdgeProximity(el: HTMLElement, x: number, y: number) {
    const rect = el.getBoundingClientRect()
    const distanceToEdge = Math.min(x, y, rect.width - x, rect.height - y)
    return Math.max(0, Math.min(1 - Math.min(distanceToEdge / Math.max(edgeSensitivity, 1), 1), 1))
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = cardRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    setAngle(getCursorAngle(el, e.clientX - rect.left, e.clientY - rect.top))
    setEdge(getEdgeProximity(el, e.clientX - rect.left, e.clientY - rect.top))
  }

  async function handleCheckout() {
    setLoadingCheckout(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.access_token) {
        alert("You must be logged in.")
        setLoadingCheckout(false); return
      }
      const response = await fetch("https://api.pegasxs.com/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ plan }),
      })
      const result = await response.json()
      if (!response.ok || !result.url) { alert(result.error || "Checkout failed."); setLoadingCheckout(false); return }
      window.location.href = result.url
    } catch (err: any) {
      alert(err?.message || "Checkout failed.")
      setLoadingCheckout(false)
    }
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setEdge(0)}
      style={{ position: "relative", width: "100%", height: "100%", minWidth: 320, minHeight: 520, borderRadius, overflow: "visible", isolation: "isolate", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius, padding: borderWidth, background: `conic-gradient(from ${angle - coneSpread}deg, rgba(255,255,255,0.06) 0deg, rgba(255,255,255,0.06) 10deg, ${softGlow} 16deg, ${mediumGlow} 26deg, ${strongGlow} 38deg, ${mediumGlow} 50deg, ${softGlow} 62deg, rgba(255,255,255,0.06) 74deg, rgba(255,255,255,0.06) 360deg)`, opacity: Math.max(edge * 1.1, 0.08), filter: `blur(${6 * 0.35}px)`, boxSizing: "border-box", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: borderWidth, borderRadius: Math.max(borderRadius - borderWidth, 0), background: "#050505", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), inset 0 0 18px rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.015)", zIndex: 2 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius, border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ position: "absolute", inset: borderWidth, borderRadius: Math.max(borderRadius - borderWidth, 0), background: "#0f0b17", opacity: 0.22, pointerEvents: "none", zIndex: 4 }} />

      <div style={{ position: "relative", zIndex: 5, width: "100%", height: "100%", boxSizing: "border-box", padding: "34px 26px 22px 26px", display: "flex", flexDirection: "column", color: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "nowrap", marginBottom: 44 }}>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", flexShrink: 0 }}>{price}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 36, paddingLeft: 8 }}>
          {bulletItems.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ fontSize: 22, lineHeight: 1, marginTop: 1, color: "#FFFFFF", flexShrink: 0 }}>•</div>
              <div style={{ fontSize: 17, lineHeight: 1.35, fontWeight: 600, color: "#FFFFFF" }}>{item}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button onClick={handleCheckout} disabled={loadingCheckout} style={{ alignSelf: "center", width: "78%", height: 44, borderRadius: 999, border: "1px solid rgba(255,255,255,0.85)", background: "#2583F5", color: "#FFFFFF", fontSize: 17, fontWeight: 700, cursor: loadingCheckout ? "default" : "pointer", opacity: loadingCheckout ? 0.7 : 1, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)", fontFamily: "inherit" }}>
          {loadingCheckout ? "Redirecting..." : "Get"}
        </button>
      </div>
    </div>
  )
}

export function ProPlanCard() {
  return (
    <PricingCard
      plan="pro"
      title="Pro Plan -"
      price="$29.95/mo"
      glowColor="40 80 80"
      bulletItems={["Professional Grade Videos", "Fully Automated Workflow", "Time Savings (Hours → Minutes)", "Instant Download and Ownership", "50 renders per week"]}
    />
  )
}

export function AgencyPlanCard() {
  return (
    <PricingCard
      plan="agency"
      title="Agency -"
      price="$99.95/mo"
      glowColor="210 90 65"
      bulletItems={["Unlimited video credits", "Best for agencies and high-volume creators", "Create more client videos without daily limits", "Priority render access", "Commercial usage and full video ownership"]}
    />
  )
}
