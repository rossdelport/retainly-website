// iphone14.jsx — A more realistic iPhone 14 device frame.
// Features the standard iPhone 14 notch (NOT the Pro's Dynamic Island),
// titanium-style frame band, physical side buttons (mute switch, volume up/down, power),
// inset screen with sensor cutouts, and a soft drop shadow.
// Drop-in replacement for IOSDevice — same children API (a 402x874 screen).

function IPhone14Device({
  children,
  screenWidth = 402,
  screenHeight = 874,
  color = 'midnight', // 'midnight' | 'starlight'
}) {
  // Frame band thickness — the metal edge visible around the screen.
  const BAND = 10;
  const frameWidth = screenWidth + BAND * 2;
  const frameHeight = screenHeight + BAND * 2;

  const palettes = {
    midnight: {
      // Brushed aluminum dark — multi-stop linear gradient simulates light catching the edges.
      band: 'linear-gradient(135deg, #2a2a2e 0%, #444448 22%, #1a1a1c 50%, #383838 72%, #1f1f22 100%)',
      bandSide: 'linear-gradient(180deg, #404042 0%, #1f1f22 50%, #404042 100%)',
      buttonFill: 'linear-gradient(90deg, #1a1a1c 0%, #383838 50%, #1a1a1c 100%)',
      bandShadow: '#0a0a0c',
    },
    starlight: {
      band: 'linear-gradient(135deg, #d4d0c4 0%, #efece2 22%, #c4c0b4 50%, #e4e0d4 72%, #c4c0b4 100%)',
      bandSide: 'linear-gradient(180deg, #c0bcb0 0%, #a8a49c 50%, #c0bcb0 100%)',
      buttonFill: 'linear-gradient(90deg, #b8b4a8 0%, #d8d4c8 50%, #b8b4a8 100%)',
      bandShadow: '#888478',
    },
  };
  const c = palettes[color] || palettes.midnight;

  // Button geometry — calibrated to roughly match iPhone 14 physical positions.
  // Right side: power button. Left side: mute switch (top), volume up, volume down.
  const sideButton = (side, top, height) => (
    <div style={{
      position: 'absolute',
      [side]: -2,
      top, width: 4, height,
      borderRadius: 1.5,
      background: c.buttonFill,
      boxShadow: side === 'right'
        ? `1px 0 0 ${c.bandShadow}, inset 1px 0 0 rgba(255,255,255,0.08)`
        : `-1px 0 0 ${c.bandShadow}, inset -1px 0 0 rgba(255,255,255,0.08)`,
    }} />
  );

  return (
    <div style={{
      position: 'relative',
      width: frameWidth,
      height: frameHeight,
      borderRadius: 58,
      // Outer metal band — gradient provides a hint of brushed-metal sheen.
      background: c.band,
      boxShadow: `
        0 60px 100px -30px rgba(0,0,0,0.45),
        0 25px 50px -10px rgba(0,0,0,0.25),
        0 0 0 0.5px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.18),
        inset 0 -1px 0 rgba(0,0,0,0.5)
      `,
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Subtle inset highlight ring — adds the polished edge feel */}
      <div style={{
        position: 'absolute', inset: 1,
        borderRadius: 57,
        boxShadow: `
          inset 0 0 0 0.5px rgba(255,255,255,0.12),
          inset 0 0 0 1.5px rgba(0,0,0,0.4)
        `,
        pointerEvents: 'none',
      }} />

      {/* Side buttons */}
      {sideButton('right', 210, 110)}  {/* Power / Side button */}
      {sideButton('left', 150, 32)}    {/* Mute switch */}
      {sideButton('left', 205, 72)}    {/* Volume up */}
      {sideButton('left', 290, 72)}    {/* Volume down */}

      {/* Inner screen capsule — the actual display area, slightly inset from the band */}
      <div style={{
        position: 'absolute',
        top: BAND, left: BAND,
        width: screenWidth, height: screenHeight,
        borderRadius: 48,
        overflow: 'hidden',
        background: '#000',
        boxShadow: `
          inset 0 0 0 2px #050505,
          inset 0 0 12px rgba(0,0,0,0.6)
        `,
      }}>
        {/* The screen content */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {children}
        </div>

        {/* Status bar is intentionally NOT rendered as a frame overlay — each
            screen is responsible for its own status bar (or for using a
            baked-in one from an image asset). This keeps photographic/exported
            mockups from getting a duplicate status bar on top. */}

        {/* The iPhone 14 NOTCH — center-top, pill-shaped, with earpiece + camera lens */}
        <div style={{
          position: 'absolute',
          top: 11,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 156, height: 32,
          background: '#000',
          borderRadius: 20,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px 0 22px',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.04)',
        }}>
          {/* Earpiece slit */}
          <div style={{
            width: 46, height: 5,
            borderRadius: 4,
            background: 'linear-gradient(180deg, #0a0a0c 0%, #050506 100%)',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.04), inset 0 -0.5px 0 rgba(0,0,0,0.5)',
          }} />
          {/* Front-facing camera lens */}
          <div style={{
            width: 10, height: 10,
            borderRadius: 999,
            background: 'radial-gradient(circle at 35% 30%, #2a2a35 0%, #0a0a10 55%, #000 100%)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 0 1px rgba(255,255,255,0.05)',
            position: 'relative',
          }}>
            {/* tiny catch-light */}
            <div style={{
              position: 'absolute',
              top: 2, left: 2.5,
              width: 2, height: 2,
              borderRadius: 999,
              background: 'rgba(180,200,230,0.35)',
            }} />
          </div>
        </div>

        {/* Home indicator — bottom of screen */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
          height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          paddingBottom: 8, pointerEvents: 'none',
        }}>
          <div style={{
            width: 139, height: 5, borderRadius: 100,
            background: 'rgba(0,0,0,0.25)',
          }} />
        </div>
      </div>
    </div>
  );
}

window.IPhone14Device = IPhone14Device;
