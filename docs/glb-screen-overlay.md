# GLB Screen Overlay — How It Works

This document explains how the GLB demo overlays a live React dashboard onto a 3D device model's screen. Future agents should read this before modifying DeviceModel.tsx or deviceConfigs.ts.

## The Pattern

1. Load a GLB model via `useGLTF`
2. Find the screen mesh by name (e.g. `Body_Wallpaper_0` for iPhone, `Cube008_2` for MacBook)
3. Make the screen mesh opaque black (acts as depth occluder)
4. Compute the screen mesh's world-space center and dimensions
5. Render a drei `<Html transform>` at that position with auto-computed sizing
6. The Html content is the LiveDashboard React app

## Auto-Sizing

### distanceFactor formula

Derived from reading the drei Html source code (`node_modules/@react-three/drei/web/Html.js` line 271):

```
CSS matrix element = worldMatrixElement * (DF / 400)
```

For `cssWidth` CSS pixels to cover `worldW` world units inside a group with `parentScale`:

```
distanceFactor = worldW * 400 / (cssWidth * parentScale)
```

Where:

- `worldW` = screen mesh width in world units
- `cssWidth` = CSS pixel width of the Html container (393 \* RENDER_SCALE for retina)
- `parentScale` = the group's scale (normalizeScale, typically ~3.0)

### Screen dimensions

Use `Box3.setFromObject(screenMesh)` for world-space dimensions. This handles parent rotations correctly (e.g. MacBook's 90° X rotation on the lid group).

**Do NOT use** `geometry.computeBoundingBox() * getWorldScale()` — this breaks when parent rotations swap axes. The geometry approach gives local dimensions × scale magnitudes, which doesn't account for axis swapping from rotation. This caused `Screen Size: 2.078 x 0.000` for the MacBook (height was zero because the screen mesh's local Y became world Z after rotation).

### Retina rendering

`RENDER_SCALE = 2` doubles the CSS container size. Inside, the LiveDashboard renders at native 393px with `transform: scale(2)` and `transformOrigin: top left`. The browser renders at 2x resolution but the dashboard layout sees 393px width. This makes text and UI crisp on the 3D model.

## Auto-Positioning

### Screen center

1. `Box3.setFromObject(screenMesh).getCenter(worldCenter)` — gets the mesh center in world space
2. `scene.matrixWorld.invert()` → `worldCenter.applyMatrix4(invMatrix)` — converts to scene-local space
3. The Html is placed at this scene-local center + `config.htmlPosition` offset

The Html is a child of the inner group (`<group ref={groupRef} scale={actualScale} rotation={config.modelRotation}>`), which is a child of `<primitive object={scene}>`. So scene-local coordinates align with where the mesh sits in the model hierarchy.

### htmlPosition offset

Per-device Z offset to push the Html to the screen surface:

- iPhone: `[0, 0, -0.025]` — negative Z because modelRotation Y=π flips the Z axis
- MacBook: needs tuning — the lid angle means the screen surface is at a different depth

### Float animation

Float is FROZEN during measurement (`measured` state = false, Float speed/intensity = 0). After the screen dimensions and center are computed, `measured` is set to true and Float starts animating. This prevents the axis-aligned bounding box from fluctuating due to rotation.

## Occlusion

`occlude="blending"` on the Html component uses the WebGL depth buffer. The screen mesh is made opaque black (not transparent) so it writes to the depth buffer. When the camera sees the back of the phone, the body/frame meshes are closer to the camera than the Html, so the depth buffer hides it.

**Do NOT make the screen mesh transparent** (`opacity: 0, transparent: true`). Transparent meshes don't write to the depth buffer, breaking occlusion.

## Mirroring

When `config.modelRotation[1] !== 0` (Y rotation, e.g. iPhone 180°), the Html content appears mirrored because it inherits the parent group's rotation. CSS `transform: scaleX(-1)` on the inner div fixes this.

## Per-Device Config

Each device in `deviceConfigs.ts` specifies:

| Field            | Purpose                                      | Example (iPhone)              |
| ---------------- | -------------------------------------------- | ----------------------------- |
| `screenNode`     | Mesh name to find and replace                | `Body_Wallpaper_0`            |
| `htmlPosition`   | XYZ offset from auto-computed center         | `[0, 0, -0.025]`              |
| `htmlRotation`   | Euler rotation for the Html element          | `[0, 0, 0]`                   |
| `modelRotation`  | Base rotation to orient model toward camera  | `[0, Math.PI, 0]`             |
| `portrait`       | Affects corner radius (42 vs 8)              | `true`                        |
| `htmlSize`       | Fallback CSS dimensions if auto-sizing fails | `{ width: 393, height: 852 }` |
| `distanceFactor` | Fallback if auto-computation fails           | `1.5`                         |

## Adding a New Device

1. Run the model through `gltfjsx` to see the mesh hierarchy
2. Identify the screen mesh (look for materials named "screen", "wallpaper", "display", "layar")
3. Add an entry to `DEVICES` in `deviceConfigs.ts`
4. Set `modelRotation` — load the model, see which way it faces. If the back is toward camera, use `[0, Math.PI, 0]`
5. Set `htmlRotation` — if the screen mesh is inside a rotated parent group, you may need to counter-rotate. Use the settings panel's "Screen Rotation" input to tune this visually
6. Set `htmlPosition` Z offset — use the settings panel to adjust until the overlay sits on the screen surface
7. The auto-sizing (distanceFactor, htmlWidth, htmlHeight) should work automatically via Box3
8. Test: screen visible from front, hidden from back, not mirrored, correct size

## Glass Overlay

