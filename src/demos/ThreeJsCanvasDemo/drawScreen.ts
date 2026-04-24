/**
 * Paints the dashboard onto a 512x1024 canvas, which is then
 * used as a THREE.CanvasTexture on the phone's screen plane. This is a
 * static snapshot (the pure-THREE.js demo can't mount React into WebGL).
 */
export function drawScreen(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width; // 512
  const H = canvas.height; // 1024
  const s = W / 393; // scale from iPhone logical px

  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Lucide-style stroked icons rendered onto canvas. Each takes a center
  // point and a size (height of the icon bounding box). We keep stroke
  // widths proportional so icons read crisply at the texture's native 512px.
  const iconStroke = (cx: number, cy: number, size: number, color: string) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, size * 0.1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.translate(cx, cy);
  };
  const iconEnd = () => ctx.restore();

  const drawStarIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    const outer = size / 2;
    const inner = outer * 0.4;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    iconEnd();
  };

  const drawFileTextIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    const w = size * 0.72;
    const h = size * 0.9;
    const x = -w / 2;
    const y = -h / 2;
    const fold = size * 0.22;
    // Document outline with folded corner
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - fold, y);
    ctx.lineTo(x + w, y + fold);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.stroke();
    // Fold tab
    ctx.beginPath();
    ctx.moveTo(x + w - fold, y);
    ctx.lineTo(x + w - fold, y + fold);
    ctx.lineTo(x + w, y + fold);
    ctx.stroke();
    // Text lines
    const lineInset = size * 0.14;
    ctx.beginPath();
    ctx.moveTo(x + lineInset, y + h * 0.6);
    ctx.lineTo(x + w - lineInset, y + h * 0.6);
    ctx.moveTo(x + lineInset, y + h * 0.78);
    ctx.lineTo(x + w - lineInset, y + h * 0.78);
    ctx.stroke();
    iconEnd();
  };

  const drawCalendarIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    const w = size * 0.8;
    const h = size * 0.78;
    const x = -w / 2;
    const y = -h / 2 + size * 0.04;
    const rad = size * 0.08;
    // Top bindings
    ctx.beginPath();
    ctx.moveTo(x + w * 0.28, y - size * 0.16);
    ctx.lineTo(x + w * 0.28, y + size * 0.1);
    ctx.moveTo(x + w * 0.72, y - size * 0.16);
    ctx.lineTo(x + w * 0.72, y + size * 0.1);
    ctx.stroke();
    // Body rect
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
    ctx.stroke();
    // Divider
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.32);
    ctx.lineTo(x + w, y + h * 0.32);
    ctx.stroke();
    iconEnd();
  };

  const drawLayersIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    const half = size * 0.48;
    // Top diamond
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half, -half * 0.3);
    ctx.lineTo(0, half * 0.35);
    ctx.lineTo(-half, -half * 0.3);
    ctx.closePath();
    ctx.stroke();
    // Second layer
    ctx.beginPath();
    ctx.moveTo(-half, half * 0.05);
    ctx.lineTo(0, half * 0.7);
    ctx.lineTo(half, half * 0.05);
    ctx.stroke();
    iconEnd();
  };

  const drawSparklesIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    ctx.fillStyle = color;
    const sparkle = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x + r * 0.18, y - r * 0.18, x + r, y);
      ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.18, x, y + r);
      ctx.quadraticCurveTo(x - r * 0.18, y + r * 0.18, x - r, y);
      ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.18, x, y - r);
      ctx.closePath();
      ctx.fill();
    };
    sparkle(0, 0, size * 0.42);
    sparkle(size * 0.32, -size * 0.34, size * 0.15);
    sparkle(-size * 0.3, size * 0.28, size * 0.12);
    iconEnd();
  };

  const drawTargetIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    iconEnd();
  };

  const drawAlertTriangleIcon = (cx: number, cy: number, size: number, color: string) => {
    iconStroke(cx, cy, size, color);
    const h = size * 0.85;
    const w = size * 0.95;
    const r = size * 0.08;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, h / 2);
    ctx.lineTo(w / 2 - r, h / 2);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r * 0.5, h / 2 - r * 0.7);
    ctx.lineTo(r * 0.7, -h / 2 + r);
    ctx.quadraticCurveTo(0, -h / 2 - r * 0.2, -r * 0.7, -h / 2 + r);
    ctx.lineTo(-w / 2 + r * 0.5, h / 2 - r * 0.7);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);
    ctx.closePath();
    ctx.stroke();
    // Exclamation
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.2);
    ctx.lineTo(0, h * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, h * 0.3, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    iconEnd();
  };

  ctx.clearRect(0, 0, W, H);
  // Screen corner radius in logical points. Kept at 42 to match the
  // CSS3D and R3F demos — see buildPhone.ts which mirrors this value so
  // the screen mesh geometry matches the painted clip.
  const cornerR = 42 * s;
  rr(0, 0, W, H, cornerR);
  ctx.save();
  ctx.clip();

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0B1426');
  grad.addColorStop(1, '#0d1b2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Dynamic Island
  const islandW = 105 * s;
  const islandH = 30 * s;
  ctx.fillStyle = '#000000';
  rr(W / 2 - islandW / 2, 4 * s, islandW, islandH, 15 * s);
  ctx.fill();

  // Status bar
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${Math.round(12 * s)}px -apple-system, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 18 * s, 20 * s);
  ctx.textAlign = 'right';
  ctx.font = `${Math.round(10 * s)}px -apple-system, sans-serif`;
  ctx.fillText('5G', W - 50 * s, 20 * s);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  const bx = W - 40 * s;
  const by = 15 * s;
  const bw = 24 * s;
  const bh = 12 * s;
  rr(bx, by, bw, bh, 3 * s);
  ctx.stroke();
  ctx.fillStyle = '#48BB78';
  rr(bx + 2, by + 2, bw * 0.72, bh - 4, 2 * s);
  ctx.fill();
  ctx.textAlign = 'left';

  // App header
  let cy = 54 * s;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(18 * s)}px -apple-system, sans-serif`;
  ctx.fillText('3D Device Viewer', 18 * s, cy);
  cy += 18 * s;
  ctx.fillStyle = '#718096';
  ctx.font = `${Math.round(10 * s)}px -apple-system, sans-serif`;
  ctx.fillText('React + Three.js Demo', 18 * s, cy);
  cy += 24 * s;

  // KPI cards (2x2)
  const kpis = [
    { val: '5', label: 'Ticket Types', color: '#4299E1' },
    { val: '4', label: 'Ceremonies', color: '#48BB78' },
    { val: '2wk', label: 'Sprints', color: '#9F7AEA' },
    { val: '1:1', label: 'Pt = Hr', color: '#ECC94B' },
  ];
  const cardW = (W - 44 * s) / 2;
  const cardH = 52 * s;
  kpis.forEach((kpi, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 16 * s + col * (cardW + 10 * s);
    const ccy = cy + row * (cardH + 8 * s);
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    rr(cx, ccy, cardW, cardH, 12 * s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    rr(cx, ccy, cardW, cardH, 12 * s);
    ctx.stroke();
    ctx.fillStyle = kpi.color;
    ctx.font = `bold ${Math.round(20 * s)}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(kpi.val, cx + cardW / 2, ccy + 24 * s);
    ctx.fillStyle = '#718096';
    ctx.font = `500 ${Math.round(8 * s)}px -apple-system, sans-serif`;
    ctx.fillText(kpi.label, cx + cardW / 2, ccy + 42 * s);
    ctx.textAlign = 'left';
  });
  cy += cardH * 2 + 24 * s;

  // Golden Rule card
  const grH = 68 * s;
  const grGrad = ctx.createLinearGradient(16 * s, cy, W - 16 * s, cy + grH);
  grGrad.addColorStop(0, 'rgba(236,201,75,0.12)');
  grGrad.addColorStop(1, 'rgba(236,201,75,0.03)');
  ctx.fillStyle = grGrad;
  rr(16 * s, cy, W - 32 * s, grH, 14 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(236,201,75,0.2)';
  rr(16 * s, cy, W - 32 * s, grH, 14 * s);
  ctx.stroke();
  drawTargetIcon(32 * s, cy + 18 * s, 14 * s, '#ECC94B');
  ctx.fillStyle = '#ECC94B';
  ctx.font = `bold ${Math.round(11 * s)}px -apple-system, sans-serif`;
  ctx.fillText('The Golden Rule', 44 * s, cy + 20 * s);
  ctx.fillStyle = '#CBD5E0';
  ctx.font = `${Math.round(9 * s)}px -apple-system, sans-serif`;
  ctx.fillText('"Does this need sub-items that', 28 * s, cy + 40 * s);
  ctx.fillText('THEMSELVES need sub-items?"', 28 * s, cy + 54 * s);
  cy += grH + 12 * s;

  // Title Conventions card
  const tcH = 152 * s;
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  rr(16 * s, cy, W - 32 * s, tcH, 14 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  rr(16 * s, cy, W - 32 * s, tcH, 14 * s);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(11 * s)}px -apple-system, sans-serif`;
  ctx.fillText('Title Conventions', 28 * s, cy + 18 * s);

  const conventions = [
    { type: 'Epic', rule: 'PROJECT: Epic Title', color: '#9F7AEA' },
    { type: 'Story', rule: 'Clear action statement', color: '#48BB78' },
    { type: 'Bug', rule: '[Area]: Broken behavior', color: '#F56565' },
    { type: 'Task', rule: 'Technical action verb', color: '#4299E1' },
    { type: 'Spike', rule: 'Prefixed with [Spike]', color: '#ECC94B' },
  ];
  conventions.forEach((c, i) => {
    const iy = cy + 32 * s + i * 22 * s;
    ctx.fillStyle = c.color + '10';
    rr(24 * s, iy, W - 50 * s, 18 * s, 6 * s);
    ctx.fill();
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(32 * s, iy + 9 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `600 ${Math.round(8.5 * s)}px -apple-system, sans-serif`;
    ctx.fillText(c.type + ':', 40 * s, iy + 12 * s);
    ctx.fillStyle = '#718096';
    ctx.font = `${Math.round(8 * s)}px -apple-system, sans-serif`;
    const typeWidth = ctx.measureText(c.type + ': ').width;
    ctx.fillText(c.rule, 40 * s + typeWidth + 2, iy + 12 * s);
  });
  cy += tcH + 12 * s;

  // Epic Warning card
  const ewH = 54 * s;
  const ewGrad = ctx.createLinearGradient(16 * s, cy, W - 16 * s, cy + ewH);
  ewGrad.addColorStop(0, 'rgba(245,101,101,0.1)');
  ewGrad.addColorStop(1, 'rgba(245,101,101,0.03)');
  ctx.fillStyle = ewGrad;
  rr(16 * s, cy, W - 32 * s, ewH, 14 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,101,101,0.2)';
  rr(16 * s, cy, W - 32 * s, ewH, 14 * s);
  ctx.stroke();
  drawAlertTriangleIcon(32 * s, cy + 16 * s, 14 * s, '#F56565');
  ctx.fillStyle = '#F56565';
  ctx.font = `bold ${Math.round(10 * s)}px -apple-system, sans-serif`;
  ctx.fillText('Epic 10-Week Warning', 44 * s, cy + 18 * s);
  ctx.fillStyle = '#CBD5E0';
  ctx.font = `${Math.round(8 * s)}px -apple-system, sans-serif`;
  ctx.fillText('4+ feature groups? 3+ owners?', 28 * s, cy + 36 * s);
  ctx.fillText('→ Probably a Project. Split it.', 28 * s, cy + 48 * s);

  // Bottom nav
  const navY = H - 72 * s;
  ctx.fillStyle = 'rgba(11,20,38,0.95)';
  ctx.fillRect(0, navY, W, 72 * s);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, navY);
  ctx.lineTo(W, navY);
  ctx.stroke();

  type TabKind = 'standards' | 'tickets' | 'ai' | 'meetings' | 'hierarchy';
  const tabs: { label: string; kind: TabKind; active: boolean; isCenter: boolean }[] = [
    { label: 'Standards', kind: 'standards', active: true, isCenter: false },
    { label: 'Tickets', kind: 'tickets', active: false, isCenter: false },
    { label: 'Ask AI', kind: 'ai', active: false, isCenter: true },
    { label: 'Meetings', kind: 'meetings', active: false, isCenter: false },
    { label: 'Hierarchy', kind: 'hierarchy', active: false, isCenter: false },
  ];

  const drawTabIcon = (kind: TabKind, cx: number, cy: number, size: number, color: string) => {
    switch (kind) {
      case 'standards':
        return drawStarIcon(cx, cy, size, color);
      case 'tickets':
        return drawFileTextIcon(cx, cy, size, color);
      case 'ai':
        return drawSparklesIcon(cx, cy, size, color);
      case 'meetings':
        return drawCalendarIcon(cx, cy, size, color);
      case 'hierarchy':
        return drawLayersIcon(cx, cy, size, color);
    }
  };

  const tabW = W / 5;
  tabs.forEach((tab, i) => {
    const tabX = i * tabW + tabW / 2;

    if (tab.isCenter) {
      // Lifted FAB-style "Ask AI" circle, matching BottomNav.tsx
      const fabCY = navY + 6 * s;
      const fabR = 20 * s;
      const cGrad = ctx.createLinearGradient(tabX - fabR, fabCY - fabR, tabX + fabR, fabCY + fabR);
      cGrad.addColorStop(0, '#3182CE');
      cGrad.addColorStop(1, '#319795');
      // subtle glow ring
      ctx.fillStyle = 'rgba(49,130,206,0.18)';
      ctx.beginPath();
      ctx.arc(tabX, fabCY, fabR + 5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(tabX, fabCY, fabR, 0, Math.PI * 2);
      ctx.fill();
      // ring outline to match the `border: 3px solid navBg` in BottomNav
      ctx.strokeStyle = '#0B1426';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(tabX, fabCY, fabR, 0, Math.PI * 2);
      ctx.stroke();
      drawSparklesIcon(tabX, fabCY, 18 * s, '#FFFFFF');
      ctx.font = `600 ${Math.round(7 * s)}px -apple-system, sans-serif`;
      ctx.fillStyle = '#319795';
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tabX, fabCY + fabR + 10 * s);
    } else {
      const iconY = navY + 22 * s;
      const iconColor = tab.active ? '#319795' : '#718096';
      drawTabIcon(tab.kind, tabX, iconY, 16 * s, iconColor);
      ctx.font = `${tab.active ? '700' : '500'} ${Math.round(7.5 * s)}px -apple-system, sans-serif`;
      ctx.fillStyle = iconColor;
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tabX, iconY + 18 * s);
      if (tab.active) {
        ctx.fillStyle = '#319795';
        ctx.beginPath();
        ctx.arc(tabX, iconY + 26 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.textAlign = 'left';

  // Home indicator
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(W / 2 - 50 * s, H - 8 * s, 100 * s, 4 * s, 2 * s);
  ctx.fill();

  ctx.restore();
}
