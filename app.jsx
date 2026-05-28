// app.jsx — Retainly landing page with scroll-driven phone hero
const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Easing & interpolation helpers
// ─────────────────────────────────────────────────────────────
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t); // smoothstep
// Map x in [a,b] to [0,1], clamped
const range = (x, a, b) => clamp((x - a) / (b - a));
const easeRange = (x, a, b) => smooth(range(x, a, b));

// ─────────────────────────────────────────────────────────────
// Tweaks defaults
// ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "phoneScale": 0.78,
  "phoneOffsetY": 0,
  "scrollSpeed": 1.0,
  "headline": "Keep patients\ncoming back.",
  "subheadline": "The loyalty platform built for aesthetic clinics. Offers, payments, points and memberships in one beautifully simple app.",
  "screen1Title": "A unique offer for every patient.",
  "screen2Title": "Pay over time, glow today.",
  "screen3Title": "Points patients actually chase.",
  "screen4Title": "Recurring revenue, on autopilot."
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────
// Scroll hook: returns scrollY
// ─────────────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(typeof window !== 'undefined' ? window.scrollY : 0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return y;
}

function useViewport() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

// ─────────────────────────────────────────────────────────────
// Top nav
// ─────────────────────────────────────────────────────────────
function NavBar({ scrolled, hideT = 0 }) {
  // hideT goes 0 → 1 as the nav should disappear. Driven continuously by scroll,
  // so the slide-up tracks the user's scroll instead of stepping at a threshold.
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 32px',
      background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '0.5px solid #ececec' : '0.5px solid transparent',
      transform: `translateY(${-hideT * 100}%)`,
      opacity: 1 - hideT,
      pointerEvents: hideT > 0.5 ? 'none' : 'auto',
      transition: 'background 240ms ease, border-color 240ms ease',
      willChange: 'transform, opacity',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RetainlyLogo />
        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.5 }}>Retainly</span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 500, color: '#3a3a3a', whiteSpace: 'nowrap' }}>
        <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
        <a href="#clinics" style={{ color: 'inherit', textDecoration: 'none' }}>For clinics</a>
        <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a>
        <a href="#login" style={{ color: 'inherit', textDecoration: 'none' }}>Log in</a>
        <a href="#book" style={{
          background: '#0a0a0a', color: '#fff', padding: '10px 18px',
          borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 13.5,
        }}>Book a demo</a>
      </nav>
    </header>
  );
}

function RetainlyLogo() {
  return (
    <img
      src="retainly-logo.png"
      alt="Retainly"
      style={{ width: 30, height: 30, display: 'block', objectFit: 'contain' }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Phone — uses IOSDevice frame, swaps screen content
// ─────────────────────────────────────────────────────────────
function PhoneStage({ activeScreen, transform, opacity = 1 }) {
  const screens = window.RetainlyScreens;
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      transform, transformOrigin: 'center center',
      opacity, willChange: 'transform, opacity',
      transition: 'opacity 240ms ease',
    }}>
      <IPhone14Device screenWidth={402} screenHeight={874}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {screens.map((s, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              opacity: i === activeScreen ? 1 : 0,
              transform: `translateY(${i === activeScreen ? 0 : (i < activeScreen ? -20 : 20)}px)`,
              transition: 'opacity 420ms ease, transform 480ms cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: i === activeScreen ? 'auto' : 'none',
            }}>
              <s.Comp />
            </div>
          ))}
        </div>
      </IPhone14Device>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Liquid Glass Button
