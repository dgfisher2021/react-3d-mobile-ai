import {
  AlertTriangle,
  Bug,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  FileText,
  Search,
  Zap,
} from 'lucide-react';
import { TICKET_TYPES } from '../../constants/tickets';
import type { IconMap, Theme, ThemeName } from '../../types';

interface TicketsTabProps {
  theme: Theme;
  themeName: ThemeName;
  expandedTicket: number | null;
  onExpand: (index: number | null) => void;
}

const ICON_MAP: IconMap = {
  zap: Zap,
  filetext: FileText,
  bug: Bug,
  clipboard: Clipboard,
  search: Search,
};

export function TicketsTab({ theme, themeName, expandedTicket, onExpand }: TicketsTabProps) {
  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div style={{ fontSize: '0.7rem', color: theme.muted, marginBottom: 12 }}>
        Tap any card to see required fields
      </div>
      {TICKET_TYPES.map((ticket, i) => {
        const isExp = expandedTicket === i;
        const IconComp = ICON_MAP[ticket.icon];
        return (
          <div
            key={i}
            style={{
              background: `${ticket.color}${themeName === 'dark' ? '0A' : '08'}`,
              border: `1px solid ${isExp ? ticket.color + '35' : ticket.color + '15'}`,
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
                  background: `${ticket.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComp size={17} color={ticket.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.headers }}>
                  {ticket.type}
                </div>
                <div style={{ fontSize: '0.6rem', color: theme.muted, marginTop: 1 }}>
                  {ticket.titleConvention}
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
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 600,
                        color: ticket.color,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 4,
                      }}
                    >
                      Example
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: theme.headers,
                        fontWeight: 500,
                        background: theme.chipBg,
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {ticket.example}
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 600,
                        color: ticket.color,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 6,
                      }}
                    >
                      Required Fields
                    </div>
                    {ticket.requiredFields.map((f, j) => (
                      <div
                        key={j}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 4,
                          background: `${ticket.color}${themeName === 'dark' ? '08' : '06'}`,
                          borderRadius: 6,
                          padding: '4px 8px',
                        }}
                      >
                        <Check size={11} color={ticket.color} />
                        <span style={{ fontSize: '0.62rem', color: theme.bodyText }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        color: theme.headers,
                        fontWeight: 500,
                        background: theme.chipBg,
                        borderRadius: 20,
                        padding: '4px 10px',
                      }}
                    >
                      {ticket.estimate}
                    </div>
                    <div
                      style={{
                        fontSize: '0.58rem',
                        color: theme.muted,
                        background: theme.chipBg,
                        borderRadius: 20,
                        padding: '4px 10px',
                      }}
                    >
                      Labels: {ticket.labels}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: '0.6rem',
                      color: '#ECC94B',
                      background: 'rgba(236,201,75,0.08)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <AlertTriangle size={12} color="#ECC94B" />
                    {ticket.warningRule}
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
