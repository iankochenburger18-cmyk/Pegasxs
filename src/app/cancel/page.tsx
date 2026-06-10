"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const REASONS = [
  "Too expensive",
  "Missing features",
  "Found an alternative",
  "Not using it enough",
  "Other",
]

export default function CancelPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [comment, setComment] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) { setError("Please select a reason."); return }
    setLoading(true); setError("")

    try {
      // Re-authenticate to confirm identity
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError("Incorrect email or password."); setLoading(false); return }

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { setError("Session error. Please try again."); setLoading(false); return }

      const response = await fetch("https://api.pegasxs.com/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason, additional_comment: comment }),
      })

      const result = await response.json()
      if (!response.ok || !result.ok) {
        setError(result.error || "Cancellation failed. Please contact support.")
        setLoading(false); return
      }

      // Sign out after cancellation
      await supabase.auth.signOut()
      setDone(true)
    } catch (err: any) {
      setError(err?.message || "Something went wrong.")
      setLoading(false)
    }
  }

  const SERIF = '"Instrument Serif", Georgia, serif'
  const INTER = "Inter, -apple-system, sans-serif"

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 48, color: "var(--ink)", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Subscription cancelled.
          </div>
          <p style={{ fontFamily: INTER, fontSize: 16, color: "var(--ink-mute)", lineHeight: 1.6, marginBottom: 32 }}>
            Your access has been removed. Thank you for trying Pegasxs — we hope to see you again.
          </p>
          <a href="/" style={{ fontFamily: INTER, fontSize: 15, color: "var(--ink)", textDecoration: "underline" }}>
            Back to pegasxs.com
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a href="/studio" style={{ fontFamily: INTER, fontSize: 13, color: "var(--ink-mute)", textDecoration: "none", letterSpacing: "0.06em" }}>
            ← Back
          </a>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 40, color: "var(--ink)", marginTop: 24, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Cancel subscription
          </h1>
          <p style={{ fontFamily: INTER, fontSize: 15, color: "var(--ink-mute)", lineHeight: 1.6, margin: 0 }}>
            Your access will be removed immediately. This cannot be undone.
          </p>
        </div>

        <form onSubmit={handleCancel} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontFamily: INTER, fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.04em" }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                height: 48, padding: "0 16px",
                border: "1.5px solid var(--ink)", borderRadius: 12,
                background: "var(--paper)", color: "var(--ink)",
                fontFamily: INTER, fontSize: 15, outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontFamily: INTER, fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.04em" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                height: 48, padding: "0 16px",
                border: "1.5px solid var(--ink)", borderRadius: 12,
                background: "var(--paper)", color: "var(--ink)",
                fontFamily: INTER, fontSize: 15, outline: "none",
              }}
            />
          </div>

          {/* Reason */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontFamily: INTER, fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.04em" }}>
              REASON FOR CANCELLING
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REASONS.map(r => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 16px", border: `1.5px solid ${reason === r ? "var(--ink)" : "var(--line)"}`, borderRadius: 12, fontFamily: INTER, fontSize: 15, color: "var(--ink)", background: reason === r ? "var(--ink)" : "var(--paper)", transition: "all 0.15s ease" }}>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ display: "none" }}
                  />
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reason === r ? "var(--paper)" : "var(--ink-mute)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {reason === r && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--paper)", display: "block" }} />}
                  </span>
                  <span style={{ color: reason === r ? "var(--paper)" : "var(--ink)" }}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional comment */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontFamily: INTER, fontSize: 13, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.04em" }}>
              ANYTHING ELSE? <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us what we could have done better..."
              rows={3}
              style={{
                padding: "12px 16px",
                border: "1.5px solid var(--line)", borderRadius: 12,
                background: "var(--paper)", color: "var(--ink)",
                fontFamily: INTER, fontSize: 15, outline: "none",
                resize: "none", lineHeight: 1.5,
              }}
            />
          </div>

          {error && (
            <div style={{ fontFamily: INTER, fontSize: 14, color: "#dc2626", padding: "12px 16px", background: "rgba(220,38,38,0.06)", borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 52, borderRadius: 999, border: "none",
              background: loading ? "var(--line-strong)" : "#dc2626",
              color: "white", fontFamily: INTER, fontSize: 15,
              fontWeight: 600, cursor: loading ? "default" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Cancelling..." : "Cancel my subscription"}
          </button>

          <p style={{ fontFamily: INTER, fontSize: 13, color: "var(--ink-mute)", textAlign: "center", margin: 0 }}>
            Changed your mind?{" "}
            <a href="/studio" style={{ color: "var(--ink)", textDecoration: "underline" }}>Go back to studio</a>
          </p>
        </form>
      </div>
    </div>
  )
}
