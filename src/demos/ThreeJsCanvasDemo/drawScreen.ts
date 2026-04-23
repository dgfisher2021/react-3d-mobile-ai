/**
 * Paints the PPM Standards dashboard onto a 512x1024 canvas, which is then
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

  ctx.clearRect(0, 0, W, H);
  const cornerR = 32 * s;
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
  ctx.fillText('Sprint Planning', 18 * s, cy);
  cy += 18 * s;
  ctx.fillStyle = '#718096';
  ctx.font = `${Math.round(10 * s)}px -apple-system, sans-serif`;
  ctx.fillText('PPM Technology • Reference Guide', 18 * s, cy);
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
  ctx.fillStyle = '#ECC94B';
  ctx.beginPath();
  ctx.arc(32 * s, cy + 18 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillStyle = '#F56565';
  ctx.beginPath();
  const tx = 32 * s;
  const ty = cy + 14 * s;
  ctx.moveTo(tx, ty - 5 * s);
  ctx.lineTo(tx + 5 * s, ty + 5 * s);
  ctx.lineTo(tx - 5 * s, ty + 5 * s);
  ctx.closePath();
  ctx.fill();
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

  const tabs = [
    { label: 'Standards', active: true, isCenter: false },
    { label: 'Tickets', active: false, isCenter: false },
    { label: 'AI', active: false, isCenter: true },
    { label: 'Meetings', active: false, isCenter: false },
    { label: 'Hierarchy', active: false, isCenter: false },
  ];
  const tabW = W / 5;
  tabs.forEach((tab, i) => {
    const tabX = i * tabW + tabW / 2;
    const tabY = navY + (tab.isCenter ? 14 * s : 24 * s);

    if (tab.isCenter) {
      const cGrad = ctx.createLinearGradient(
        tabX - 18 * s,
        tabY - 18 * s,
        tabX + 18 * s,
        tabY + 18 * s,
      );
      cGrad.addColorStop(0, '#3182CE');
      cGrad.addColorStop(1, '#319795');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(tabX, tabY, 18 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      const outerR = 7 * s;
      const innerR = 2.5 * s;
      for (let p = 0; p < 4; p++) {
        const angle = (p * Math.PI) / 2 - Math.PI / 2;
        const nextAngle = angle + Math.PI / 4;
        ctx.lineTo(tabX + Math.cos(angle) * outerR, tabY + Math.sin(angle) * outerR);
        ctx.lineTo(tabX + Math.cos(nextAngle) * innerR, tabY + Math.sin(nextAngle) * innerR);
      }
      ctx.closePath();
      ctx.fill();
      ctx.font = `600 ${Math.round(8 * s)}px -apple-system, sans-serif`;
      ctx.fillStyle = '#319795';
      ctx.textAlign = 'center';
      ctx.fillText('Ask AI', tabX, tabY + 34 * s);
    } else {
      ctx.fillStyle = tab.active ? '#319795' : '#718096';
      ctx.beginPath();
      ctx.arc(tabX, tabY, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${tab.active ? '700' : '500'} ${Math.round(8 * s)}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tabX, tabY + 20 * s);
      if (tab.active) {
        ctx.beginPath();
        ctx.arc(tabX, tabY + 28 * s, 2 * s, 0, Math.PI * 2);
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
