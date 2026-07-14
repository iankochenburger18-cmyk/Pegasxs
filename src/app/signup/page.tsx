"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [messageType, setMessageType] = React.useState<"error" | "success">("error")

  async function handleSignup() {
    setLoading(true); setMessage("")
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() })
      if (error) { setMessage(error.message); setMessageType("error"); setLoading(false); return }
      if (!data.user) { setMessage("No user created."); setMessageType("error"); setLoading(false); return }
      if (data.session) {
        // Check for pending plan from pricing page
        const pendingPlan = sessionStorage.getItem("pending_plan")
        if (pendingPlan === "pro" || pendingPlan === "agency") {
          sessionStorage.removeItem("pending_plan")
          setMessage("Redirecting to checkout...")
          setMessageType("success")
          try {
            const response = await fetch("https://api.pegasxs.com/create-checkout-session", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
              body: JSON.stringify({ plan: pendingPlan }),
            })
            const result = await response.json()
            if (response.ok && result.url) {
              window.location.href = result.url
              return
            }
          } catch {}
        }
        router.push("/studio")
      } else {
        setMessage("Check your email to confirm your account, then sign in.")
        setMessageType("success")
        setEmail(""); setPassword("")
      }
    } catch (err: any) {
      setMessage(err?.message || "Unexpected error"); setMessageType("error")
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSignup()
  }

  return (
    <div className="auth-page">
      <div style={{ position: "absolute", top: 24, left: 28 }}>
        <a href="/"><img src="/logo.png" alt="Pegasxs" style={{ width: 36, height: 36, objectFit: "contain" }} /></a>
      </div>

      <div className="auth-card">
        <h1>Create an account.</h1>
        <p className="subtitle">Start your free trial — no credit card required.</p>

        <div className="auth-field">
          <label>Email</label>
          <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        </div>

        <button className="auth-submit" onClick={handleSignup} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        {message && <div className={`auth-message ${messageType}`}>{message}</div>}

        <p className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  )
}
