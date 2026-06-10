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

  React.useEffect(() => {
    function handleRenderStarted(event: Event) {
      const customEvent = event as CustomEvent<{ render_id: string | number }>
      const renderId = customEvent.detail?.render_id
      if (!renderId) return
      setVideo(null)
      setMessage("Rendering...")
      setActiveRenderId(renderId)
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
              {downloading ? "Downloading..." : "Download Video"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
