"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
      setLoaded(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
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
        {loaded && !isLoggedIn && (
          <a href="/login" data-mobile="hide">Login</a>
        )}
        <a href={ctaHref} className="cta">
          {ctaLabel} <span className="arr">→</span>
        </a>
      </nav>
    </>
  )
}
