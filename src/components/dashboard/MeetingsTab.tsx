import { Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import { CEREMONIES } from '../../constants/ceremonies';
import type { Theme, ThemeName } from '../../types';

interface MeetingsTabProps {
  theme: Theme;
  themeName: ThemeName;
  expandedCeremony: number | null;
  onExpand: (index: number | null) => void;
}

export function MeetingsTab({ theme, themeName, expandedCeremony, onExpand }: MeetingsTabProps) {
  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div style={{ fontSize: '0.7rem', color: theme.muted, marginBottom: 12 }}>
        Tap any ceremony for details
      </div>
      {CEREMONIES.map((cer, i) => {
        const isExp = expandedCeremony === i;
        return (
          <div
            key={i}
            style={{
              background: `${cer.color}${themeName === 'dark' ? '0A' : '08'}`,
              border: `1px solid ${isExp ? cer.color + '35' : cer.color + '15'}`,
              borderRadius: 14,
              marginBottom: 10,
              overflow: 'hidden',
              transition: 'border-color 0.3s',
            }}
          >
            <div
              onClick={() => onExpand(isExp ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `${cer.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Calendar size={17} color={cer.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.headers }}>
                  {cer.name}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                  <span
                    style={{
                      fontSize: '0.52rem',
                      fontWeight: 600,
                      color: cer.color,
                      background: `${cer.color}15`,
                      borderRadius: 20,
                      padding: '2px 7px',
                    }}
                  >
                    {cer.duration}
                  </span>
                  <span
                    style={{
                      fontSize: '0.52rem',
                      fontWeight: 500,
                      color: theme.muted,
                      background: theme.chipBg,
                      borderRadius: 20,
                      padding: '2px 7px',
                    }}
                  >
                    {cer.cadence}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: theme.chipBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isExp ? (
                  <ChevronUp size={14} color={theme.muted} />
                ) : (
                  <ChevronDown size={14} color={theme.muted} />
                )}
              </div>
            </div>
            {isExp && (
              <div style={{ padding: '0 14px 14px', background: theme.expandedBg }}>
                <div style={{ borderTop: `1px solid ${theme.cardBorder}`, paddingTop: 12 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          color: cer.color,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          marginBottom: 3,
                        }}
                      >
                        Owner
                      </div>
                      <div style={{ fontSize: '0.62rem', color: theme.headers }}>{cer.owner}</div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          color: cer.color,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          marginBottom: 3,
                        }}
                      >
                        Attendees
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {cer.attendees.map((a, j) => (
                          <span
                            key={j}
                            style={{
                              fontSize: '0.55rem',
                              color: theme.headers,
                              fontWeight: 500,
                              background: theme.chipBg,
                              borderRadius: 20,
                              padding: '2px 7px',
                            }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 600,
                        color: cer.color,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 8,
                      }}
                    >
                      Agenda Sections
                    </div>
                    {cer.sections.map((sec, j) => (
                      <div
                        key={j}
                        style={{
                          display: 'flex',
                          gap: 8,
                          marginBottom: 6,
                          padding: '7px 10px',
                          background: `${cer.color}${themeName === 'dark' ? '08' : '06'}`,
                          borderLeft: `2px solid ${cer.color}40`,
                          borderRadius: '0 8px 8px 0',
                        }}
                      >
                        <div style={{ minWidth: 42 }}>
                          <span style={{ fontSize: '0.55rem', fontWeight: 600, color: cer.color }}>
                            {sec.time}
                          </span>
                        </div>
                        <div>
                          <div
                            style={{ fontSize: '0.62rem', fontWeight: 600, color: theme.headers }}
                          >
                            {sec.name}
                          </div>
                          <div style={{ fontSize: '0.58rem', color: theme.muted, marginTop: 1 }}>
                            {sec.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 600,
                        color: '#F56565',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 6,
                      }}
                    >
                      Anti-Patterns
                    </div>
                    {cer.antiPatterns.map((ap, j) => (
                      <div
                        key={j}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6,
                          marginBottom: 4,
                          background: `rgba(245,101,101,${themeName === 'dark' ? '0.04' : '0.03'})`,
                          borderRadius: 8,
                          padding: '5px 8px',
                        }}
                      >
                        <X size={10} color="#F56565" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.58rem', color: theme.bodyText }}>{ap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
