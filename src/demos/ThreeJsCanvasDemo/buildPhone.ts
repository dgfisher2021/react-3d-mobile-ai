import * as THREE from 'three';
import { PHONE } from './phoneConstants';

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * Constructs the full iPhone-15-Pro-ish hero: titanium frame, screen bezel,
 * textured screen plane, dynamic island pill, side buttons, rear camera
 * module with three lenses, and back glass. Returns a Group.
 */
export function buildPhone(screenTexture: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const { w, h, d, corner, bezel, island } = PHONE;

  // Body
  const bodyShape = roundedRect(w, h, corner);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 4,
    curveSegments: 24,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a30,
    metalness: 0.85,
    roughness: 0.28,
  });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Screen bezel (black glass behind screen)
  const bezelShape = roundedRect(w - 0.02, h - 0.02, corner - 0.01);
  const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
    depth: 0.005,
    bevelEnabled: false,
    curveSegments: 24,
  });
  bezelGeo.center();
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x050508,
    metalness: 0.1,
    roughness: 0.6,
  });
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.z = d / 2 + 0.003;
  group.add(bezelMesh);

  // Screen plane with dashboard texture. Opaque — the canvas is already
  // opaque inside the rounded rect, and `transparent: true` was enabling
  // alpha blending against the dark bezel which produced a milky film.
  const screenW = w - bezel * 2;
  const screenH = h - bezel * 2;
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH, 1, 1);
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.z = d / 2 + 0.012;
  group.add(screen);

  // Glass reflection overlay — a faint diagonal highlight baked into a
  // canvas, composited on top of the screen with additive blending. This is
  // what gives the Three.js demo the same glossy feel as the CSS3D demo.
  const glossCanvas = document.createElement('canvas');
  glossCanvas.width = 256;
  glossCanvas.height = 512;
  const gctx = glossCanvas.getContext('2d');
  if (gctx) {
    gctx.clearRect(0, 0, 256, 512);
    const hi = gctx.createLinearGradient(0, 0, 256, 512);
    hi.addColorStop(0, 'rgba(255,255,255,0.16)');
    hi.addColorStop(0.35, 'rgba(255,255,255,0.02)');
    hi.addColorStop(0.6, 'rgba(255,255,255,0)');
    hi.addColorStop(0.85, 'rgba(255,255,255,0.02)');
    hi.addColorStop(1, 'rgba(255,255,255,0.06)');
    gctx.fillStyle = hi;
    gctx.fillRect(0, 0, 256, 512);
    // Soft hotspot near top-left for the "sheen" pop.
    const hot = gctx.createRadialGradient(60, 90, 0, 60, 90, 180);
    hot.addColorStop(0, 'rgba(255,255,255,0.22)');
    hot.addColorStop(1, 'rgba(255,255,255,0)');
    gctx.fillStyle = hot;
    gctx.fillRect(0, 0, 256, 512);
  }
  const glossTex = new THREE.CanvasTexture(glossCanvas);
  glossTex.colorSpace = THREE.SRGBColorSpace;
  glossTex.needsUpdate = true;
  const glossMat = new THREE.MeshBasicMaterial({
    map: glossTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const gloss = new THREE.Mesh(screenGeo, glossMat);
  gloss.position.z = d / 2 + 0.014;
  group.add(gloss);

  // Dynamic island pill overlayed on top of everything on the screen.
  const islandShape = roundedRect(island.w, island.h, island.h / 2);
  const islandGeo = new THREE.ShapeGeometry(islandShape, 16);
  const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const islandMesh = new THREE.Mesh(islandGeo, islandMat);
  islandMesh.position.set(0, island.y, d / 2 + 0.0155);
  group.add(islandMesh);

  // Side buttons
  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a42,
    metalness: 0.9,
    roughness: 0.25,
  });
  const powerGeo = new THREE.BoxGeometry(0.02, 0.28, 0.04);
  const power = new THREE.Mesh(powerGeo, buttonMat);
  power.position.set(w / 2 + 0.01, 0.4, 0);
  group.add(power);

  const volUpGeo = new THREE.BoxGeometry(0.02, 0.18, 0.04);
  const volUp = new THREE.Mesh(volUpGeo, buttonMat);
  volUp.position.set(-w / 2 - 0.01, 0.55, 0);
  group.add(volUp);

  const volDown = new THREE.Mesh(volUpGeo, buttonMat);
  volDown.position.set(-w / 2 - 0.01, 0.28, 0);
  group.add(volDown);

  const actionGeo = new THREE.BoxGeometry(0.02, 0.1, 0.04);
  const action = new THREE.Mesh(actionGeo, buttonMat);
  action.position.set(-w / 2 - 0.01, 0.82, 0);
  group.add(action);

  // Rear camera module
  const camPlatformGeo = new THREE.BoxGeometry(0.48, 0.48, 0.04);
  const camPlatformMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a30,
    metalness: 0.85,
    roughness: 0.3,
  });
  const camPlatform = new THREE.Mesh(camPlatformGeo, camPlatformMat);
  camPlatform.position.set(-w / 2 + 0.34, h / 2 - 0.34, -d / 2 - 0.02);
  group.add(camPlatform);

  const lensGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24);
  lensGeo.rotateX(Math.PI / 2);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x111118,
    metalness: 0.4,
    roughness: 0.2,
  });
  const lensRingMat = new THREE.MeshStandardMaterial({
    color: 0x444450,
    metalness: 0.95,
    roughness: 0.15,
  });
  const ringGeo = new THREE.TorusGeometry(0.08, 0.012, 12, 24);

  const lensPositions: [number, number][] = [
    [-w / 2 + 0.22, h / 2 - 0.22],
    [-w / 2 + 0.46, h / 2 - 0.22],
    [-w / 2 + 0.22, h / 2 - 0.46],
  ];
  lensPositions.forEach(([lx, ly]) => {
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(lx, ly, -d / 2 - 0.035);
    group.add(lens);
    const ring = new THREE.Mesh(ringGeo, lensRingMat);
    ring.position.set(lx, ly, -d / 2 - 0.04);
    group.add(ring);
  });

  // Back glass
  const backShape = roundedRect(w - 0.03, h - 0.03, corner - 0.015);
  const backGeo = new THREE.ShapeGeometry(backShape, 24);
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c22,
    metalness: 0.15,
    roughness: 0.55,
  });
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.z = -d / 2 - 0.001;
  back.rotation.y = Math.PI;
  group.add(back);

  return group;
}
