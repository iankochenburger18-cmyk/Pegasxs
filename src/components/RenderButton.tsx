"use client"
import * as React from "react"
import { supabase } from "@/lib/supabaseClient"

const MAX_IMAGES = 5
const MAX_FILE_SIZE_MB = 5

export default function RenderButton() {
  const [script, setScript] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [uploadedImages, setUploadedImages] = React.useState<{ url: string; name: string }[]>([])
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Adjust mode — set when a render completes
  const [adjustMode, setAdjustMode] = React.useState(false)
  const [lastRenderId, setLastRenderId] = React.useState<string | number | null>(null)
  // Use refs so event handlers always see latest values
  const lastRenderIdRef = React.useRef<string | number | null>(null)
  const adjustModeRef = React.useRef(false)

  // Keep refs in sync with state
  React.useEffect(() => { lastRenderIdRef.current = lastRenderId }, [lastRenderId])
  React.useEffect(() => { adjustModeRef.current = adjustMode }, [adjustMode])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "26px"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }

  // Listen for render events
  React.useEffect(() => {
    function handleRenderDone() {
      setLoading(false)
      setMessage("")
      setAdjustMode(true)  // switch to adjust mode on completion
    }
    function handleRenderFailed() {
      setLoading(false)
      setMessage("Render failed. Please try again.")
      setAdjustMode(false)
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

  // Adjust submit — sends to /render-v3-adjust
  async function handleAdjust() {
    const cleanScript = script.trim()
    if (!cleanScript) { setMessage("Describe what you want to change."); return }
    const renderId = lastRenderIdRef.current
    if (!renderId) { setMessage("No video to adjust."); return }

    setLoading(true); setMessage("")
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { setMessage("You must be logged in."); setLoading(false); return }

      const response = await fetch("https://api.pegasxs.com/render-v3-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          original_render_id: renderId,
          adjust_prompt: cleanScript,
        }),
      })

      const result = await response.json()

      if (response.status === 429 && result.limitReached) {
        setMessage(result.error || "Weekly render limit reached.")
        setLoading(false); return
      }

      if (!response.ok || !result.render_id) {
        setMessage(result.error || "Adjustment failed.")
        setLoading(false); return
      }

      window.dispatchEvent(new CustomEvent("pegasxs-render-started", { detail: { render_id: result.render_id } }))
      setMessage("Rendering adjustment...")
      setScript("")
      if (textareaRef.current) textareaRef.current.style.height = "26px"
    } catch (err: any) {
      setMessage(err?.message || "Unknown error")
      setLoading(false)
    }
  }

  // New render submit
  async function handleNewRender() {
    setLoading(true); setMessage("")
    try {
      const cleanScript = script.trim()
      if (!cleanScript) { setMessage("Please enter a script first."); setLoading(false); return }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) { setMessage("Session error: " + sessionError.message); setLoading(false); return }

      const token = sessionData.session?.access_token
      const user = sessionData.session?.user
      if (!token || !user) { setMessage("You must be logged in."); setLoading(false); return }

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions").select("subscription_status, trial_ends_at").eq("user_id", user.id).single()
      if (subError || !subscription) { setMessage("No subscription record found."); setLoading(false); return }

      const now = new Date()
      const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null
      const hasActiveSubscription = subscription.subscription_status === "active"
      const hasActiveTrial = trialEndsAt !== null && trialEndsAt > now
      if (!hasActiveSubscription && !hasActiveTrial) {
        setMessage("Your free trial expired or you have no active subscription.")
        setLoading(false); return
      }

      const urlRegex = /https?:\/\/[^\s]+/i
      const urlMatch = cleanScript.match(urlRegex)
      let brandContext: any = null
      let scriptToSend = cleanScript

      if (urlMatch) {
        const detectedUrl = urlMatch[0].replace(/[.,;:!?)\]}"']+$/, "")
        setMessage(`Reading brand from ${detectedUrl}...`)
        try {
          const brandResponse = await fetch("https://api.pegasxs.com/extract-brand", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ url: detectedUrl }),
          })
          const brandResult = await brandResponse.json()
          if (!brandResponse.ok || !brandResult.ok) {
            setMessage(`Couldn't read ${detectedUrl}: ${brandResult.error || "extraction failed"}.`)
            setLoading(false); return
          }
          brandContext = brandResult.brand
          scriptToSend = cleanScript.replace(urlMatch[0], "").replace(/\s+/g, " ").trim()
        } catch (err: any) {
          setMessage(`Couldn't read ${detectedUrl}: ${err?.message || "network error"}.`)
          setLoading(false); return
        }
      }

      setMessage("Starting render...")

      const renderBody: any = { script: scriptToSend, image_urls: uploadedImages.map((img) => img.url) }
      if (brandContext) renderBody.brand_context = brandContext

      const response = await fetch("https://api.pegasxs.com/render-v3", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(renderBody),
      })

      const result = await response.json()

      if (response.status === 429 && result.limitReached) {
        setMessage(result.error || "Weekly render limit reached. Resets Monday at midnight UTC.")
        setLoading(false); return
      }

      if (!response.ok || !result.render_id) {
        setMessage(result.error || "Request failed")
        setLoading(false); return
      }

      await supabase.from("renders").update({ prompt: cleanScript }).eq("id", result.render_id)

      window.dispatchEvent(new CustomEvent("pegasxs-render-started", { detail: { render_id: result.render_id } }))
      setMessage("Rendering...")
      setScript("")
      setUploadedImages([])
      if (textareaRef.current) textareaRef.current.style.height = "26px"
    } catch (err: any) {
      console.error("Render error:", err)
      setMessage(err?.message || "Unknown error")
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
    ? "Describe what to change — make it faster, add a logo, change the background..."
    : "Insert your script here..."

  return (
    <>
      <style>{`
        .render-bar textarea::placeholder {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          color: var(--ink-mute);
          opacity: 1;
        }
      `}</style>

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
        {/* Adjust mode label */}
        {adjustMode && !loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 12,
            color: "var(--ink-soft)",
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

        {/* Image thumbnails */}
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

        {/* Input bar */}
        <div style={{
          position: "relative",
          width: "100%",
          minHeight: 64,
          borderRadius: 9999,
          border: adjustMode ? "1.5px solid #22c55e" : "1.5px solid var(--ink)",
          background: "var(--paper)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 60,
          paddingRight: 78,
          paddingTop: 18,
          paddingBottom: 18,
          transition: "border-color 0.2s ease",
        }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: "none" }} />

          {/* Paperclip — hidden in adjust mode */}
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

          {/* Adjust icon in adjust mode */}
          {adjustMode && (
            <div style={{
              position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
              color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

        <div style={{
          minHeight: 20, color: "var(--ink-soft)", fontSize: 14,
          lineHeight: 1.4, textAlign: "center", whiteSpace: "pre-wrap", paddingInline: 8,
        }}>
          {message}
        </div>
      </div>
    </>
  )
}
