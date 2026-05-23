// screens.jsx — 4 app screens for Retainly
// Each renders inside a phone with a fixed 402x874 viewport.

const RETAINLY_PINK = '#FF3B7F';
const RETAINLY_PINK_SOFT = '#ffe7ef';
const RETAINLY_INK = '#0a0a0a';
const RETAINLY_MUTED = '#6b6b6b';
const RETAINLY_LINE = '#ececec';

// Shared chrome for each screen
function IOSStatusBarFaux() {
  return (
    <div style={{
      height: 54, padding: '14px 30px 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: '-apple-system, system-ui, sans-serif',
      fontSize: 16, fontWeight: 600, color: RETAINLY_INK,
      letterSpacing: 0.2,
    }}>
      <div>9:41</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </g></svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 11l2.2-2.7c-.6-.5-1.4-.8-2.2-.8s-1.6.3-2.2.8L8 11zm-4-5l1.8 1.8c.6-.6 1.4-1 2.2-1s1.6.4 2.2 1L12 6c-1.1-1.1-2.5-1.7-4-1.7S5.1 4.9 4 6zm-4-4l1.8 1.8C3.4 1.9 5.7.9 8 .9s4.6 1 6.2 2.9L16 2C13.8-.6 11-1 8-1S2.2-.6 0 2z"/>
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor"/>
          <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// Shared chrome for each screen
function ScreenChrome({ children, bg = '#f7f7f7' }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      fontFamily: 'Barlow, -apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
    }}>
      <IOSStatusBarFaux />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

function ScreenHeader({ greeting, name, avatar = 'EM' }) {
  return (
    <div style={{
      padding: '8px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: 14, color: RETAINLY_MUTED, fontWeight: 500, letterSpacing: 0.1 }}>{greeting}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: RETAINLY_INK, lineHeight: 1.1, marginTop: 2 }}>{name}</div>
      </div>
      <div style={{
        width: 42, height: 42, borderRadius: 999, background: RETAINLY_PINK_SOFT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: RETAINLY_PINK, fontWeight: 700, fontSize: 14, letterSpacing: 0.5,
      }}>{avatar}</div>
    </div>
  );
}

function TabBar({ active = 0 }) {
  const tabs = [
    { label: 'Home', icon: 'M3 11l9-8 9 8v9a2 2 0 01-2 2h-3v-7H8v7H5a2 2 0 01-2-2v-9z' },
    { label: 'Offers', icon: 'M20 12l-8 8-8-8 8-8 8 8z' },
    { label: 'Rewards', icon: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z' },
    { label: 'Profile', icon: 'M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-9 2-9 6v2h18v-2c0-4-5-6-9-6z' },
  ];
  return (
    <div style={{
      borderTop: `0.5px solid ${RETAINLY_LINE}`, background: '#fff',
      padding: '12px 16px 34px', display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map((t, i) => (
        <div key={t.label} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: i === active ? RETAINLY_PINK : '#bcbcbc',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d={t.icon} fill="currentColor"/></svg>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1 — Personalized Offers (static screenshot)
// ─────────────────────────────────────────────────────────────
function Screen1_Offers() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <img
        src="screen1-offers.png"
        alt="Retainly · Offers"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top center',
          display: 'block',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2 — Buy Now, Treat Later (static screenshot)
// ─────────────────────────────────────────────────────────────
function Screen2_BNTL() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <img
        src="screen2-bntl.png"
        alt="Retainly · Buy now, treat later"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top center',
          display: 'block',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 3 — Loyalty Points (static screenshot)
// ─────────────────────────────────────────────────────────────
function Screen3_Points() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <img
        src="screen3-points.png"
        alt="Retainly · Loyalty points"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top center',
          display: 'block',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 4 — Memberships (static screenshot)
// ─────────────────────────────────────────────────────────────
function Screen4_Memberships() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <img
        src="screen4-memberships.png"
        alt="Retainly · Clinic memberships"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top center',
          display: 'block',
        }}
      />
    </div>
  );
}

window.RetainlyScreens = [
  { Comp: Screen1_Offers, eyebrow: 'Personalized offers', title: 'A unique offer for every patient.', body: 'Retainly learns from each visit and sends the right reward at the right moment. Birthdays, post-treatment touch-ups, win-backs.' },
  { Comp: Screen2_BNTL,   eyebrow: 'Buy now, treat later', title: 'Pay over time, glow today.', body: 'Let patients split any treatment into 4, 6, or 12 payments. Fully white-labelled, settled in your account next business day.' },
  { Comp: Screen3_Points, eyebrow: 'Loyalty points', title: 'Points patients actually chase.', body: 'Tiers, streaks, and redeemable perks that nudge clients back through your doors. Not into a generic high-street rewards app.' },
  { Comp: Screen4_Memberships, eyebrow: 'Clinic memberships', title: 'Recurring revenue, on autopilot.', body: 'Stand up monthly plans for your signature treatments. Auto-billing, prorated upgrades, and one-tap renewal, all in-app.' },
];
