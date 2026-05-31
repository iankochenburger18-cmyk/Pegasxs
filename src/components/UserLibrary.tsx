"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

type RenderRow = {
  id: number
  status: string
  video_path: string | null
  prompt: string | null
  created_at: string
  signedUrl?: string
}

export default function UserLibrary() {
  const [renders, setRenders] = React.useState<RenderRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [message, setMessage] = React.useState("")
  const [activeVideo, setActiveVideo] = React.useState<RenderRow | null>(null)
  const [downloading, setDownloading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    async function loadRenders() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.user) {
        setMessage("You must be logged in to view your library.")
        setLoading(false); return
      }
      const user = sessionData.session.user
      const { data, error } = await supabase
        .from("renders")
        .select("id, status, video_path, prompt, created_at")
        .eq("user_id", user.id)
        .eq("status", "rendered")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) { setMessage("Failed to load your renders."); setLoading(false); return }
      setRenders(data || [])
      setLoading(false)
    }
    loadRenders()
  }, [])

  async function openVideo(render: RenderRow) {
    if (!render.video_path) return
    if (render.signedUrl) { setActiveVideo(render); return }

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.access_token) return

    const response = await fetch("https://api.pegasxs.com/get-video-url", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify({ video_path: render.video_path }),
    })
    const result = await response.json()
    if (result.signedUrl) {
      const updated = { ...render, signedUrl: result.signedUrl }
      setRenders((prev) => prev.map((r) => r.id === render.id ? updated : r))
      setActiveVideo(updated)
    }
  }

  async function downloadVideo(render: RenderRow) {
    if (!render.video_path) return
    setDownloading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.access_token) { setDownloading(false); return }

    const response = await fetch("https://api.pegasxs.com/download-video", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
      body: JSON.stringify({ video_path: render.video_path }),
    })
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url; link.download = `pegasxs-video-${render.id}.mp4`
      document.body.appendChild(link); link.click(); link.remove()
      window.URL.revokeObjectURL(url)
    }
    setDownloading(false)
  }

  async function copyPrompt(prompt: string) {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", color: "var(--ink-mute)", fontSize: 15 }}>
        Loading your videos...
      </div>
    )
  }

  if (message) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", color: "var(--ink-soft)", fontSize: 15 }}>
        {message}
      </div>
    )
  }

  if (renders.length === 0) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 48, color: "var(--ink)", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Nothing here yet!
        </div>
        <div style={{ fontSize: 15, color: "var(--ink-mute)", marginBottom: 28 }}>
          Head to the studio to render your first video.
        </div>
        <a href="/studio" className="btn">Go to Studio <span className="arrow">→</span></a>
      </div>
    )
  }

  return (
    <div>
      {/* Video modal */}
      {activeVideo && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveVideo(null) }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{
            width: "min(860px, 100%)",
            background: "var(--paper)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          }}>
            {/* Video — capped so buttons always visible */}
            <video
              src={activeVideo.signedUrl}
              controls
              autoPlay
              style={{
                width: "100%",
                maxHeight: "58vh",
                display: "block",
                background: "black",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />

            {/* Buttons + prompt */}
            <div style={{
              padding: "20px 24px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
              borderTop: "1px solid var(--line)",
            }}>
              {activeVideo.prompt && (
                <div style={{ flex: 1, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5, minWidth: 200 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>
                    Prompt used
                  </span>
                  {activeVideo.prompt}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexShrink: 0, alignItems: "center" }}>
                {activeVideo.prompt && (
                  <button
                    onClick={() => copyPrompt(activeVideo.prompt!)}
                    style={{ height: 40, padding: "0 18px", borderRadius: 999, border: "1px solid var(--line-strong)", background: "var(--paper)", color: "var(--ink)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {copied ? "Copied!" : "Copy Prompt"}
                  </button>
                )}
                <button
                  onClick={() => downloadVideo(activeVideo)}
                  disabled={downloading}
                  style={{ height: 40, padding: "0 18px", borderRadius: 999, border: "none", background: "var(--ink)", color: "var(--paper)", fontSize: 13, fontWeight: 500, cursor: downloading ? "default" : "pointer", opacity: downloading ? 0.6 : 1, fontFamily: "inherit" }}
                >
                  {downloading ? "Downloading..." : "Download"}
                </button>
                <button
                  onClick={() => setActiveVideo(null)}
                  style={{ height: 40, width: 40, borderRadius: "50%", border: "1px solid var(--line-strong)", background: "transparent", color: "var(--ink-soft)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="library-grid" style={{ paddingTop: 48 }}>
        {renders.map((render, idx) => (
          <div key={render.id} className="video-card" onClick={() => openVideo(render)}>
            <div className="video-thumb">
              <span className="vdur">{formatDate(render.created_at)}</span>
              <div style={{
                width: "100%", height: "100%",
                background: "#111",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 10,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Click to play
                </span>
              </div>
              <div className="play"><div className="play-icon"></div></div>
            </div>
            <div className="video-meta">
              <div className="vnum">Nº {String(idx + 1).padStart(2, "0")}</div>
              <div className="vtitle">
                {render.prompt
                  ? render.prompt.slice(0, 50) + (render.prompt.length > 50 ? "..." : "")
                  : <em>Render from {formatDate(render.created_at)}</em>
                }
              </div>
              <div className="vsub">
                <span>MP4</span>
                <span className="dot"></span>
                <span>{formatDate(render.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
