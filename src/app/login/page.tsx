"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [messageType, setMessageType] = React.useState<"error" | "success">("error")

  async function handleLogin() {
    setLoading(true); setMessage("")
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() })
      if (error) { setMessage(error.message); setMessageType("error"); setLoading(false); return }
      if (!data.session) { setMessage("No active session returned."); setMessageType("error"); setLoading(false); return }
      router.push("/studio")
    } catch (err: any) {
      setMessage(err?.message || "Unexpected error"); setMessageType("error")
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div className="auth-page">
      <div style={{ position: "absolute", top: 24, left: 28 }}>
        <a href="/"><img src="/logo.png" alt="Pegasxs" style={{ width: 36, height: 36, objectFit: "contain" }} /></a>
      </div>

      <div className="auth-card">
        <h1>Welcome back.</h1>
        <p className="subtitle">Sign in to your Pegasxs account.</p>

        <div className="auth-field">
          <label>Email</label>
          <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        </div>

        <button className="auth-submit" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {message && <div className={`auth-message ${messageType}`}>{message}</div>}

        <p className="auth-footer">
          No account? <a href="/signup">Sign up for free</a>
        </p>
      </div>
    </div>
  )
}