// ─────────────────────────────────────────────────────────────
function LiquidGlassButton({ href, children }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '14px 22px',
        borderRadius: 999,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 14.5,
        color: '#0a0a0a',
        background: 'linear-gradient(158deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.18) 55%, rgba(255,255,255,0.30) 100%)',
        backdropFilter: 'blur(48px) saturate(260%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(48px) saturate(260%) brightness(1.08)',
        border: '0.75px solid rgba(255,255,255,0.92)',
        boxShadow: pressed
          ? '0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.06)'
          : hovered
          ? '0 12px 36px rgba(0,0,0,0.13), 0 3px 10px rgba(0,0,0,0.09), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05), 0 0 0 0.5px rgba(255,255,255,0.4)'
          : '0 6px 24px rgba(0,0,0,0.09), 0 1.5px 5px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.04)',
        transform: pressed ? 'scale(0.97)' : hovered ? 'translateY(-1.5px)' : 'translateY(0)',
        transition: 'transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease, background 200ms ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* curved specular streak — simulates light catching a convex glass surface */}
      <span style={{
        position: 'absolute',
        top: 1,
        left: '10%',
        width: '52%',
        height: '48%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 100%)',
        borderRadius: '0 0 70% 70% / 0 0 100% 100%',
        pointerEvents: 'none',
        opacity: hovered ? 1 : 0.82,
        transition: 'opacity 200ms ease',
      }} />
      {children}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero copy & feature copy
// ─────────────────────────────────────────────────────────────
function HeroCopy({ opacity, translateY, headline, sub }) {
  return (
    <div style={{
      position: 'absolute', top: '13vh', left: 0, right: 0,
      textAlign: 'center', padding: '0 24px',
      opacity, transform: `translateY(${translateY}px)`,
      willChange: 'opacity, transform', pointerEvents: opacity > 0.1 ? 'auto' : 'none',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 999,
        border: '0.5px solid #ececec', background: '#fff',
        fontSize: 12.5, fontWeight: 500, color: '#3a3a3a',
      }}>
        <span style={{
          position: 'relative',
          width: 8, height: 8, borderRadius: 999,
          display: 'inline-flex',
        }}>
          <span style={{
            position: 'absolute', inset: 0, borderRadius: 999,
            background: '#FF3B7F',
            animation: 'retainly-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
            opacity: 0.75,
          }} />
          <span style={{
            position: 'relative', width: 8, height: 8, borderRadius: 999,
            background: '#FF3B7F',
          }} />
        </span>
        Now available on iOS
      </div>
      <h1 style={{
        margin: '20px auto 0', maxWidth: 900,
        fontSize: 'clamp(48px, 7.5vw, 104px)',
        fontWeight: 800, letterSpacing: -2.4, lineHeight: 0.98,
        color: '#0a0a0a', whiteSpace: 'pre-line',
      }}>{headline}</h1>
      <p style={{
        margin: '22px auto 0', maxWidth: 560,
        fontSize: 18, fontWeight: 400, lineHeight: 1.5, color: '#5a5a5a',
      }}>{sub}</p>
      <div style={{ marginTop: 30, display: 'inline-flex', gap: 12 }}>
        <a href="#download" style={{
          background: '#0a0a0a', color: '#fff', padding: '14px 22px',
          borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 14.5,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
            <path d="M11.6 8.3c0-1.8 1.5-2.7 1.5-2.7-.8-1.2-2.1-1.4-2.6-1.4-1.1-.1-2.1.6-2.7.6-.5 0-1.4-.6-2.4-.6-1.2 0-2.4.7-3 1.8-1.3 2.2-.3 5.5.9 7.3.6.9 1.3 1.9 2.3 1.8 1 0 1.3-.6 2.5-.6 1.2 0 1.4.6 2.5.6 1 0 1.7-.9 2.3-1.8.7-1 1-2.1 1-2.1s-2-.8-2.3-2.9zm-1.7-5.1c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.2-.5.5-.9 1.4-.8 2.3.9.1 1.7-.4 2.2-1.1z"/>
          </svg>
          Download for iOS
        </a>
        <LiquidGlassButton href="#demo">Book a demo →</LiquidGlassButton>
      </div>
    </div>
  );
}

function FeaturePane({ activeIdx, opacity }) {
  const screens = window.RetainlyScreens;
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%', maxWidth: 1280,
      padding: '0 60px', pointerEvents: 'none',
      opacity,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 0.85fr 1fr', alignItems: 'center',
        gap: 40, minHeight: '80vh',
      }}>
        {/* LEFT: counter + dot nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifySelf: 'end', paddingRight: 20 }}>
          <div style={{
            fontFamily: 'Barlow, sans-serif', fontWeight: 800,
            fontSize: 96, letterSpacing: -3, color: '#0a0a0a', lineHeight: 0.9,
          }}>
            0{activeIdx + 1}
            <span style={{ color: '#d6d6d6', fontWeight: 600 }}>/04</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {screens.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5,
                color: i === activeIdx ? '#0a0a0a' : '#9a9a9a',
                fontWeight: i === activeIdx ? 600 : 500,
                transition: 'color 300ms',
              }}>
                <div style={{
                  width: i === activeIdx ? 28 : 14, height: 2, borderRadius: 999,
                  background: i === activeIdx ? '#FF3B7F' : '#dcdcdc',
                  transition: 'all 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
                {s.eyebrow}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: empty — phone occupies this space */}
        <div />

        {/* RIGHT: active feature copy */}
        <div style={{ paddingLeft: 20, maxWidth: 420 }}>
          {screens.map((s, i) => (
            <div key={i} style={{
              position: i === activeIdx ? 'relative' : 'absolute',
              opacity: i === activeIdx ? 1 : 0,
              transform: `translateY(${i === activeIdx ? 0 : 16}px)`,
              transition: 'opacity 380ms ease, transform 440ms cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: i === activeIdx ? 'auto' : 'none',
            }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: '#FF3B7F',
                letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 14,
              }}>{s.eyebrow}</div>
              <h2 style={{
                margin: 0, fontSize: 'clamp(34px, 3.4vw, 52px)',
                fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.02, color: '#0a0a0a',
              }}>{s.title}</h2>
              <p style={{
                margin: '20px 0 0', fontSize: 17, lineHeight: 1.55, color: '#5a5a5a', fontWeight: 400,
              }}>{s.body}</p>
              <a href="#download" style={{
                marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#0a0a0a', color: '#fff',
                padding: '13px 22px', borderRadius: 999,
                textDecoration: 'none', fontWeight: 600, fontSize: 14.5,
                pointerEvents: 'auto',
              }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="#fff">
                  <path d="M11.6 8.3c0-1.8 1.5-2.7 1.5-2.7-.8-1.2-2.1-1.4-2.6-1.4-1.1-.1-2.1.6-2.7.6-.5 0-1.4-.6-2.4-.6-1.2 0-2.4.7-3 1.8-1.3 2.2-.3 5.5.9 7.3.6.9 1.3 1.9 2.3 1.8 1 0 1.3-.6 2.5-.6 1.2 0 1.4.6 2.5.6 1 0 1.7-.9 2.3-1.8.7-1 1-2.1 1-2.1s-2-.8-2.3-2.9zm-1.7-5.1c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.2-.5.5-.9 1.4-.8 2.3.9.1 1.7-.4 2.2-1.1z"/>
                </svg>
                Get your app
              </a>

              {i === 0 && (
                <div style={{
                  marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28,
                  borderTop: '1px solid #ececec', paddingTop: 24,
                }}>
                  <div>
                    <div style={{
                      fontSize: 38, fontWeight: 800, color: '#0a0a0a',
                      letterSpacing: -1.4, lineHeight: 1, marginBottom: 10,
                    }}>
                      +889<span style={{ color: '#FF3B7F' }}>%</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.4, fontWeight: 500 }}>
                      higher conversion rate than email or SMS
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: 38, fontWeight: 800, color: '#0a0a0a',
                      letterSpacing: -1.4, lineHeight: 1, marginBottom: 10,
                    }}>
                      2<span style={{ color: '#FF3B7F' }}>x</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.4, fontWeight: 500 }}>
                      higher spend when using points + cash
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile: just the active screen title, shown below the phone
// ─────────────────────────────────────────────────────────────
function MobileScreenTitle({ activeIdx, opacity, topPx }) {
  const screens = window.RetainlyScreens;
  if (!screens) return null;
  return (
    <div style={{
      position: 'absolute', top: topPx, left: 0, right: 0,
      textAlign: 'center', padding: '0 28px',
      opacity, willChange: 'opacity', pointerEvents: 'none',
    }}>
      {screens.map((s, i) => (
        <div key={i} style={{
          position: i === activeIdx ? 'relative' : 'absolute',
          inset: i === activeIdx ? 'auto' : 0,
          opacity: i === activeIdx ? 1 : 0,
          transform: `translateY(${i === activeIdx ? 0 : 8}px)`,
          transition: 'opacity 380ms ease, transform 440ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(22px, 6vw, 30px)',
            fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1, color: '#0a0a0a',
          }}>{s.title}</h2>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Scroll-driven hero stage
// ─────────────────────────────────────────────────────────────
function ScrollStage({ tweaks, stageRef }) {
  const scrollY = useScrollY();
  const { w: vw, h: vh } = useViewport();

  // total stage height in viewports — higher scrollSpeed = shorter stage = faster animation
  const STAGE_VH = 4.2 / (tweaks.scrollSpeed || 1);
  const stageHeight = vh * STAGE_VH;

  // progress through the stage
  const stageTop = stageRef.current ? stageRef.current.offsetTop : 0;
  const rawProgress = (scrollY - stageTop) / (stageHeight - vh);
  const p = clamp(rawProgress);

  // Phase breakpoints
  // 0.00 - 0.12: hero  (phone laying down at bottom, copy visible)
  // 0.12 - 0.22: flip up + rise to center
  // 0.22 - 0.36: screen 1
  // 0.36 - 0.50: screen 2
  // 0.50 - 0.64: screen 3
  // 0.64 - 0.78: screen 4
  // 0.78 - 0.90: phone exits up
  // 0.90 - 1.00: rest of page

  // ── Hero copy opacity ──
  const heroOpacity = 1 - easeRange(p, 0.02, 0.10);
  const heroTranslateY = lerp(0, -40, easeRange(p, 0.02, 0.12));

  // ── Phone transforms ──
  // Initial: rotateX 72deg (laying down toward viewer), translateY +50% of vh (at bottom, half off-screen)
  // After flip: rotateX 0deg, translateY 0 (centered)
  const flipT = easeRange(p, 0.04, 0.14);
  const rotateX = lerp(72, 0, flipT);

  const isMobile = vw < 768;

  // Responsive scale — cap by height and, on mobile, by width too so the phone never overflows.
  const fitScale = Math.max(0.45, Math.min(tweaks.phoneScale, (vh - 90) / 874, isMobile ? (vw - 20) / 402 : Infinity));
  // translateY in pixels — phone height after scaling.
  // At rest in the hero, the top edge of the (rotated) phone sits about 18% of the way up from
  // the viewport bottom — visible enough to invite scrolling, without competing with the hero copy.
  const phoneH = 874 * fitScale;
  const rotatedHalfH = phoneH * 0.16; // approx visual half-height when laid back at ~72°
  const heroPhoneTopY = vh * 0.82;     // where the phone's visible top edge sits at scrollY=0
  // Extra 50px nudge downward in the hero state, interpolated back to 0 as the phone rises.
  const heroOffsetY = (heroPhoneTopY - vh * 0.5 + rotatedHalfH) + 50;
  const phoneY = lerp(heroOffsetY, 0, flipT);

  // No forced exit animation — we let the sticky stage release naturally so the phone
  // scrolls up at the same speed as everything else and the next section follows immediately.
  const exitY = 0;

  const totalY = phoneY + exitY + (tweaks.phoneOffsetY || 0);

  // Scale — phone is 20% smaller in the hero, ramps up to full size as it flips and rises into the centre.
  const phoneScale = fitScale * lerp(0.80, 1.0, flipT);

  const transform = `translate(-50%, -50%) translateY(${totalY}px) rotateX(${rotateX}deg) scale(${phoneScale})`;

  // ── Active screen index ──
  // Spread the 4 screens evenly across the entire dwell phase — screen 4 stays visible right up to the end.
  const screenT = range(p, 0.14, 1.00);
  const activeScreen = clamp(Math.floor(screenT * 4), 0, 3);

  // ── Feature pane opacity (visible while phone is static) ──
  const featureOpacity = clamp(easeRange(p, 0.14, 0.22) - easeRange(p, 0.96, 1.00));

  // Mobile: pixel position just below the phone's bottom edge
  const phoneBottomPx = vh / 2 + (874 * fitScale) / 2 + 18;

  return (
    <section ref={stageRef} style={{
      position: 'relative', height: `${STAGE_VH * 100}vh`, background: '#fff',
    }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
        perspective: 1800,
      }}>
        {/* Soft ambient gradient under the phone */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 900, height: 500,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(closest-side, rgba(255,45,111,0.15), rgba(255,45,111,0) 70%)',
          opacity: easeRange(p, 0.10, 0.22) - easeRange(p, 0.96, 1.00),
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }} />

        <HeroCopy
          opacity={heroOpacity}
          translateY={heroTranslateY}
          headline={tweaks.headline}
          sub={tweaks.subheadline}
        />

        {isMobile
          ? <MobileScreenTitle activeIdx={activeScreen} opacity={featureOpacity} topPx={phoneBottomPx} />
          : <FeaturePane activeIdx={activeScreen} opacity={featureOpacity} />
        }

        <PhoneStage activeScreen={activeScreen} transform={transform} />

        {/* Scroll hint — sits just above the phone's peeking top edge at scrollY=0 */}
        <div style={{
          position: 'absolute', top: 'calc(82vh - 70px)', left: '50%', transform: 'translateX(-50%)',
          opacity: clamp(1 - p * 12), pointerEvents: 'none',
          fontSize: 11, fontWeight: 600, letterSpacing: 1.8, color: '#9a9a9a',
          textTransform: 'uppercase', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10,
        }}>
          Scroll to explore
          <svg width="14" height="22" viewBox="0 0 14 22">
            <rect x="1" y="1" width="12" height="20" rx="6" fill="none" stroke="#FF3B7F" strokeWidth="1.2"/>
            <circle cx="7" cy="7" r="1.5" fill="#FF3B7F">
              <animate attributeName="cy" values="7;13;7" dur="1.8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Lower sections (revealed after phone scrolls up)
// ─────────────────────────────────────────────────────────────
function FeaturesGrid() {
  const items = [
    { eyebrow: 'Smart segmentation', title: 'Reach the right patient at the right moment.', body: 'Retainly groups patients by treatment history, lifecycle stage, and visit cadence, then automates the outreach.' },
    { eyebrow: 'Owned by your clinic', title: 'Your brand. Your loyalty programme.', body: 'White-label the iOS app with your clinic\'s logo, colour palette and tone. We power it; your patients see you.' },
    { eyebrow: 'Live insights', title: 'Know exactly what\'s keeping clients coming back.', body: 'Cohort retention, redemption rates, membership churn, surfaced in a dashboard your team will actually use.' },
    { eyebrow: 'Integrations', title: 'Plays nicely with your booking stack.', body: 'Connects to Pabau, Aesthetic Record, Phorest and Mindbody in minutes. No double entry.' },
  ];
  return (
    <section id="features" style={{
      padding: '0 32px 100px', maxWidth: 1280, margin: '0 auto',
    }}>
      <div style={{ maxWidth: 720, marginBottom: 80 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#FF3B7F', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 18 }}>
          The platform
        </div>
        <h2 style={{
          margin: 0, fontSize: 'clamp(40px, 5vw, 72px)',
          fontWeight: 800, letterSpacing: -1.8, lineHeight: 1.0, color: '#0a0a0a',
        }}>
          Built for clinics that<br/>actually care about retention.
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 48 }}>
        {items.map((it, i) => (
          <div key={i} style={{ borderTop: '1px solid #ececec', paddingTop: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>
              <span style={{ color: '#FF3B7F', fontWeight: 700 }}>0{i + 1}</span> · {it.eyebrow}
            </div>
            <h3 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, color: '#0a0a0a' }}>
              {it.title}
            </h3>
            <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.55, color: '#5a5a5a', maxWidth: 460 }}>
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LovedBy() {
  const clinics = ['Sky Aesthetics', 'House of Glow', 'The Skin Studio', 'Lumen Clinic', 'Maven & Co.', 'Veil Aesthetics'];
  return (
    <section id="clinics" style={{
      padding: '60px 32px 100px', borderTop: '1px solid #ececec', borderBottom: '1px solid #ececec',
      background: '#fafafa',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#9a9a9a',
          letterSpacing: 1.6, textTransform: 'uppercase', textAlign: 'center', marginBottom: 36,
        }}>
          Trusted by 240+ aesthetic clinics
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 56, flexWrap: 'wrap',
          fontSize: 22, fontWeight: 700, color: '#bcbcbc', letterSpacing: -0.4,
        }}>
          {clinics.map((c) => <span key={c}>{c}</span>)}
        </div>
      </div>
    </section>
  );
}

function PinkStreakOverlay({ targetRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    const canvas = canvasRef.current;
    if (!target || !canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let points = [];
    let raf = 0;
    let alive = true;
    let idle = true; // loop only runs when there are points to draw

    const resize = () => {
      const rect = target.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(target);

    const onMove = (e) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      const last = points[points.length - 1];
      if (last && now - last.t < 200) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const STEP = 4;
        if (dist > STEP) {
          const steps = Math.min(Math.ceil(dist / STEP), 60);
          const dt = now - last.t;
          for (let i = 1; i < steps; i++) {
            const u = i / steps;
            points.push({ x: last.x + dx * u, y: last.y + dy * u, t: last.t + dt * u });
          }
        }
      }
      points.push({ x, y, t: now });

      if (idle) { idle = false; raf = requestAnimationFrame(draw); }
    };

    target.addEventListener('mousemove', onMove);

    const LIFE = 1300;

    const draw = () => {
      if (!alive) return;
      const now = performance.now();
      const rect = target.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      points = points.filter((p) => now - p.t < LIFE);

      if (points.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'lighter';

        // Two passes replace shadowBlur: wide faint glow + narrow bright core.
        // Identical look, a fraction of the GPU cost.
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            if (dx * dx + dy * dy > 6400) continue;

            const age = (now - p2.t) / LIFE;
            const fade = Math.pow(1 - age, 1.4);
            if (fade < 0.01) continue;

            if (pass === 0) {
              const width = fade * 26;
              if (width < 1) continue;
              ctx.strokeStyle = `rgba(255,60,130,${fade * 0.15})`;
              ctx.lineWidth = width;
            } else {
              const width = fade * 6;
              if (width < 0.5) continue;
              ctx.strokeStyle = `rgba(255,80,140,${fade * 0.85})`;
              ctx.lineWidth = width;
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      if (points.length > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        // Trail fully faded — stop the loop until next mousemove
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        idle = true;
        raf = 0;
      }
    };

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      target.removeEventListener('mousemove', onMove);
    };
  }, [targetRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', borderRadius: 'inherit',
      }}
    />
  );
}

function PricingSection() {
  const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="9" cy="9" r="9" fill="#FFF0F5" />
      <path d="M5 9l2.8 2.8 5-5.6" stroke="#FF3B7F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const features1 = [
    'Your own branded iOS & Android app',
    'Buy Now Pay Later (Klarna) integration',
    'Custom loyalty & rewards program',
    'Automated push notifications',
    'Membership management',
    'Birthday & seasonal automated offers',
  ];

  const features2 = [
    'Everything in Clinic Growth Plan',
    'Monthly consulting call',
    'Priority support',
    'Zero setup fee',
    'Done for you setup',
    'Clinic marketing material',
  ];

  return (
    <section id="pricing" style={{ padding: '100px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h2 style={{
          margin: '0 0 18px',
          fontSize: 'clamp(38px, 5vw, 64px)',
          fontWeight: 800, letterSpacing: -1.8, lineHeight: 1.05, color: '#0a0a0a',
        }}>Simple, transparent pricing</h2>
        <p style={{ margin: 0, fontSize: 18, color: '#6a6a6a', fontWeight: 400 }}>
          Everything you need to retain patients and grow your clinic… with 2 simple plans
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 24, maxWidth: 920, margin: '0 auto',
      }}>

        {/* Clinic Growth Plan */}
        <div style={{
          background: '#fff', border: '1px solid #e8e8e8',
          borderRadius: 22, padding: '44px 40px',
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: '#0a0a0a' }}>
            Clinic Growth Plan
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
            <span style={{ fontSize: 58, fontWeight: 800, letterSpacing: -2.5, color: '#0a0a0a', lineHeight: 1 }}>$297</span>
            <span style={{ fontSize: 16, color: '#9a9a9a', fontWeight: 500 }}>/mo</span>
          </div>
          <div style={{
            alignSelf: 'flex-start', background: '#FFF0F5', color: '#FF3B7F',
            fontSize: 12.5, fontWeight: 600, padding: '5px 13px',
            borderRadius: 999, marginBottom: 32,
          }}>Cancel any time. No lock-in contracts.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, flex: 1, marginBottom: 36 }}>
            {features1.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 15, color: '#1a1a1a' }}>
                <CheckIcon />{f}
              </div>
            ))}
          </div>
          <a href="#demo" style={{
            display: 'block', textAlign: 'center',
            background: '#FF3B7F', color: '#fff',
            padding: '16px', borderRadius: 999,
            textDecoration: 'none', fontWeight: 700, fontSize: 15.5,
          }}>Get Your App</a>
        </div>

        {/* Annual Plan */}
        <div style={{
          background: '#fff', border: '1.5px solid #FFB3CC',
          borderRadius: 22, padding: '44px 40px',
          position: 'relative', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            background: '#FF3B7F', color: '#fff',
            fontSize: 11, fontWeight: 800, letterSpacing: 1.3,
            textTransform: 'uppercase', padding: '7px 16px',
            borderRadius: '0 20px 0 12px',
          }}>Best Value</div>

          <h3 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: '#0a0a0a' }}>
            Annual Plan
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
            <span style={{ fontSize: 58, fontWeight: 800, letterSpacing: -2.5, color: '#0a0a0a', lineHeight: 1 }}>$2,997</span>
            <span style={{ fontSize: 16, color: '#9a9a9a', fontWeight: 500 }}>/yr</span>
          </div>
          <div style={{
            alignSelf: 'flex-start', background: '#FFF0F5', color: '#FF3B7F',
            fontSize: 12.5, fontWeight: 600, padding: '5px 13px',
            borderRadius: 999, marginBottom: 32,
          }}>Save $564 a year</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, flex: 1, marginBottom: 36 }}>
            {features2.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 15, color: '#1a1a1a' }}>
                <CheckIcon />{f}
              </div>
            ))}
          </div>
          <a href="#demo" style={{
            display: 'block', textAlign: 'center',
            background: '#FF3B7F', color: '#fff',
            padding: '16px', borderRadius: 999,
            textDecoration: 'none', fontWeight: 700, fontSize: 15.5,
          }}>Get Your App</a>
        </div>

      </div>
    </section>
  );
}

