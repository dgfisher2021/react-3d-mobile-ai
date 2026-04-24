# MacBook Pro GLB Screen Overlay Setup

## Briefing

This project renders 3D device models with a live React dashboard on their screens. The iPhone 13 Pro is already working — auto-sized screen overlay, retina rendering, depth occlusion. The MacBook Pro needs the same treatment.

The DeviceModel component at `src/demos/GLBModelDemo/DeviceModel.tsx` already handles everything generically — auto-sizing from geometry, distanceFactor formula, Float freeze during measurement, occlude="blending", CSS scaleX(-1) for mirroring. All you need to do is find the correct config values for the MacBook.

## What the iPhone config looks like (for reference)

```typescript
{
  id: 'iphone',
  screenNode: 'Body_Wallpaper_0',    // mesh to find + make black
  htmlPosition: [0, 0, -0.025],      // Z offset to push Html to screen surface
  htmlRotation: [0, 0, 0],           // no extra rotation needed
  modelRotation: [0, Math.PI, 0],    // 180° Y to face camera
  portrait: true,
}
```

## What you need to figure out for the MacBook

The MacBook GLB (`public/macbook.glb`) has this mesh structure (from gltfjsx):

```jsx
<group position={[0.002, -0.038, 0.414]} rotation={[0.014, 0, 0]}>
  <group position={[0, 2.965, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
    <mesh geometry={nodes.Cube008.geometry} material={materials.aluminium} />
    <mesh geometry={nodes.Cube008_1.geometry} material={materials['matte.001']} />
    <mesh geometry={nodes.Cube008_2.geometry} material={materials['screen.001']} />  ← SCREEN
  </group>
</group>
<mesh geometry={nodes.keyboard.geometry} ... />
<group position={[0, -0.1, 3.394]}>  ← trackpad area
  ...
</group>
```

Key differences from the iPhone:
1. **The screen is inside a tilted group** — `rotation={[Math.PI / 2, 0, 0]}` on the parent group means the screen is rotated 90° on X. The `htmlRotation` needs to account for this.
2. **The model may face the right direction already** — `modelRotation` might be `[0, 0, 0]` or `[0, Math.PI, 0]` depending on which way the MacBook faces natively.
3. **The screen is landscape** — `portrait: false`. The LiveDashboard is phone-shaped (393x852) which will look narrow on a laptop screen. That's OK for now — just get it rendering correctly.
4. **The Z offset will be different** — the screen depth position depends on the MacBook's geometry.

## Steps

### 1. Test which way the MacBook faces

Change the device picker to MacBook (it's already in the sidebar). Does the model show the screen or the back? If the back, you need `modelRotation: [0, Math.PI, 0]`. If the screen, use `[0, 0, 0]`.

Add a `console.log` in the DeviceModel mount useEffect to print what it finds:
```
console.log(`[MacBook] screenMesh found: ${!!screenMesh}, name: ${screenMesh?.name}`);
```

### 2. Check the screen mesh center position

The existing code logs `[Pos] localCenter: x=... y=... z=...`. Switch to MacBook in the UI and check the console. The center might not be at origin like the iPhone.

### 3. Find the correct htmlRotation

The MacBook's screen is inside a group with `rotation={[Math.PI / 2, 0, 0]}`. The Html needs to counter this within the scene hierarchy. Try `htmlRotation: [-Math.PI / 2, 0, 0]` first (the original config value). If the dashboard appears rotated, adjust.

### 4. Find the correct Z offset

Start with `htmlPosition: [0, 0, -0.025]` (same as iPhone). If the screen is too deep or too far forward, adjust. The wallpaper mesh should be made black — check that `screenNode: 'Cube008_2'` is the correct screen mesh (material name `screen.001` confirms it).

### 5. Update deviceConfigs.ts

Once you have the right values, update the MacBook entry in `src/demos/GLBModelDemo/deviceConfigs.ts`.

### 6. Verify

- Switch to MacBook in the GLB demo sidebar
- Screen overlay is visible on the MacBook screen
- Dashboard content is readable (not mirrored, not rotated)
- Rotating to the back hides the overlay (occlusion works)
- Float animation doesn't break the positioning
- Screen size matches the `Cube008_2` mesh

## Constraints

- React 18 — no React 19 features
- Branch: create `feature/macbook-screen` from `main`
- Run `npx tsc --noEmit` after changes
- Run `npx prettier --write` on files you touch
- Don't modify DeviceModel.tsx unless absolutely necessary — the component is generic. Only change deviceConfigs.ts.
- If DeviceModel needs changes for landscape support, document what and why before changing.

## What's already handled by DeviceModel

You don't need to implement any of these — they're generic:
- Auto-sizing from geometry (`geometry.computeBoundingBox + getWorldScale`)
- distanceFactor formula (`worldW * 400 / (cssWidth * parentScale)`)
- Retina rendering (RENDER_SCALE = 2, CSS transform: scale(2))
- Depth occlusion (occlude="blending")
- Float freeze during measurement
- Black wallpaper on load
- CSS scaleX(-1) when modelRotation Y ≠ 0
