"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import RenderButton from "@/components/RenderButton"
import ExposeUserVideos from "@/components/ExposeUserVideos"
import PersonalGreeting from "@/components/PersonalGreeting"
import OnboardingStepper from "@/components/OnboardingStepper"

export default function StudioPage() {
  const router = useRouter()
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login")
      else setChecking(false)
    })
  }, [router])

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--ink-mute)", fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", position: "relative" }}>

      {/* Nav */}
      <div style={{ position: "fixed", top: 20, left: 28, zIndex: 60 }}>
        <a href="/">
          <img src="/logo.png" alt="Pegasxs" style={{ width: 40, height: 40, objectFit: "contain", display: "block" }} />
        </a>
      </div>
      <nav className="pill">
        <a href="/">Home</a>
        <a href="/library">Library</a>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push("/") }}
          style={{ padding: "9px 18px", fontSize: 14, color: "var(--ink-soft)", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}
        >
          Sign out
        </button>
      </nav>

      {/* Onboarding overlay */}
      <OnboardingStepper />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <PersonalGreeting />
        <ExposeUserVideos />
      </div>

      {/* Fixed render bar at bottom */}
      <RenderButton />
    </div>
  )
}
