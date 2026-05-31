"use client"
import * as React from "react"
import Nav from "@/components/Nav"
import UserLibrary from "@/components/UserLibrary"
import { supabase } from "@/lib/supabaseClient"

const EXAMPLE_VIDEOS = [
  {
    src: "https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/finance.mp4",
    title: "Revenue Trajectory",
    cat: "Finance",
    fmt: "16:9 · MP4",
    num: "i",
  },
  {
    src: "https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/politics.mp4",
    title: "Democracy is Changing",
    cat: "Politics",
    fmt: "16:9 · MP4",
    num: "ii",
  },
  {
    src: "https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/SaaS.mp4",
    title: "Ship in Minutes",
    cat: "SaaS",
    fmt: "16:9 · MP4",
    num: "iii",
  },
]

export default function LibraryPage() {
  const [activeTab, setActiveTab] = React.useState<"examples" | "yours">("examples")
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session))
  }, [])

  return (
    <>
      <Nav />

      {/* Video lightbox */}
      {activeVideo && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveVideo(null) }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{
            width: "min(960px, 100%)",
            background: "#000",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          }}>
            <video
              src={activeVideo}
              controls
              autoPlay
              style={{ width: "100%", maxHeight: "80vh", display: "block", objectFit: "contain" }}
            />
          </div>
          <button
            onClick={() => setActiveVideo(null)}
            style={{
              position: "fixed", top: 24, right: 24,
              width: 40, height: 40, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white", fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>
      )}

      <div style={{ paddingTop: 100 }}>
        <section className="reel" style={{ paddingTop: 60 }}>
          <div className="wrap">
            <div className="section-head reveal">
              <h2>The <em>full library.</em></h2>
              <p>Every style, every format. Browse examples or switch to your own renders.</p>
            </div>

            {/* Tab controls */}
            <div className="library-controls">
              <div className="tab-bar">
                <button
                  className={`tab ${activeTab === "examples" ? "active" : ""}`}
                  onClick={() => setActiveTab("examples")}
                >
                  Examples <span className="count">3</span>
                </button>
                <button
                  className={`tab ${activeTab === "yours" ? "active" : ""}`}
                  onClick={() => setActiveTab("yours")}
                >
                  Your videos
                </button>
              </div>
            </div>

            {/* Examples tab */}
            {activeTab === "examples" && (
              <div className="library-grid" style={{ paddingTop: 48 }}>
                {EXAMPLE_VIDEOS.map((v, i) => (
                  <div key={i} className="video-card" onClick={() => setActiveVideo(v.src)} style={{ cursor: "pointer" }}>
                    <div className="video-thumb" style={{ position: "relative", overflow: "hidden" }}>
                      <span className="vbadge featured">EXAMPLE</span>
                      {/* Autoplay muted loop as thumbnail */}
                      <video
                        src={v.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          position: "absolute",
                          inset: 0,
                        }}
                      />
                      <div className="play"><div className="play-icon"></div></div>
                    </div>
                    <div className="video-meta">
                      <div className="vnum">Nº {v.num}</div>
                      <div className="vtitle">{v.title}</div>
                      <div className="vsub">
                        <span>{v.cat}</span>
                        <span className="dot"></span>
                        <span>{v.fmt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Your videos tab */}
            {activeTab === "yours" && (
              isLoggedIn ? (
                <UserLibrary />
              ) : (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 15, color: "var(--ink-mute)", marginBottom: 24 }}>
                    Sign in to see your rendered videos.
                  </p>
                  <a href="/login" className="btn">Sign in <span className="arrow">→</span></a>
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <footer>
        <div className="wrap">
          <div className="foot-bottom" style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
            <div>© 2026 Pegasxs Studio</div>
            <div className="right"><a href="/">Home</a><a href="/studio">Studio</a></div>
          </div>
        </div>
      </footer>
    </>
  )
}
