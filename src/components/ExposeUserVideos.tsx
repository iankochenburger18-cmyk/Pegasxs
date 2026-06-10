"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

type RenderRow = { id: string | number; status: string; video_path: string | null; error_message?: string | null; created_at?: string }
type RenderWithUrl = RenderRow & { signedUrl?: string }

export default function ExposeUserVideos() {
  const [video, setVideo] = React.useState<RenderWithUrl | null>(null)
  const [message, setMessage] = React.useState("")
  const [downloading, setDownloading] = React.useState(false)
  const [activeRenderId, setActiveRenderId] = React.useState<string | number | null>(null)

  // Adjust state
  const [adjustPrompt, setAdjustPrompt] = React.useState("")
  const [adjusting, setAdjusting] = React.useState(false)
  const [adjustMessage, setAdjustMessage] = React.useState("")
  const adjustTextareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    function handleRenderStarted(event: Event) {
      const customEvent = event as CustomEvent<{ render_id: string | number }>
      const renderId = customEvent.detail?.render_id
      if (!renderId) return
      setVideo(null)
      setMessage("Rendering...")
      setActiveRenderId(renderId)
      setAdjustPrompt("")
      setAdjustMessage("")
    }
    window.addEventListener("pegasxs-render-started", handleRenderStarted)
    return () => window.removeEventListener("pegasxs-render-started", handleRenderStarted)
  }, [])

  React.useEffect(() => {
    if (!activeRenderId) return
    let cancelled = false
    let interval: ReturnType<typeof setInterval> | null = null

    async function pollRenderStatus() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData.session?.access_token) {
          if (!cancelled) setMessage("You must be logged in.")
          return
        }
        const token = sessionData.session.access_token
        const statusResponse = await fetch("https://api.pegasxs.com/get-render-status", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ render_id: activeRenderId }),
        })
        const statusResult = await statusResponse.json()
        if (!statusResponse.ok || !statusResult.render) {
          if (!cancelled) setMessage(statusResult.error || "Failed to check render.")
          return
        }
        const render = statusResult.render as RenderRow
        if (render.status === "rendering") {
          if (!cancelled) { setVideo(render); setMessage("Rendering...") }
          return
        }
        if (render.status === "failed") {
          if (interval) clearInterval(interval)
          if (!cancelled) {
            setVideo(render)
            setMessage(render.error_message || "Render failed. Please try again.")
            window.dispatchEvent(new CustomEvent("pegasxs-render-failed"))
          }
          return
        }
        if (render.status === "rendered" && render.video_path) {
          const urlResponse = await fetch("https://api.pegasxs.com/get-video-url", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ video_path: render.video_path }),
          })
          const urlResult = await urlResponse.json()
          if (!urlResponse.ok || !urlResult.signedUrl) {
            if (!cancelled) setMessage(urlResult.error || "Failed to load video.")
            return
          }
          if (interval) clearInterval(interval)
          if (!cancelled) {
            setVideo({ ...render, signedUrl: urlResult.signedUrl })
            setMessage("")
            setActiveRenderId(null)
            window.dispatchEvent(new CustomEvent("pegasxs-render-done"))
          }
        }
      } catch (err: any) {
        if (!cancelled) setMessage(err?.message || "Unknown error")
      }
    }

    pollRenderStatus()
    interval = setInterval(pollRenderStatus, 3000)
    return () => { cancelled = true; if (interval) clearInterval(interval) }
  }, [activeRenderId])

  async function downloadVideo() {
    if (!video?.video_path) { setMessage("No video path found."); return }
    setDownloading(true); setMessage("Preparing download...")
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session?.access_token) { setMessage("You must be logged in."); setDownloading(false); return }
      const response = await fetch("https://api.pegasxs.com/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ video_path: video.video_path }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setMessage(errorData?.error || "Download failed.")
        setDownloading(false); return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url; link.download = `pegasxs-video-${video.id}.mp4`
      document.body.appendChild(link); link.click(); link.remove()
      window.URL.revokeObjectURL(url)
      setMessage("Download started.")
    } catch (err: any) {
      setMessage(err?.message || "Download failed.")
    }
    setDownloading(false)
  }

  async function handleAdjust() {
    if (!adjustPrompt.trim()) { setAdjustMessage("Describe what you want to change."); return }
    if (!video?.id) return
    setAdjusting(true); setAdjustMessage("")

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { setAdjustMessage("You must be logged in."); setAdjusting(false); return }

      const response = await fetch("https://api.pegasxs.com/render-v3-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          original_render_id: video.id,
          adjust_prompt: adjustPrompt.trim(),
        }),
      })

      const result = await response.json()

      if (response.status === 429 && result.limitReached) {
        setAdjustMessage(result.error || "Weekly render limit reached.")
        setAdjusting(false); return
      }

      if (!response.ok || !result.render_id) {
        setAdjustMessage(result.error || "Adjustment failed.")
        setAdjusting(false); return
      }

      // Fire the same render-started flow so the video player replaces with the new render
      window.dispatchEvent(new CustomEvent("pegasxs-render-started", { detail: { render_id: result.render_id } }))
      setAdjusting(false)
      setAdjustPrompt("")
    } catch (err: any) {
      setAdjustMessage(err?.message || "Adjustment failed.")
      setAdjusting(false)
    }
  }

  function handleAdjustKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!adjusting) handleAdjust() }
  }

  if (!video && !message) return null

  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 24px 120px", boxSizing: "border-box" }}>
      <div style={{ width: "min(820px, 100%)", display: "grid", gap: 14, justifyItems: "center" }}>

        {message && (
          <div style={{ color: "var(--ink)", fontSize: 16, fontWeight: 500, textAlign: "center" }}>{message}</div>
        )}

        {video?.signedUrl && (
          <>
            <video
              src={video.signedUrl}
              controls
              style={{ width: "100%", maxWidth: 820, borderRadius: 18, background: "black" }}
            />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={downloadVideo}
                disabled={downloading}
                style={{
                  padding: "11px 20px",
                  background: "var(--ink)", color: "var(--paper)",
                  border: "none", borderRadius: 999,
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                  cursor: downloading ? "default" : "pointer",
                  opacity: downloading ? 0.7 : 1,
                }}
              >
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>

            {/* Adjust section */}
            <div style={{
              width: "100%", marginTop: 8,
              border: "1.5px solid var(--ink)",
              borderRadius: 16, overflow: "hidden",
              background: "var(--paper)",
            }}>
              <div style={{
                padding: "12px 18px",
                borderBottom: "1px solid var(--line)",
                fontFamily: "inherit", fontSize: 12,
                fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--ink-mute)",
              }}>
                Adjust this video
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 18px" }}>
                <textarea
                  ref={adjustTextareaRef}
                  value={adjustPrompt}
                  onChange={(e) => setAdjustPrompt(e.target.value)}
                  onKeyDown={handleAdjustKeyDown}
                  disabled={adjusting}
                  placeholder={adjusting ? "Adjusting..." : "Make it faster, change the background to white, add a logo in the corner..."}
                  rows={2}
                  style={{
                    flex: 1, border: "none", outline: "none", resize: "none",
                    background: "transparent", fontFamily: "inherit",
                    fontSize: 15, color: "var(--ink)", lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={handleAdjust}
                  disabled={adjusting || !adjustPrompt.trim()}
                  style={{
                    flexShrink: 0, width: 38, height: 38,
                    borderRadius: "50%", border: "none",
                    background: adjusting || !adjustPrompt.trim() ? "var(--line-strong)" : "var(--ink)",
                    color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: adjusting || !adjustPrompt.trim() ? "default" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {adjusting ? (
                    <span style={{ fontSize: 16, fontWeight: 700 }}>…</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6 11L12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              {adjustMessage && (
                <div style={{ padding: "0 18px 12px", fontSize: 13, color: "var(--ink-soft)" }}>
                  {adjustMessage}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
