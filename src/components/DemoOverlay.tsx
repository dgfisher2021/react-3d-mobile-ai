interface DemoOverlayProps {
  subtitle: string;
  hint: string;
  badges: { label: string; color: string }[];
  showHint?: boolean;
}

/**
 * Shared floating UI on top of each 3D demo: eyebrow, two-line title,
 * a drag/interaction hint, and a row of tech badges bottom-left.
 */
export function DemoOverlay({ subtitle, hint, badges, showHint = true }: DemoOverlayProps) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 32,
          zIndex: 10,
          animation: 'fadeIn 0.8s ease 0.2s both',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: '#319795',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            marginBottom: 6,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          PPM TECHNOLOGY
        </div>
        <div
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}
        >
          Sprint Standards
        </div>
        <div
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3182CE, #319795)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}
        >
          {subtitle}
        </div>
      </div>

      {showHint && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            animation: 'fadeIn 0.8s ease 1s both',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#319795',
              animation: 'pulseGlow 1.5s ease infinite',
            }}
          />
          <span
            style={{
              color: '#718096',
              fontSize: '0.72rem',
              fontWeight: 500,
              letterSpacing: '0.3px',
            }}
          >
            {hint}
          </span>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 32,
          zIndex: 10,
          animation: 'fadeIn 0.8s ease 0.8s both',
          display: 'flex',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        {badges.map((badge, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              color: badge.color,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.5px',
              opacity: 0.7,
            }}
          >
            {badge.label}
          </div>
        ))}
      </div>
    </>
  );
}
