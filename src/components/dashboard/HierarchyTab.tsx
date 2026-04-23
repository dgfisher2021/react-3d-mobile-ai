import { Target } from 'lucide-react';
import { HIERARCHY } from '../../constants/hierarchy';
import type { Theme, ThemeName } from '../../types';

interface HierarchyTabProps {
  theme: Theme;
  themeName: ThemeName;
}

export function HierarchyTab({ theme, themeName }: HierarchyTabProps) {
  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(236,201,75,0.12), rgba(236,201,75,0.03))',
          border: '1px solid rgba(236,201,75,0.2)',
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Target size={15} color="#ECC94B" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ECC94B' }}>
            The Golden Rule
          </span>
        </div>
        <div style={{ fontSize: '0.65rem', color: theme.bodyText, lineHeight: 1.5 }}>
          &quot;Does this need sub-items that THEMSELVES need sub-items?&quot;
        </div>
      </div>
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        <div
          style={{
            position: 'absolute',
            left: 9,
            top: 20,
            bottom: 20,
            width: 2,
            background: `linear-gradient(180deg, ${HIERARCHY[0].color}, ${HIERARCHY[HIERARCHY.length - 1].color})`,
            borderRadius: 1,
            opacity: 0.4,
          }}
        />
        {HIERARCHY.map((h, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              marginBottom: i < HIERARCHY.length - 1 ? 12 : 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: -15,
                top: 12,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: h.color,
                border: `2px solid ${themeName === 'dark' ? '#0d1b2a' : '#EDF2F7'}`,
                zIndex: 1,
              }}
            />
            <div
              style={{
                width: 3,
                borderRadius: 2,
                flexShrink: 0,
                background: h.color,
                opacity: 0.6,
                height: '50%',
                marginTop: 8,
              }}
            />
            <div
              style={{
                flex: 1,
                background: `${h.color}${themeName === 'dark' ? '0A' : '08'}`,
                border: `1px solid ${h.color}15`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: h.color }}>
                  {h.level}
                </span>
                <span
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 600,
                    color: theme.headers,
                    background: theme.chipBg,
                    borderRadius: 20,
                    padding: '2px 8px',
                  }}
                >
                  {h.duration}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Row label="Sub-items" value={h.subItems} theme={theme} />
                <Row label="Owner" value={h.ownerLevel} theme={theme} />
                <div
                  style={{
                    fontSize: '0.58rem',
                    color: theme.muted,
                    fontStyle: 'italic',
                    marginTop: 2,
                    paddingTop: 4,
                    borderTop: `1px solid ${theme.cardBorder}`,
                  }}
                >
                  e.g., &quot;{h.example}&quot;
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.58rem', color: theme.muted }}>{label}</span>
      <span style={{ fontSize: '0.58rem', color: theme.bodyText, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
