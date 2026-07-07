"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

const MAX_IMAGES = 5
const MAX_FILE_SIZE_MB = 5

const STATUS_STEPS = [
  { label: "Thinking...", duration: 4000 },
  { label: "Researching your niche...", duration: 6000 },
  { label: "Writing design brief...", duration: 8000 },
  { label: "Generating HTML & animations...", duration: 30000 },
  { label: "Capturing frames...", duration: 25000 },
  { label: "Encoding video...", duration: 8000 },
]

type ChatMessage =
  | { type: "user"; text: string; id: string }
  | { type: "status"; steps: string[]; activeStep: number; done: boolean; id: string }
  | { type: "video"; renderId: string | number; signedUrl: string | null; id: string }
  | { type: "error"; text: string; id: string }

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center", height: 16 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--ink-mute)",
            display: "inline-block",
            animation: `pegasxs-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

function VideoBubble({ renderId, signedUrl }: { renderId: string | number; signedUrl: string | null }) {
  const [url, setUrl] = React.useState<string | null>(signedUrl)
  const [loading, setLoading] = React.useState(!signedUrl)
  const [fullscreen, setFullscreen] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)

  React.useEffect(() => {
    if (url) return
    async function fetchUrl() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        if (!token) return
        const res = await fetch("https://api.pegasxs.com/get-render-status", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ render_id: renderId }),
        })
        const data = await res.json()
        if (data.render?.video_path) {
          const urlRes = await fetch("https://api.pegasxs.com/get-video-url", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ video_path: data.render.video_path }),
          })
          const urlData = await urlRes.json()
          if (urlData.signedUrl) setUrl(urlData.signedUrl)
        }
      } catch {}
      setLoading(false)
    }
    fetchUrl()
  }, [renderId, url])

  async function handleDownload() {
    if (!url || downloading) return
    setDownloading(true)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `pegasxs-${renderId}.mp4`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {}
    setDownloading(false)
  }

  if (loading) {
    return (
      <div style={{ width: 90, height: 140, borderRadius: 12, background: "var(--paper-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TypingDots />
      </div>
    )
  }

  if (!url) {
    return (
      <div style={{ fontSize: 13, color: "var(--ink-soft)", fontFamily: "Inter, sans-serif" }}>
        Video unavailable
      </div>
    )
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          onClick={() => setFullscreen(true)}
          style={{
            position: "relative", width: 90, height: 140,
            borderRadius: 12, overflow: "hidden",
            background: "#000", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          <video
            src={url}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            muted
            playsInline
          />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#000">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid var(--line-strong)",
            borderRadius: 999, padding: "5px 12px",
            cursor: downloading ? "default" : "pointer",
            color: "var(--ink-soft)", fontFamily: "Inter, sans-serif",
            fontSize: 12, width: "fit-content",
            opacity: downloading ? 0.5 : 1, transition: "opacity 0.2s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>

      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxHeight: "90vh", maxWidth: "90vw" }}>
            <video
              src={url}
              style={{ maxHeight: "90vh", maxWidth: "90vw", borderRadius: 16, display: "block" }}
              autoPlay
              controls
              playsInline
              loop
            />
            <button
              onClick={() => setFullscreen(false)}
              style={{
                position: "absolute", top: -16, right: -16,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)", border: "none",
                color: "#fff", fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
          </div>
        </div>
      )}
    </>
  )
}

function PegasxsAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "var(--ink)", color: "var(--paper)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 700,
      flexShrink: 0, marginTop: 2,
    }}>
      P
    </div>
  )
}

export default function RenderButton({ onFirstSubmit }: { onFirstSubmit?: () => void } = {}) {
  const [script, setScript] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [uploadedImages, setUploadedImages] = React.useState<{ url: string; name: string }[]>([])
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const chatBottomRef = React.useRef<HTMLDivElement>(null)

  const [adjustMode, setAdjustMode] = React.useState(false)
  const [lastRenderId, setLastRenderId] = React.useState<string | number | null>(null)
  const lastRenderIdRef = React.useRef<string | number | null>(null)
  const adjustModeRef = React.useRef(false)

  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [hasSubmitted, setHasSubmitted] = React.useState(false)

  const statusTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeStatusIdRef = React.useRef<string | null>(null)

  React.useEffect(() => { lastRenderIdRef.current = lastRenderId }, [lastRenderId])
  React.useEffect(() => { adjustModeRef.current = adjustMode }, [adjustMode])

  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  React.useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  function startStatusAnimation(msgId: string) {
    activeStatusIdRef.current = msgId
    let stepIndex = 0

    function advance() {
      if (activeStatusIdRef.current !== msgId) return
      stepIndex++
      if (stepIndex >= STATUS_STEPS.length) return
      setMessages((prev) => prev.map((m) =>
        m.id === msgId && m.type === "status"
          ? { ...m, activeStep: stepIndex }
          : m
      ))
      statusTimerRef.current = setTimeout(advance, STATUS_STEPS[stepIndex].duration)
    }

    statusTimerRef.current = setTimeout(advance, STATUS_STEPS[0].duration)
  }

  function stopStatusAnimation(msgId: string, done: boolean) {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    activeStatusIdRef.current = null
    setMessages((prev) => prev.map((m) =>
      m.id === msgId && m.type === "status" ? { ...m, done } : m
    ))
  }

  React.useEffect(() => {
    function handleRenderDone(e: Event) {
      const ce = e as CustomEvent<{ render_id: string | number; video_path?: string }>
      const renderId = ce.detail?.render_id
      const statusMsg = activeStatusIdRef.current
      if (statusMsg) stopStatusAnimation(statusMsg, true)
      setLoading(false)
      setMessage("")
      setAdjustMode(true)
      if (renderId) {
        setMessages((prev) => [
          ...prev,
          { type: "video", renderId, signedUrl: null, id: uid() },
        ])
      }
    }

    function handleRenderFailed() {
      const statusMsg = activeStatusIdRef.current
      if (statusMsg) stopStatusAnimation(statusMsg, false)
      setLoading(false)
      setMessage("")
      setAdjustMode(false)
      setMessages((prev) => [
        ...prev,
        { type: "error", text: "Something went wrong. Please try again.", id: uid() },
      ])
    }

    function handleRenderStarted(e: Event) {
      const ce = e as CustomEvent<{ render_id: string | number }>
      if (ce.detail?.render_id) setLastRenderId(ce.detail.render_id)
      setAdjustMode(false)
    }

    window.addEventListener("pegasxs-render-done", handleRenderDone)
    window.addEventListener("pegasxs-render-failed", handleRenderFailed)
    window.addEventListener("pegasxs-render-started", handleRenderStarted)
    return () => {
      window.removeEventListener("pegasxs-render-done", handleRenderDone)
      window.removeEventListener("pegasxs-render-failed", handleRenderFailed)
      window.removeEventListener("pegasxs-render-started", handleRenderStarted)
    }
  }, [])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "26px"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const remainingSlots = MAX_IMAGES - uploadedImages.length
    if (remainingSlots <= 0) { setMessage(`Maximum ${MAX_IMAGES} images allowed.`); return }
    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setUploading(true); setMessage("")
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) { setMessage("You must be logged in to upload images."); setUploading(false); return }
      const newImages: { url: string; name: string }[] = []
      for (const file of filesToUpload) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { setMessage(`"${file.name}" is too large (max ${MAX_FILE_SIZE_MB}MB).`); continue }
        if (!file.type.startsWith("image/")) { setMessage(`"${file.name}" is not an image.`); continue }
        const ext = file.name.split(".").pop() || "png"
        const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: uploadError } = await supabase.storage.from("user-assets").upload(filename, file, { contentType: file.type, upsert: false })
        if (uploadError) { setMessage(`Upload failed: ${uploadError.message}`); continue }
        const { data: publicUrlData } = supabase.storage.from("user-assets").getPublicUrl(filename)
        newImages.push({ url: publicUrlData.publicUrl, name: file.name })
      }
      setUploadedImages((prev) => [...prev, ...newImages])
      if (newImages.length > 0) setMessage("")
    } catch (err: any) {
      setMessage(err?.message || "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleRemoveImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleAdjust() {
    const cleanScript = script.trim()
    if (!cleanScript) { setMessage("Describe what you want to change."); return }
    const renderId = lastRenderIdRef.current
    if (!renderId) { setMessage("No video to adjust."); return }

    setLoading(true); setMessage("")
    if (!hasSubmitted) { setHasSubmitted(true); onFirstSubmit?.() }

    setMessages((prev) => [...prev, { type: "user", text: cleanScript, id: uid() }])

    const statusId = uid()
    setMessages((prev) => [...prev, {
      type: "status",
      steps: STATUS_STEPS.map((s) => s.label),
      activeStep: 0,
      done: false,
      id: statusId,
    }])
    startStatusAnimation(statusId)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { setMessage("You must be logged in."); setLoading(false); return }

      const response = await fetch("https://api.pegasxs.com/render-v3-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ original_render_id: renderId, adjust_prompt: cleanScript }),
      })
      const result = await response.json()

      if (response.status === 429 && result.limitReached) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: result.error || "Weekly render limit reached.", id: uid() }])
        setLoading(false); return
      }
      if (!response.ok || !result.render_id) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: result.error || "Adjustment failed.", id: uid() }])
        setLoading(false); return
      }

      window.dispatchEvent(new CustomEvent("pegasxs-render-started", { detail: { render_id: result.render_id } }))
      setScript("")
      if (textareaRef.current) textareaRef.current.style.height = "26px"
    } catch (err: any) {
      stopStatusAnimation(statusId, false)
      setMessages((prev) => [...prev, { type: "error", text: err?.message || "Unknown error", id: uid() }])
      setLoading(false)
    }
  }

  async function handleNewRender() {
    const cleanScript = script.trim()
    if (!cleanScript) { setMessage("Please enter a script first."); return }

    setLoading(true); setMessage("")
    if (!hasSubmitted) { setHasSubmitted(true); onFirstSubmit?.() }

    setMessages((prev) => [...prev, { type: "user", text: cleanScript, id: uid() }])

    const statusId = uid()
    setMessages((prev) => [...prev, {
      type: "status",
      steps: STATUS_STEPS.map((s) => s.label),
      activeStep: 0,
      done: false,
      id: statusId,
    }])
    startStatusAnimation(statusId)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: "Session error: " + sessionError.message, id: uid() }])
        setLoading(false); return
      }

      const token = sessionData.session?.access_token
      const user = sessionData.session?.user
      if (!token || !user) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: "You must be logged in.", id: uid() }])
        setLoading(false); return
      }

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions").select("subscription_status, trial_ends_at").eq("user_id", user.id).single()
      if (subError || !subscription) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: "No subscription record found.", id: uid() }])
        setLoading(false); return
      }

      const now = new Date()
      const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null
      const hasActiveSubscription = subscription.subscription_status === "active"
      const hasActiveTrial = trialEndsAt !== null && trialEndsAt > now
      if (!hasActiveSubscription && !hasActiveTrial) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: "Your free trial expired or you have no active subscription.", id: uid() }])
        setLoading(false); return
      }

      const urlRegex = /https?:\/\/[^\s]+/i
      const urlMatch = cleanScript.match(urlRegex)
      let brandContext: any = null
      let scriptToSend = cleanScript

      if (urlMatch) {
        const detectedUrl = urlMatch[0].replace(/[.,;:!?)\]}"']+$/, "")
        try {
          const brandResponse = await fetch("https://api.pegasxs.com/extract-brand", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ url: detectedUrl }),
          })
          const brandResult = await brandResponse.json()
          if (brandResponse.ok && brandResult.ok) {
            brandContext = brandResult.brand
            scriptToSend = cleanScript.replace(urlMatch[0], "").replace(/\s+/g, " ").trim()
          }
        } catch {}
      }

      const renderBody: any = { script: scriptToSend, image_urls: uploadedImages.map((img) => img.url) }
      if (brandContext) renderBody.brand_context = brandContext

      const response = await fetch("https://api.pegasxs.com/render-v3", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(renderBody),
      })
      const result = await response.json()

      if (response.status === 429 && result.limitReached) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: result.error || "Weekly render limit reached.", id: uid() }])
        setLoading(false); return
      }
      if (!response.ok || !result.render_id) {
        stopStatusAnimation(statusId, false)
        setMessages((prev) => [...prev, { type: "error", text: result.error || "Request failed", id: uid() }])
        setLoading(false); return
      }

      await supabase.from("renders").update({ prompt: cleanScript }).eq("id", result.render_id)
      window.dispatchEvent(new CustomEvent("pegasxs-render-started", { detail: { render_id: result.render_id } }))
      setScript("")
      setUploadedImages([])
      if (textareaRef.current) textareaRef.current.style.height = "26px"
    } catch (err: any) {
      stopStatusAnimation(statusId, false)
      setMessages((prev) => [...prev, { type: "error", text: err?.message || "Unknown error", id: uid() }])
      setLoading(false)
    }
  }

  function handleClick() {
    if (adjustMode) handleAdjust()
    else handleNewRender()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!loading) handleClick() }
  }

  const placeholderText = loading
    ? "Rendering..."
    : adjustMode
    ? "Describe what to change..."
    : "Insert your script here..."

  return (
    <>
      <style>{`
        @keyframes pegasxs-dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .render-bar textarea::placeholder {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          color: var(--ink-mute);
          opacity: 1;
        }
      `}</style>

      {messages.length > 0 && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          bottom: 120,
          overflowY: "auto",
          padding: "80px 24px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div style={{
            width: "min(760px, calc(100vw - 32px))",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}>

            {messages.map((msg) => {
              if (msg.type === "user") {
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", paddingLeft: "40%" }}>
                    <div style={{
                      background: "var(--ink)",
                      color: "var(--paper)",
                      borderRadius: "18px 18px 4px 18px",
                      padding: "12px 16px",
                      fontSize: 15,
                      lineHeight: 1.5,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                )
              }

              if (msg.type === "status") {
                const currentStep = STATUS_STEPS[msg.activeStep]
                return (
                  <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingRight: "40%" }}>
                    <PegasxsAvatar />
                    <div style={{
                      background: "var(--paper-deep)",
                      border: "1px solid var(--line)",
                      borderRadius: "18px 18px 18px 4px",
                      padding: "12px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      minWidth: 200,
                    }}>
                      {msg.done ? (
                        <span style={{ color: "var(--ink-soft)", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
                          ✓ Video ready
                        </span>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <TypingDots />
                            <span style={{ color: "var(--ink)", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
                              {currentStep?.label || "Working..."}
                            </span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            {STATUS_STEPS.map((step, i) => (
                              <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 8,
                                opacity: i <= msg.activeStep ? 1 : 0.3,
                                transition: "opacity 0.4s ease",
                              }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                                  background: i < msg.activeStep ? "#22c55e" : i === msg.activeStep ? "var(--ink)" : "var(--line-strong)",
                                  transition: "background 0.4s ease",
                                }} />
                                <span style={{
                                  fontFamily: "Inter, sans-serif", fontSize: 12,
                                  color: i < msg.activeStep ? "#22c55e" : "var(--ink-soft)",
                                  transition: "color 0.4s ease",
                                }}>
                                  {step.label.replace("...", "")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              }

              if (msg.type === "video") {
                return (
                  <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingRight: "40%" }}>
                    <PegasxsAvatar />
                    <div>
                      <VideoBubble renderId={msg.renderId} signedUrl={msg.signedUrl} />
                    </div>
                  </div>
                )
              }

              if (msg.type === "error") {
                return (
                  <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingRight: "40%" }}>
                    <PegasxsAvatar />
                    <div style={{
                      background: "var(--paper-deep)",
                      border: "1px solid var(--line)",
                      borderRadius: "18px 18px 18px 4px",
                      padding: "12px 16px",
                      fontSize: 14,
                      fontFamily: "Inter, sans-serif",
                      color: "#ef4444",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                )
              }

              return null
            })}

            <div ref={chatBottomRef} />
          </div>
        </div>
      )}

      <div
        className="render-bar"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "32px",
          transform: "translateX(-50%)",
          width: "min(760px, calc(100vw - 32px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 50,
        }}
      >
        {adjustMode && !loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            borderRadius: 999, padding: "6px 14px",
            fontSize: 12, color: "var(--ink-soft)",
            fontFamily: "Inter, sans-serif",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            Adjusting last video —
            <button
              onClick={() => { setAdjustMode(false); setScript("") }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", fontFamily: "inherit", fontSize: 12, padding: 0, textDecoration: "underline" }}
            >
              start new render
            </button>
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            {uploadedImages.map((img, idx) => (
              <div key={img.url} style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line-strong)", background: "var(--paper-deep)" }}>
                <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  aria-label="Remove image"
                  style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "white", fontSize: 12, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          position: "relative", width: "100%", minHeight: 64,
          borderRadius: 9999,
          border: adjustMode ? "1.5px solid #22c55e" : "1.5px solid var(--ink)",
          background: "var(--paper)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center",
          paddingLeft: 60, paddingRight: 78, paddingTop: 18, paddingBottom: 18,
          transition: "border-color 0.2s ease",
        }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: "none" }} />

          {!adjustMode && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading || uploadedImages.length >= MAX_IMAGES}
              aria-label="Upload images"
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: "transparent", color: "var(--ink-mute)",
                cursor: uploadedImages.length >= MAX_IMAGES ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, opacity: uploadedImages.length >= MAX_IMAGES ? 0.3 : 1,
              }}
            >
              {uploading ? (
                <span style={{ fontSize: 18, fontWeight: 700 }}>…</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}

          {adjustMode && (
            <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <textarea
            ref={textareaRef}
            placeholder={placeholderText}
            value={script}
            onChange={(e) => { setScript(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
            style={{
              width: "100%", height: 26, minHeight: 26, maxHeight: 200,
              border: "none", outline: "none", resize: "none", overflowY: "auto",
              background: "transparent", color: "var(--ink)",
              fontSize: 18, lineHeight: "26px",
              fontFamily: "Inter, sans-serif", padding: 0,
            }}
          />

          <button
            onClick={handleClick}
            disabled={loading}
            aria-label={loading ? "Rendering" : adjustMode ? "Apply adjustment" : "Generate video"}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 46, height: 46, borderRadius: "50%",
              border: "1px solid var(--line-strong)",
              background: loading ? "var(--paper-deep)" : adjustMode ? "#22c55e" : "var(--ink)",
              color: loading ? "var(--ink)" : "var(--paper)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 0,
            }}
          >
            {loading ? (
              <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 700 }}>…</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 11L12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {message && (
          <div style={{
            minHeight: 20, color: "var(--ink-soft)", fontSize: 14,
            lineHeight: 1.4, textAlign: "center", whiteSpace: "pre-wrap", paddingInline: 8,
          }}>
            {message}
          </div>
        )}
      </div>
    </>
  )
}