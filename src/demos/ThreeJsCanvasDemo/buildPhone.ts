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
 * Constructs the full iPhone-15-Pro-ish hero: titanium frame, flat screen
 * bezel, textured screen plane, dynamic island pill, side buttons, rear
 * camera module with three lenses, and back glass. Returns a Group.
 *
 * Z-stack note: the body is an ExtrudeGeometry with bevelThickness 0.015
 * *on each end*, so its centered bounding box runs from -0.095 to +0.095
 * (not -0.08 to +0.08). Everything screen-side must sit in front of that
 * 0.095 face or it will be hidden inside the titanium frame. Current
 * offsets from FRONT_Z (= 0.095):
 *   bezel (flat)    + 0.003
 *   screen plane    + 0.005
 *   dynamic island  + 0.007
 */
export function buildPhone(screenTexture: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const { w, h, d, corner, bezel, island } = PHONE;

  // The bevel extends the extrude depth by bevelThickness on each side,
  // so the visible front surface of the body sits at +FRONT_Z, not +d/2.
  const BEVEL_T = 0.015;
  const FRONT_Z = d / 2 + BEVEL_T;

  // Titanium frame. Physical material + low roughness so the PMREM
  // environment gives it a crisp, sweeping highlight along the bevel,
  // plus a thin clearcoat for the "ceramic-glass front" feel.
  const bodyShape = roundedRect(w, h, corner);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: BEVEL_T,
    bevelSize: 0.012,
    bevelSegments: 6,
    curveSegments: 32,
  });
  bodyGeo.center();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a3a44,
    metalness: 1.0,
    roughness: 0.22,
    clearcoat: 0.5,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.15,
  });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Screen bezel — a flat ShapeGeometry (zero thickness) sitting between
  // the body's front bevel and the screen plane. Using an ExtrudeGeometry
  // with depth > 0 was centering a 0.005-thick slab around FRONT_Z + 0.003,
  // which pushed the bezel's FRONT face to z=0.1005 — in front of the
  // screen at z=0.1 — completely covering the dashboard. A flat plane has
  // no such thickness trap.
  const bezelShape = roundedRect(w - 0.02, h - 0.02, corner - 0.01);
  const bezelGeo = new THREE.ShapeGeometry(bezelShape, 24);
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x050508,
    metalness: 0.1,
    roughness: 0.6,
  });
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.z = FRONT_Z + 0.003;
  group.add(bezelMesh);

  // Screen plane with dashboard texture. Uses a rounded ShapeGeometry
  // instead of a flat PlaneGeometry so the mesh's corners match the
  // rounded clip painted into the canvas — without this the plane's
  // rectangular corners would render as black squares sticking out
  // past the rounded dashboard art. Corner radius (42 logical pt, =
  // 42/393 of the screen width in world units) is kept in sync with
  // the canvas `cornerR` in drawScreen.ts and the CSS3D/R3F demos.
  const screenW = w - bezel * 2;
  const screenH = h - bezel * 2;
  const SCREEN_CORNER = (42 / 393) * screenW;
  const screenGeo = new THREE.ShapeGeometry(
    roundedRect(screenW, screenH, SCREEN_CORNER),
    24,
  );
  // ShapeGeometry emits raw XY as UVs; remap them to [0,1] over the
  // shape's bounding box so the canvas texture maps 1:1 across the
  // rounded rect.
  {
    const uv = screenGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) + screenW / 2) / screenW, (uv.getY(i) + screenH / 2) / screenH);
    }
    uv.needsUpdate = true;
  }
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.z = FRONT_Z + 0.005;
  group.add(screen);

  // Dynamic island pill overlayed on top of the screen.
  const islandShape = roundedRect(island.w, island.h, island.h / 2);
  const islandGeo = new THREE.ShapeGeometry(islandShape, 16);
  const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const islandMesh = new THREE.Mesh(islandGeo, islandMat);
  islandMesh.position.set(0, island.y, FRONT_Z + 0.007);
  group.add(islandMesh);

  // Side buttons — polished titanium
  const buttonMat = new THREE.MeshPhysicalMaterial({
    color: 0x4a4a54,
    metalness: 1.0,
    roughness: 0.18,
    envMapIntensity: 1.2,
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
  const camPlatformMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a3a44,
    metalness: 1.0,
    roughness: 0.25,
    envMapIntensity: 1.1,
  });
  const camPlatform = new THREE.Mesh(camPlatformGeo, camPlatformMat);
  camPlatform.position.set(-w / 2 + 0.34, h / 2 - 0.34, -d / 2 - 0.02);
  group.add(camPlatform);

  const lensGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24);
  lensGeo.rotateX(Math.PI / 2);
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x080810,
    metalness: 0.3,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.4,
  });
  const lensRingMat = new THREE.MeshPhysicalMaterial({
    color: 0x5a5a65,
    metalness: 1.0,
    roughness: 0.12,
    envMapIntensity: 1.4,
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

  // Back glass — frosted with a slight sheen from the IBL
  const backShape = roundedRect(w - 0.03, h - 0.03, corner - 0.015);
  const backGeo = new THREE.ShapeGeometry(backShape, 24);
  const backMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c1c24,
    metalness: 0.2,
    roughness: 0.45,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.9,
  });
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.z = -d / 2 - 0.001;
  back.rotation.y = Math.PI;
  group.add(back);

  return group;
}
