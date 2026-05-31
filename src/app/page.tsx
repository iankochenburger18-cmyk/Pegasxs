"use client"
import Nav from "@/components/Nav"
import { useEffect, useRef } from "react"

export default function HomePage() {
  const progRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const preload = document.getElementById("preload")
    const timer = setTimeout(() => { if (preload) preload.classList.add("gone") }, 1500)

    const handleScroll = () => {
      const h = document.documentElement
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight)
      if (progRef.current) progRef.current.style.width = (p * 100) + "%"
    }
    window.addEventListener("scroll", handleScroll)

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target) } })
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    document.querySelectorAll(".reveal").forEach(el => io.observe(el))

    // Manifesto — words already rendered as .w spans in JSX, just hook scroll
    const mft = document.getElementById("manifestoText")
    if (mft) {
      const words = mft.querySelectorAll(".w")
      const handleManifestoScroll = () => {
        const rect = mft.getBoundingClientRect()
        const vh = window.innerHeight
        const start = vh * 0.85
        const end = vh * 0.25
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))
        const litCount = Math.floor(progress * words.length)
        words.forEach((w, i) => w.classList.toggle("lit", i < litCount))
      }
      window.addEventListener("scroll", handleManifestoScroll)
    }

    document.querySelectorAll(".faq-item").forEach(item => {
      item.addEventListener("click", () => item.classList.toggle("open"))
    })

    const cIO = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return
        const el = en.target as HTMLElement
        const target = parseFloat(el.dataset.target || "0")
        const decimals = parseInt(el.dataset.decimals || "0", 10)
        const useComma = el.dataset.comma === "1"
        const dur = 1800; const start = performance.now()
        function step(t: number) {
          const p = Math.min(1, (t - start) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          const val = target * eased
          const fmt = decimals > 0 ? val.toFixed(decimals) : useComma ? Math.round(val).toLocaleString("en-US").replace(/,/g, "'") : String(Math.round(val))
          el.textContent = fmt
          if (p < 1) requestAnimationFrame(step)
          else el.textContent = decimals > 0 ? target.toFixed(decimals) : useComma ? target.toLocaleString("en-US").replace(/,/g, "'") : String(target)
        }
        requestAnimationFrame(step)
        cIO.unobserve(el)
      })
    }, { threshold: 0.5 })
    document.querySelectorAll(".counter").forEach(el => cIO.observe(el))

    document.querySelectorAll(".plan, .cap-card").forEach(card => {
      (card as HTMLElement).classList.add("tilt")
      card.addEventListener("mousemove", (e) => {
        const ev = e as MouseEvent
        const r = (card as HTMLElement).getBoundingClientRect()
        const x = (ev.clientX - r.left) / r.width
        const y = (ev.clientY - r.top) / r.height
        ;(card as HTMLElement).style.transform = `perspective(900px) rotateX(${(y - 0.5) * -5}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-4px)`
      })
      card.addEventListener("mouseleave", () => { (card as HTMLElement).style.transform = "" })
    })

    const heroFrame = document.querySelector(".hero-frame") as HTMLElement
    const heroDisplay = document.querySelector(".hero-display") as HTMLElement
    const handleParallax = () => {
      const y = window.scrollY
      if (heroFrame && y < 1200) heroFrame.style.transform = `translateY(${y * 0.06}px)`
      if (heroDisplay && y < 1200) heroDisplay.style.transform = `translateY(${y * -0.04}px)`
    }
    window.addEventListener("scroll", handleParallax)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("scroll", handleParallax)
    }
  }, [])

  const manifestoWords: (string | { em: string })[] = [
    "We", "believe", "motion", "should", "be", "made", "of",
    { em: "intention" }, ",", "not", "interpolation.", "That", "a",
    "sequence", "ought", "to", "feel", "composed", "—", "not",
    "generated.", "Pegasxs", "is", "the", "studio", "we", "wished",
    "we", "had,", "distilled", "into", "a", "sentence", "you", "can", "type."
  ]

  return (
    <>
      <div className="preload" id="preload">
        <img className="logo-img" src="/logo.png" alt="Pegasxs" />
        <div className="name">
          <span className="lt">p</span><span className="lt">e</span><span className="lt">g</span>
          <span className="lt">a</span><span className="lt">s</span><span className="lt">x</span><span className="lt">s</span>
        </div>
      </div>

      <div ref={progRef} className="progress" id="prog"></div>
      <Nav />

      <section className="hero" id="top">
        <div className="wrap">
          <div className="hero-meta">
            <div className="vol"><em>Pegasxs Studio</em></div>
          </div>
          <h1 className="hero-display">
            <span className="row"><span className="word">Motion</span></span>
            <span className="row"><em><span className="word">that&nbsp;thinks</span></em></span>
            <span className="row"><span className="word">in&nbsp;frames.</span></span>
          </h1>
          <div className="hero-foot">
            <div className="col">
              <h6>The thesis</h6>
              <p>Pegasxs turns a sentence into <em>cinema-grade</em> motion — typography that breathes, transitions composed by intention, sequences that move the way you would have, given forty more hours.</p>
            </div>
            <div className="col hero-cta-row" style={{ gridColumn: "span 2", justifySelf: "end" }}>
              <a href="#cta-final" className="btn">Begin <span className="arrow">→</span></a>
              <a href="/library" className="btn btn-ghost">See the library</a>
            </div>
          </div>
          <div className="hero-frame" style={{ aspectRatio: "16/9", height: "auto" }}>
            <span className="caption"><span className="rec"></span> Live · <em>rendered right now</em></span>
            <span className="badge"><span>Composition</span><span className="num">i.</span></span>
            <video
              src="https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/pega-comm.mp4"
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }}
            />
          </div>
        </div>
      </section>

      <section className="manifesto">
        <div className="wrap">
          <div className="manifesto-label reveal">A note from the studio</div>
          <p className="manifesto-text" id="manifestoText">
            {manifestoWords.map((word, i) =>
              typeof word === "string"
                ? <span key={i} className="w">{word}{" "}</span>
                : <em key={i} className="w">{word.em}{" "}</em>
            )}
          </p>
        </div>
      </section>

      <section className="stats">
        <div className="wrap">
          <div className="stats-head">Numbers, as of this morning</div>
          <div className="stats-grid">
            <div className="stat reveal"><div className="num">~<span className="counter" data-target="4">0</span><em>min</em></div><div className="label"><em>average</em> render time, prompt to export</div></div>
            <div className="stat reveal"><div className="num"><span className="counter" data-target="1384" data-comma="1">0</span></div><div className="label"><em>videos</em> rendered last month</div></div>
            <div className="stat reveal"><div className="num"><em style={{ fontSize: "0.5em", verticalAlign: "top", color: "rgba(255,255,255,0.5)" }}>$</em><span className="counter" data-target="0.15" data-decimals="2">0</span></div><div className="label">average cost per video, <em>Pro Plan</em></div></div>
          </div>
        </div>
      </section>

      <section className="reel" id="library">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>A room of <em>moving things.</em></h2>
            <p>A glimpse of what&apos;s been made — open the library for the full collection.</p>
          </div>
          <div className="library-grid reveal">
            {[
              { src: "https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/finance.mp4",   num: "i",   title: "Revenue Trajectory",    cat: "Finance",  fmt: "16:9 · MP4" },
              { src: "https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/politics.mp4", num: "ii",  title: "Democracy is Changing", cat: "Politics", fmt: "16:9 · MP4" },
              { src: "https://fligzjyywdcbyqjwcuku.supabase.co/storage/v1/object/public/library/SaaS.mp4",     num: "iii", title: "Ship in Minutes",       cat: "SaaS",     fmt: "16:9 · MP4" },
            ].map((v, i) => (
              <div key={i} className="video-card">
                <div className="video-thumb" style={{ position: "relative", overflow: "hidden" }}>
                  <span className="vbadge featured">FEATURED</span>
                  <video
                    src={v.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div className="play"><div className="play-icon"></div></div>
                </div>
                <div className="video-meta">
                  <div className="vnum">Nº {v.num}</div>
                  <div className="vtitle">{v.title}</div>
                  <div className="vsub"><span>{v.cat}</span><span className="dot"></span><span>{v.fmt}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: 56 }}>
            <a href="/library" className="btn">Open the library <span className="arrow">→</span></a>
          </div>
        </div>
      </section>

      <section className="chapters" id="chapters">
        <div className="wrap">
          <div className="section-head reveal" style={{ marginBottom: 40 }}>
            <h2>Bring <em>anything</em> in.<br />Take it <em>anywhere.</em></h2>
            <p>Pegasxs is open at every edge. Drop in your own footage, pull in inspiration from the web, and keep refining long after the first render.</p>
          </div>
          <div className="cap-grid">
            <article className="cap-card reveal">
              <div className="cap-num">i.</div>
              <h3>Import images <em>&amp; videos.</em></h3>
              <p>Bring your own footage and stills into the canvas. Pegasxs reads them as <em>first-class layers</em> — composable, gradable, animatable.</p>
              <div className="cap-demo import"><div className="file"></div><div className="file"></div><div className="file"></div></div>
            </article>
            <article className="cap-card reveal">
              <div className="cap-num">ii.</div>
              <h3>Paste a URL, <em>fetch the scene.</em></h3>
              <p>Drop in any link — a brand page, a Behance project — and Pegasxs pulls the assets, the palette, the typography into your composition.</p>
              <div className="cap-demo url"><div className="bar">https://&nbsp;<span className="caret"></span></div></div>
            </article>
            <article className="cap-card reveal">
              <div className="cap-num">iii.</div>
              <h3>Adjust <em>after the render.</em></h3>
              <p>Nothing is ever final. Re-time a clip, swap a palette, rewrite a line of motion — Pegasxs re-renders only what changed, in seconds.</p>
              <div className="cap-demo edit"><div className="track"><div className="knob"></div></div></div>
            </article>
          </div>
        </div>
      </section>

      <section className="process">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Three steps. <em>One render.</em></h2>
            <p>No timeline panel. No keyframes. No twelve-tab workflow. Just a quiet space where ideas become moving images.</p>
          </div>
          <div className="steps">
            <div className="step reveal"><div className="ico">i</div><h4>Describe</h4><p>Write a prompt — a mood, a phrase, a brand line. Or paste a reference and let Pegasxs <em>read between the frames.</em></p></div>
            <div className="step reveal"><div className="ico">ii</div><h4>Render</h4><p>Pegasxs composes the scene — timing, easing, palette, motion curves. A first draft, <em>in seconds.</em></p></div>
            <div className="step reveal"><div className="ico">iii</div><h4>Deliver</h4><p>Export in your codec, or push directly into Figma, Webflow, Premiere, and After Effects. <em>One click.</em></p></div>
          </div>
        </div>
      </section>

      <section className="quote">
        <div className="wrap">
          <p className="quote-text reveal">&ldquo;Pegasxs is the first tool that <em>doesn&apos;t</em> feel like a tool. It feels like a quieter version of the work.&rdquo;</p>
          <div className="quote-meta reveal">
            <div className="ava">M</div>
            <div><strong>Mira Hessen</strong> — Design Director, Linear<br /><span style={{ fontSize: 13, color: "var(--ink-mute)" }}>Switched from After Effects in Q3 2025</span></div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Pricing that <em>moves</em> with you.</h2>
            <p>Start free. Scale when the work does. Every plan ships with brand memory, real-time render, and unlimited exports.</p>
          </div>
          <div className="pricing-grid">
            <div className="plan reveal">
              <div className="plan-top"><div className="plan-name">Pro</div></div>
              <div className="price">$29<span className="cents">.95</span><em> / mo</em></div>
              <p className="tag">For working creators. <em>The standard.</em></p>
              <ul>
                <li><em>50</em> renders / week</li>
                <li>4K MP4 · ProRes export</li>
                <li>Lottie &amp; SVG export</li>
                <li>Cinema palettes &amp; presets</li>
                <li>Private project library</li>
                <li>~<em>$0.15</em> avg per video</li>
              </ul>
              <a href="/signup" className="btn btn-ghost">Start with Pro <span className="arrow">→</span></a>
            </div>
            <div className="plan dark reveal">
              <div className="plan-top"><div className="plan-name">Max</div><span className="badge">most chosen</span></div>
              <div className="price">$150<em> / mo</em></div>
              <p className="tag">For studios shipping in motion. <em>Built to scale.</em></p>
              <ul>
                <li><em>Unlimited</em> renders</li>
                <li>No weekly cap</li>
                <li>Priority GPU queue</li>
                <li>4K, ProRes, Lottie, SVG</li>
                <li>Brand kits &amp; team libraries</li>
                <li>API &amp; webhooks</li>
                <li>Dedicated success partner</li>
              </ul>
              <a href="/signup" className="btn">Upgrade to Max <span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Questions, <em>answered.</em></h2>
            <p>Still wondering? Reach out — a human will write back, usually before you finish your coffee.</p>
          </div>
          <div className="faq-list">
            {[
              { n: "i.", q: <>Do I need to know <em>motion design</em> to use Pegasxs?</>, a: "Not at all. Pegasxs is built for designers, marketers, and founders who think visually but don't want to live inside After Effects. If you can write a sentence, you can render a scene." },
              { n: "ii.", q: <>What <em>formats</em> can I export?</>, a: "Lottie, MP4 (H.264 / H.265), WebM, ProRes, animated WebP, and GIF. First-party plugins ship for After Effects, Figma, Webflow, and Framer." },
              { n: "iii.", q: <>Is my work <em>used to train</em> the model?</>, a: "Never. Your prompts, references, and renders stay yours. Studio and Team plans include private style presets that are isolated from the global model." },
              { n: "iv.", q: <>How does it compare to <em>traditional</em> tools?</>, a: "Pegasxs is complementary. Most customers use it to draft, explore, and ship 80% of routine motion work — and keep After Effects for hero compositions that deserve hand-craft." },
              { n: "v.", q: <>Can I <em>cancel</em> anytime?</>, a: "Yes. One click. No call. Exports you've already generated stay yours forever." },
            ].map((item, i) => (
              <div key={i} className="faq-item reveal">
                <div className="faq-n">{item.n}</div>
                <div><div className="faq-q">{item.q}</div><div className="faq-a">{item.a}</div></div>
                <div className="faq-tog">+</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-final" id="cta-final">
        <div className="wrap">
          <h2 className="reveal">Make something <em>move.</em></h2>
          <p className="reveal">Thirty free seconds. No credit card. Your first scene is roughly forty words away.</p>
          <a href="/signup" className="btn reveal">Start with Pegasxs <span className="arrow">→</span></a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <img src="/logo.png" alt="Pegasxs" style={{ width: 28, height: 28, objectFit: "contain" }} />
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>Pegasxs</span>
              </div>
              <p className="blurb">Motion, reimagined by intelligence.</p>
              <form className="foot-news" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" />
                <button type="submit">Subscribe</button>
              </form>
            </div>
            <div><h5>Product</h5><ul><li><a href="#chapters">Capabilities</a></li><li><a href="#pricing">Pricing</a></li><li><a href="/library">Library</a></li><li><a href="#">Changelog</a></li></ul></div>
            <div><h5>Company</h5><ul><li><a href="#">About</a></li><li><a href="#">Manifesto</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li></ul></div>
            <div><h5>Resources</h5><ul><li><a href="#">Docs</a></li><li><a href="#">API</a></li><li><a href="#">Templates</a></li><li><a href="#">Support</a></li></ul></div>
          </div>
          <div className="foot-mega">Pegasxs</div>
          <div className="foot-bottom">
            <div>© 2026 Pegasxs Studio — Made with <em style={{ color: "var(--ink)" }}>care</em>, in Zurich, Switzerland.</div>
            <div className="right"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Status</a><a href="#">Twitter</a></div>
          </div>
        </div>
      </footer>
    </>
  )
}
