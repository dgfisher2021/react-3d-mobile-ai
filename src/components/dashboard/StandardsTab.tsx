import { AlertTriangle, Target } from 'lucide-react';
import { TICKET_TYPES } from '../../constants/tickets';
import type { Theme, ThemeName } from '../../types';

interface StandardsTabProps {
  theme: Theme;
  themeName: ThemeName;
}

const KPIS = [
  { value: '5', label: 'Ticket Types', color: '#4299E1' },
  { value: '4', label: 'Ceremonies', color: '#48BB78' },
  { value: '2wk', label: 'Sprints', color: '#9F7AEA' },
  { value: '1:1', label: 'Pt = Hr', color: '#ECC94B' },
];

const CAPACITY_FACTS = [
  { label: 'Sprint Cadence', value: '2 weeks', color: '#4299E1' },
  { label: 'Point Model', value: '1 point = 1 hour', color: '#48BB78' },
  { label: 'Avg Coding Time', value: '52 min/day', color: '#ECC94B' },
  { label: 'Innovation', value: '20% protected', color: '#9F7AEA' },
  { label: 'Jira Project', value: 'DEV (Scrum)', color: '#319795' },
];

export function StandardsTab({ theme, themeName }: StandardsTabProps) {
  return (
    <div style={{ padding: '0 16px 100px' }}>
      {/* KPI grid */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {KPIS.map((kpi, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 calc(50% - 4px)',
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 12,
              padding: '12px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '0.6rem', color: theme.muted, fontWeight: 500, marginTop: 2 }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Golden Rule */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(236,201,75,0.1), rgba(236,201,75,0.03))',
          border: '1px solid rgba(236,201,75,0.2)',
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Target size={15} color="#ECC94B" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ECC94B' }}>
            The Golden Rule
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', color: theme.bodyText, lineHeight: 1.5 }}>
          &quot;Does this need sub-items that THEMSELVES need sub-items?&quot; If yes → it&apos;s a
          higher classification level.
        </div>
      </div>

      {/* Title conventions */}
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <div
          style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.headers, marginBottom: 10 }}
        >
          Title Conventions
        </div>
        {TICKET_TYPES.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: i < TICKET_TYPES.length - 1 ? 6 : 0,
              background: `${t.color}${themeName === 'dark' ? '0A' : '08'}`,
              border: `1px solid ${t.color}12`,
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: t.color,
                flexShrink: 0,
              }}
            />
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: t.color }}>
                {t.type}:{' '}
              </span>
              <span style={{ fontSize: '0.62rem', color: theme.muted }}>{t.titleConvention}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 10-Week Warning */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245,101,101,0.1), rgba(245,101,101,0.03))',
          border: '1px solid rgba(245,101,101,0.2)',
          borderRadius: 14,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <AlertTriangle size={15} color="#F56565" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F56565' }}>
            Epic 10-Week Warning
          </span>
        </div>
        <div style={{ fontSize: '0.62rem', color: theme.bodyText, lineHeight: 1.6 }}>
          If an epic pushes past 10 weeks, check: 4+ distinct feature groups? 3+ different owners?
          Own stakeholder feedback loop? 20+ tickets? → Probably a Project — split it.
        </div>
      </div>

      {/* Capacity quick facts */}
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 14,
          padding: 14,
        }}
      >
        <div
          style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.headers, marginBottom: 10 }}
        >
          Capacity Quick Facts
        </div>
        {CAPACITY_FACTS.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: i < CAPACITY_FACTS.length - 1 ? 4 : 0,
              background: `${item.color}${themeName === 'dark' ? '08' : '06'}`,
              borderRadius: 6,
              padding: '5px 10px',
            }}
          >
            <span style={{ fontSize: '0.62rem', color: theme.muted }}>{item.label}</span>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: theme.headers }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