function CTAFooter() {
  const cardRef = useRef(null);
  return (
    <section id="book" style={{
      padding: '140px 32px 60px',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <div ref={cardRef} style={{
        background: '#0a0a0a', color: '#fff',
        borderRadius: 28, padding: '80px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <PinkStreakOverlay targetRef={cardRef} />
        <div style={{
          position: 'absolute', right: -120, top: -120,
          width: 360, height: 360, borderRadius: 999,
          background: 'radial-gradient(closest-side, rgba(255,45,111,0.45), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 720 }}>
          <h2 style={{
            margin: 0, fontSize: 'clamp(40px, 5vw, 72px)',
            fontWeight: 800, letterSpacing: -1.8, lineHeight: 1.0,
          }}>
            Ready to retain<br/>more patients?
          </h2>
          <p style={{ margin: '22px 0 36px', fontSize: 18, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', maxWidth: 560 }}>
            See Retainly running on your clinic's data in a 20-minute demo. We'll have your branded app live within a week.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#demo" style={{
              background: '#FF3B7F', color: '#fff', padding: '15px 26px',
              borderRadius: 999, textDecoration: 'none', fontWeight: 700, fontSize: 15,
            }}>Book a demo</a>
            <a href="#ios" style={{
              background: 'transparent', color: '#fff', padding: '15px 26px',
              borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 15,
              border: '1px solid rgba(255,255,255,0.25)',
            }}>Download iOS app →</a>
          </div>
        </div>
      </div>

      <footer style={{
        marginTop: 80, paddingTop: 32, borderTop: '1px solid #ececec',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
        fontSize: 13, color: '#9a9a9a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RetainlyLogo />
          <span style={{ color: '#0a0a0a', fontWeight: 700 }}>Retainly</span>
          <span style={{ marginLeft: 12 }}>© 2026 Retainly Inc.</span>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scrollY = useScrollY();
  const { h: vh } = useViewport();
  const stageRef = useRef(null);

  // Mirror ScrollStage's progress math so we know which phase is active.
  // Used to hide the top nav while screens 1–4 are on display. We keep this unclamped
  // so we can detect "past the stage" — after p=1, the sticky has released and the
  // phone is scrolling naturally up; the nav should stay hidden until it's clear of view.
  const STAGE_VH_OUTER = 4.2 / (t.scrollSpeed || 1);
  const stageTop = stageRef.current ? stageRef.current.offsetTop : 0;
  const stageHeight = vh * STAGE_VH_OUTER;
  const rawProgress = (scrollY - stageTop) / (stageHeight - vh);
  const outerP = clamp(rawProgress);

  // Smoothly fade the nav out as the phone takes over the viewport, and back in once the phone
  // has scrolled clear past the stage.
  const navHideT = clamp(easeRange(rawProgress, 0.06, 0.16) - easeRange(rawProgress, 1.10, 1.35));

  return (
    <div>
      <NavBar scrolled={scrollY > 80} hideT={navHideT} />
      <ScrollStage tweaks={t} stageRef={stageRef} />
      <FeaturesGrid />
      <LovedBy />
      <PricingSection />
      <CTAFooter />

      <TweaksPanel>
        <TweakSection label="Hero copy" />
        <TweakText label="Headline" value={t.headline}
                   onChange={(v) => setTweak('headline', v)} />
        <TweakText label="Subheadline" value={t.subheadline}
                   onChange={(v) => setTweak('subheadline', v)} />

        <TweakSection label="Phone" />
        <TweakSlider label="Size" value={t.phoneScale} min={0.5} max={1.05} step={0.01}
                     onChange={(v) => setTweak('phoneScale', v)} />
        <TweakSlider label="Vertical offset" value={t.phoneOffsetY} min={-200} max={200} step={5} unit="px"
                     onChange={(v) => setTweak('phoneOffsetY', v)} />

        <TweakSection label="Scroll" />
        <TweakSlider label="Speed" value={t.scrollSpeed} min={0.5} max={2.0} step={0.05}
                     onChange={(v) => setTweak('scrollSpeed', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
