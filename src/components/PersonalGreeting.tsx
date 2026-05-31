"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export default function PersonalGreeting() {
  const [beforeName, setBeforeName] = React.useState("")
  const [name, setName] = React.useState("")
  const [punctuation, setPunctuation] = React.useState("")
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    async function loadGreeting() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.user) return
      const user = sessionData.session.user

      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("nickname").eq("user_id", user.id).single()
      if (profileError || !profile) return

      const finalName = (profile.nickname || "").trim() || "there"

      const templates = [
        `What would you like to create today, ${finalName}?`,
        `Ready to create something new, ${finalName}?`,
        `What video are we making today, ${finalName}?`,
        `Let's build something sharp today, ${finalName}.`,
        `What's the first idea you want to turn into video, ${finalName}?`,
      ]

      const full = templates[Math.floor(Math.random() * templates.length)]

      // Split into: text before the name, the name, and the trailing punctuation
      const nameIndex = full.lastIndexOf(finalName)
      const before = full.slice(0, nameIndex).replace(/,\s*$/, "").trimEnd()
      const punct = full.slice(nameIndex + finalName.length)

      if (mounted) {
        setBeforeName(before)
        setName(finalName)
        setPunctuation(punct)
      }
    }

    loadGreeting()

    function handleRenderStarted() { setVisible(false) }
    window.addEventListener("pegasxs-render-started", handleRenderStarted)

    return () => {
      mounted = false
      window.removeEventListener("pegasxs-render-started", handleRenderStarted)
    }
  }, [])

  if (!name || !visible) return null

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      padding: "24px",
      boxSizing: "border-box",
    }}>
      <div style={{
        maxWidth: 760,
        textAlign: "center",
        color: "var(--ink)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: "-0.03em",
      }}>
        {beforeName},{" "}
        <em style={{
          fontFamily: '"Instrument Serif", serif',
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "1.08em",
          letterSpacing: "-0.02em",
        }}>
          {name}
        </em>
        {punctuation}
      </div>
    </div>
  )
}
