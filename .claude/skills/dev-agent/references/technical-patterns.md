# Technical Patterns

Hard-won patterns specific to this project.

## GLB Screen Overlay

Full documentation in `docs/glb-screen-overlay.md`. Key formulas:

### distanceFactor

```
DF = worldW * 400 / (cssWidth * parentScale)
```

Derived from drei source: `node_modules/@react-three/drei/web/Html.js` line 271.

### Auto-sizing

- Use `Box3.setFromObject(screenMesh)` for world-space dimensions (handles parent rotations)
- Do NOT use `geometry.computeBoundingBox() * getWorldScale()` — breaks when parent rotations swap axes
- Freeze Float during measurement (`measured` state)

### Auto-rotation

```typescript
const meshQuat = mesh.getWorldQuaternion(new Quaternion());
const groupQuat = groupRef.getWorldQuaternion(new Quaternion());
const relativeQuat = groupQuat.invert().multiply(meshQuat);
const autoRotation = new Euler().setFromQuaternion(relativeQuat);
```

### Retina rendering

`RENDER_SCALE = 2`. CSS container is 2x size. Inner dashboard renders at native width with `transform: scale(2)`. For landscape devices, scale native width proportionally: `Math.round(852 * (worldW / worldH))`.

### Glass overlay

Material from iPhone GLB: `color: 0x070707, roughness: 0, transparent: true, opacity: 0.111, side: DoubleSide`. Read from GLB binary with `node -e` parsing the JSON chunk.

### Occlusion

Use `occlude="blending"`. Screen mesh must be opaque black (not transparent) for depth buffer writes. Transparent meshes don't write to depth buffer.

### Positioning

`mesh.getWorldPosition → scene.matrixWorld.invert()` gives scene-local center. Per-device `htmlPosition` offset handles depth. The MacBook's pivot is offset from geometry center — needs `htmlPosition: [0, 2.092, 0.042]`.

## Shared Constants

All in `src/constants/demoSettings.ts`:

- Camera: fov=35, z=5.5, zoom 3-8
- Auto-rotate: ~9 deg/sec across all coordinate systems
- Float: speed=1.5, rotationIntensity=0.1, floatIntensity=0.3
- View presets: Front/Angle/Back in radians, orbit angles, and CSS degrees

## State Architecture

Currently: DemoContext (theme, autoRotate, activePreset) + SettingsContext (toggles, display values).
Planned: Zustand v5 migration (see `specs/upgrade-roadmap.md` Spec 2).

## React Version

**React 18.3.1.** Do NOT use React 19 features until Spec 1 of the upgrade roadmap is completed.