Not all GLB models have a glass mesh over the screen. The iPhone has `Body001_Screen_Glass_0` but the MacBook doesn't. DeviceModel creates a generated glass plane for all devices using a material that matches the iPhone's native glass.

### iPhone glass material (from the GLB)

Read from the GLB's JSON chunk using `node -e` to parse the binary:

```
alphaMode: BLEND
doubleSided: true
baseColorFactor: [0.028, 0.028, 0.028, 0.111]  (nearly black, ~11% opacity)
roughnessFactor: 0  (perfectly smooth/glossy)
No transmission, no IOR — just a simple transparent dark tint.
```

### Generated glass material

```typescript
new THREE.MeshStandardMaterial({
  color: 0x070707,
  roughness: 0,
  transparent: true,
  opacity: 0.111,
  side: THREE.DoubleSide,
});
```

The glass plane is a `<planeGeometry>` sized to `localW x localH` (screen mesh dimensions in the group's local units), positioned at the screen center with a tiny Z offset (+0.001) to sit in front of the Html overlay. It uses the same `htmlRot` (auto-computed rotation) so it aligns with the screen angle.

For devices that have a native glass mesh (iPhone), the generated glass renders on top — both glass layers stack. This is visually acceptable since the glass is very subtle (11% opacity). If it's too much, the native glass mesh can be hidden via the mesh layer tree.

## Positioning: Pivot vs Geometry Center

### The problem

`mesh.getWorldPosition()` returns the mesh's **pivot point**, not the center of its geometry. For the iPhone, the pivot is at the geometry center (both at origin), so it works. For the MacBook, the pivot is at the hinge (bottom of the screen lid), not the middle of the screen.

### Approaches tried

1. **`geometry.center()`** — Shifts all vertices so the bounding box center is at the local origin. This moves the pivot to the geometry center BUT it also visually shifts the mesh. When applied only to the screen mesh, it moved out of alignment with the frame/bezel siblings. When applied to all meshes in the group, each mesh centered independently and misaligned from each other.

2. **Geometry bbox center via `mesh.matrixWorld`** — Compute the geometry bounding box center in local space, then transform through `mesh.matrixWorld` to get the true geometry center in world space. This gives the correct position but broke the iPhone because the geometry center Z was -0.024 (midpoint of mesh thickness) instead of 0 (surface), which conflicted with the existing `htmlPosition` Z offset.

3. **Pivot + htmlPosition offset (current approach)** — Use `getWorldPosition` (pivot) for positioning and add a per-device `htmlPosition` offset in the config. The iPhone's pivot is at origin, so `htmlPosition: [0, 0, -0.025]` handles depth. The MacBook's pivot is at the hinge, so `htmlPosition: [0, 2.092, 0.042]` shifts the Html up to the screen center and forward to the surface.

### Why per-device offset works

The pivot position is stable and well-defined — it's set by the 3D artist and doesn't change. The offset from pivot to screen center is a fixed property of each model. This makes `htmlPosition` a reliable per-device calibration value. The downside is it's not auto-computed — each new device needs manual tuning via the settings panel.

### Future improvement

The geometry bbox approach (`mesh.geometry.boundingBox.getCenter → mesh.matrixWorld → scene inverse`) gives the correct center for any device without manual offset. The blocker is that it gives a Z value at the mesh midpoint, which doesn't work for the iPhone's current `htmlPosition` calibration. A unified approach would use geometry center for XYZ and eliminate `htmlPosition` entirely, but would need the depth nudge (to clear the glass) handled differently — possibly by pushing along the mesh's face normal by a fixed small amount.

## Landscape Devices (MacBook)

### Native width scaling

For portrait devices (phone), the dashboard renders at 393px native width. For landscape devices (laptop), the native width scales proportionally:

```typescript
const NATIVE_WIDTH = config.portrait ? 393 : Math.round(852 * (worldW / worldH));
```

Using 852 as the base (phone height) gives a landscape width of ~1316px for the MacBook. The `RENDER_SCALE = 2` doubles this for retina rendering. The inner dashboard div uses `width: htmlWidth / RENDER_SCALE` so the CSS layout sees the native width.

### Auto-rotation

The MacBook's screen mesh is inside a group with `rotation X=90°` (the lid). DeviceModel auto-computes the Html rotation from the screen mesh's world quaternion relative to the group quaternion:

```typescript
const meshQuat = mesh.getWorldQuaternion(new Quaternion());
const groupQuat = groupRef.getWorldQuaternion(new Quaternion());
const relativeQuat = groupQuat.invert().multiply(meshQuat);
const autoRotation = new Euler().setFromQuaternion(relativeQuat);
```

This gives `[90.8°, 0, 0]` for the MacBook — matching the lid angle automatically. No manual `htmlRotation` config needed.

## Common Issues

| Symptom                         | Cause                                                    | Fix                                                                      |
| ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Screen overlay is massive       | distanceFactor too large or computed wrong               | Check the formula: `worldW * 400 / (cssWidth * parentScale)`             |
| Screen Size height is zero      | Parent rotation swaps axes, geometry approach fails      | Use `Box3.setFromObject` instead of `geometry.boundingBox * worldScale`  |
| Screen visible through the back | Occlusion not working                                    | Make screen mesh opaque black, not transparent. Use `occlude="blending"` |
| Content is mirrored             | modelRotation flips the Html                             | Add CSS `scaleX(-1)` on the inner div                                    |
| Content is rotated/sideways     | Screen mesh has rotated parent group                     | Adjust `htmlRotation` to counter the parent rotation                     |
| Blue flash on load              | Screen mesh shows original texture before black override | Set mesh to black in the mount useEffect, not the showScreen effect      |
| Float makes screen drift        | Bounding box changes with Float rotation                 | Freeze Float during measurement (measured state)                         |
