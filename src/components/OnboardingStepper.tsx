"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export default function OnboardingStepper() {
  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [shouldShow, setShouldShow] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)
  const [nickname, setNickname] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    let mounted = true
    async function checkOnboarding() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.user) {
        if (mounted) { setLoadingProfile(false); setShouldShow(false) }
        return
      }
      const user = sessionData.session.user
      const { data: profile, error: profileError } = await supabase.from("profiles").select("nickname, onboarding_completed").eq("user_id", user.id).single()
      if (!mounted) return
      if (profileError || !profile) { setLoadingProfile(false); setShouldShow(false); return }
      setNickname(profile.nickname || "")
      setShouldShow(!profile.onboarding_completed)
      setLoadingProfile(false)
    }
    checkOnboarding()
    return () => { mounted = false }
  }, [])

  async function completeOnboarding() {
    setSaving(true); setMessage("")
    try {
      const cleanNickname = nickname.trim()
      if (!cleanNickname) { setMessage("Please enter a nickname."); setSaving(false); return }
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.user) { setMessage("You must be logged in."); setSaving(false); return }
      const user = sessionData.session.user
      const { error: updateError } = await supabase.from("profiles").update({ nickname: cleanNickname, onboarding_completed: true }).eq("user_id", user.id)
      if (updateError) { setMessage(updateError.message || "Failed to save onboarding."); setSaving(false); return }
      setShouldShow(false)
    } catch (err: any) {
      setMessage(err?.message || "Unknown error")
    }
    setSaving(false)
  }

  function goNext() {
    if (currentStep < 3) { setCurrentStep((prev) => prev + 1); return }
    completeOnboarding()
  }

  function goBack() { if (currentStep > 1) setCurrentStep((prev) => prev - 1) }

  if (loadingProfile || !shouldShow) return null

  const totalSteps = 3

  const stepContent = [
    {
      title: "Welcome to Pegasxs",
      body: "This is where you turn ideas into polished videos directly from a simple prompt.",
    },
    {
      title: "How it works",
      body: "Enter your script, generate the video, and review the result right on the page. Later you can refine the workflow further.",
    },
    {
      title: "What should we call you?",
      body: "Add a nickname so the page can greet you in a more personal way.",
    },
  ]

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 520, borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(14,14,18,0.96) 0%, rgba(10,10,14,0.96) 100%)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", padding: 32, color: "white", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          {[1, 2, 3].map((step, index) => {
            const isActive = currentStep === step
            const isComplete = currentStep > step
            return (
              <React.Fragment key={step}>
                <button onClick={() => setCurrentStep(step)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: isActive || isComplete ? "#5B2EFF" : "#232323", color: isActive || isComplete ? "#ffffff" : "#b0b0b0", flexShrink: 0, transition: "all 0.2s ease" }}>
                  {isComplete ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : isActive ? (
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{step}</span>
                  )}
                </button>
                {index < totalSteps - 1 && (
                  <div style={{ flex: 1, height: 2, marginInline: 10, background: "rgba(255,255,255,0.22)", position: "relative", overflow: "hidden", borderRadius: 99 }}>
                    <div style={{ position: "absolute", inset: 0, width: currentStep > step ? "100%" : "0%", background: "#5B2EFF", transition: "width 0.25s ease" }} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step content */}
        <div style={{ minHeight: 180 }}>
          <h2 style={{ margin: 0, marginBottom: 12, fontSize: 34, lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff" }}>
            {stepContent[currentStep - 1].title}
          </h2>
          <p style={{ margin: 0, marginBottom: currentStep === 3 ? 18 : 0, color: "rgba(255,255,255,0.76)", fontSize: 16, lineHeight: 1.6 }}>
            {stepContent[currentStep - 1].body}
          </p>
          {currentStep === 3 && (
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              style={{ width: "100%", height: 52, borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "white", padding: "0 16px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          )}
        </div>

        <div style={{ minHeight: 22, color: "#ff8f8f", fontSize: 14, marginTop: 8 }}>{message}</div>

        <div style={{ display: "flex", justifyContent: currentStep === 1 ? "flex-end" : "space-between", alignItems: "center", marginTop: 12 }}>
          {currentStep !== 1 && (
            <button onClick={goBack} disabled={saving} style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.68)", fontSize: 15, fontWeight: 500, cursor: "pointer", padding: "10px 0", fontFamily: "inherit" }}>
              Back
            </button>
          )}
          <button onClick={goNext} disabled={saving} style={{ minWidth: 110, height: 46, borderRadius: 999, border: "none", background: "#5B2EFF", color: "white", fontSize: 16, fontWeight: 600, cursor: saving ? "default" : "pointer", padding: "0 22px", boxShadow: "0 12px 28px rgba(91,46,255,0.32)", fontFamily: "inherit" }}>
            {saving ? "Saving..." : currentStep === totalSteps ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
