"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import RenderButton from "@/components/RenderButton"
import PersonalGreeting from "@/components/PersonalGreeting"
import OnboardingStepper from "@/components/OnboardingStepper"

export default function StudioPage() {
  const router = useRouter()
  const [checking, setChecking] = React.useState(true)
  const [showGreeting, setShowGreeting] = React.useState(true)
  const [videoFullscreen, setVideoFullscreen] = React.useState(false)

  React.useEffect(() => {
    function handleVideoOpen() { setVideoFullscreen(true) }
    function handleVideoClose() { setVideoFullscreen(false) }
    window.addEventListener("pegasxs-video-open", handleVideoOpen)
    window.addEventListener("pegasxs-video-close", handleVideoClose)
    return () => {
      window.removeEventListener("pegasxs-video-open", handleVideoOpen)
      window.removeEventListener("pegasxs-video-close", handleVideoClose)
    }
  }, [])

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
      {!videoFullscreen && (
      <div style={{ position: "fixed", top: 20, left: 28, zIndex: 60 }}>
        <a href="/">
          <img src="/logo.png" alt="Pegasxs" style={{ width: 40, height: 40, objectFit: "contain", display: "block" }} />
        </a>
      </div>
      )}
      {!videoFullscreen && (
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
      )}

      {/* Onboarding overlay */}
      <OnboardingStepper />

      {/* Personal greeting — hidden after first prompt submitted */}
      {showGreeting && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}>
          <PersonalGreeting />
        </div>
      )}

      {/* RenderButton — contains the full chat UI */}
      <RenderButton onFirstSubmit={() => setShowGreeting(false)} />
    </div>
  )
}
