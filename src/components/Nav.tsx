"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [hasActiveSub, setHasActiveSub] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      setIsLoggedIn(!!session)

      if (session?.user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("subscription_status, trial_ends_at")
          .eq("user_id", session.user.id)
          .single()

        if (sub) {
          const now = new Date()
          const trialEndsAt = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null
          const active =
            sub.subscription_status === "active" ||
            (trialEndsAt !== null && trialEndsAt > now)
          setHasActiveSub(active)
        }
      }

      setLoaded(true)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      if (!session) setHasActiveSub(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const ctaHref = isLoggedIn ? "/studio" : "/login"
  const ctaLabel = isLoggedIn ? "Create" : "Begin"

  return (
    <>
      <a className="brand" href="/">
        <img className="brand-img" src="/logo.png" alt="Pegasxs" />
      </a>
      <nav className="pill">
        <a href="/">Home</a>
        <a href="/library">Library</a>
        <a href="/#pricing">Pricing</a>
        <a href="/#faq" data-mobile="hide">Q&amp;A</a>
        {loaded && (
          isLoggedIn ? (
            <a href="/studio" data-mobile="hide">Studio</a>
          ) : (
            <a href="/login" data-mobile="hide">Login</a>
          )
        )}
        {loaded && isLoggedIn && hasActiveSub && (
          <a href="/cancel" data-mobile="hide" style={{ color: "var(--ink-mute)" }}>
            Cancel plan
          </a>
        )}
        <a href={ctaHref} className="cta">
          {ctaLabel} <span className="arr">→</span>
        </a>
      </nav>
    </>
  )
}
