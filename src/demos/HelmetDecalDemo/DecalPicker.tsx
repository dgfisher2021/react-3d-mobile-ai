import { useState } from 'react';
import type { ColorScheme } from '../../components/svgs';
import type { HelmetColor } from './HelmetModel';
import { SVG_ENTRIES, CATEGORIES, type SvgEntry } from './svgEntries';

const COLOR_OPTIONS: { id: ColorScheme; hex: string }[] = [
  { id: 'teal', hex: '#319795' },
  { id: 'blue', hex: '#3182CE' },
  { id: 'green', hex: '#38A169' },
  { id: 'orange', hex: '#DD6B20' },
  { id: 'yellow', hex: '#D69E2E' },
  { id: 'red', hex: '#E53E3E' },
  { id: 'purple', hex: '#805AD5' },
  { id: 'gray', hex: '#718096' },
];

const CATEGORY_LABELS: Record<string, string> = {
  tools: 'Tools',
  vehicles: 'Vehicles',
  buildings: 'Buildings',
  documents: 'Documents',
};

interface DecalPickerProps {
  selectedId: string;
  colorScheme: ColorScheme;
  decalScale: number;
  helmetColor: HelmetColor;
  onSelect: (id: string) => void;
  onColorChange: (scheme: ColorScheme) => void;
  onScaleChange: (scale: number) => void;
  onHelmetColorChange: (color: HelmetColor) => void;
}

export function DecalPicker({
  selectedId,
  colorScheme,
  decalScale,
  helmetColor,
  onSelect,
  onColorChange,
  onScaleChange,
  onHelmetColorChange,
}: DecalPickerProps) {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filtered = filterCategory
    ? SVG_ENTRIES.filter((e) => e.category === filterCategory)
    : SVG_ENTRIES;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>DECAL PICKER</div>

      {/* Helmet color toggle */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Helmet</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <HelmetPill
            label="Yellow"
            hex="#D69E2E"
            active={helmetColor === 'yellow'}
            onClick={() => onHelmetColorChange('yellow')}
          />
          <HelmetPill
            label="White"
            hex="#E2E8F0"
            active={helmetColor === 'white'}
            onClick={() => onHelmetColorChange('white')}
          />
        </div>
      </div>

      {/* Decal color scheme */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Decal Color</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => onColorChange(c.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: c.id === colorScheme ? '2px solid #fff' : '2px solid transparent',
                background: c.hex,
                cursor: 'pointer',
                outline: c.id === colorScheme ? '1px solid rgba(255,255,255,0.3)' : 'none',
                outlineOffset: 2,
                transition: 'border 0.15s, outline 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scale slider */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={labelStyle}>Size</span>
          <span style={{ ...labelStyle, color: '#a0aec0' }}>{decalScale.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.3}
          max={3.0}
          step={0.05}
          value={decalScale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#319795' }}
        />
      </div>

      {/* Category filter */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <FilterPill
            label="All"
            active={filterCategory === null}
            onClick={() => setFilterCategory(null)}
          />
          {CATEGORIES.map((cat) => (
            <FilterPill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={filterCategory === cat}
              onClick={() => setFilterCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* SVG grid */}
      <div style={gridContainerStyle}>
        <div style={gridStyle}>
          {filtered.map((entry) => (
            <SvgThumb
              key={entry.id}
              entry={entry}
              colorScheme={colorScheme}
              selected={entry.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HelmetPill({
  label,
  hex,
  active,
  onClick,
}: {
  label: string;
  hex: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.65rem',
        fontWeight: 600,
        padding: '5px 12px',
        border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        cursor: 'pointer',
        color: active ? '#fff' : '#718096',
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: hex,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      />
      {label}
    </button>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.3px',
        padding: '4px 10px',
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        color: active ? '#fff' : '#718096',
        background: active ? 'rgba(49,151,149,0.5)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function SvgThumb({
  entry,
  colorScheme,
  selected,
  onSelect,
}: {
  entry: SvgEntry;
  colorScheme: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Comp = entry.Component;
  return (
    <button
      onClick={() => onSelect(entry.id)}
      title={entry.label}
      style={{
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        border: selected ? '2px solid #319795' : '1px solid rgba(255,255,255,0.08)',
        background: selected ? 'rgba(49,151,149,0.15)' : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        transition: 'border 0.15s, background 0.15s',
        padding: 0,
      }}
    >
      <Comp size={36} colorScheme={colorScheme} />
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  bottom: 80,
  width: 260,
  background: 'rgba(11, 20, 38, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 10,
};

const headerStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '1.5px',
  color: '#718096',
  padding: '14px 16px 8px',
};

const sectionStyle: React.CSSProperties = {
  padding: '6px 16px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.65rem',
  fontWeight: 600,
  color: '#a0aec0',
  marginBottom: 6,
};

const gridContainerStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '8px 12px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 56px)',
  gap: 6,
  justifyContent: 'center',
};
