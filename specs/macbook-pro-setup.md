# MacBook Pro GLB Screen Overlay Setup

## READ THIS FIRST — Context for the agent

The user is building a portfolio project — a 3D device viewer that shows live React dashboards on GLB model screens. The iPhone 13 Pro is WORKING perfectly. Do not break it. The user wants the MacBook Pro to work the same way.

The user cares deeply about quality and consistency. They've been tuning the iPhone for hours. They will test your work visually. If the iPhone breaks, you've failed regardless of whether the MacBook works.

Read `.claude/skills/delegate-work/references/anti-patterns.md` before starting.

### Skills and tools to use

- **Anti-patterns**: `.claude/skills/delegate-work/references/anti-patterns.md` — real mistakes from this session. Read first.
- **Code audit**: Run `/react-code-audit quick` on any files you modify before committing.
- **Verification**: Use `superpowers:verification-before-completion` — verify the app actually runs and both devices work before claiming you're done.
- **Context7**: Use `mcp__claude_ai_Context7__query-docs` with library ID `/pmndrs/drei` if you need to understand how drei's Html `transform` mode, `distanceFactor`, or `occlude` work. Don't guess at the math.
- **Three.js docs**: Use `mcp__claude_ai_Context7__query-docs` with library ID `/mrdoob/three.js` for geometry, bounding box, or world transform questions.
- **Three.js viewer**: `mcp__claude_ai_Three_js_3D_Viewer__learn_threejs` is available for testing 3D concepts.

### What the user specifically said
- "shouldnt i have the ability to rotate the screen?" — they need an htmlRotation control in the settings panel
- "BECAREFUL with whatever changes you make YOU MUCH NOT BREAK THE WORKING THING"
- "make a new branch before we start ANY code changes"
- "the screen needs to be rotated. its definitely not the same as on the phone"

### Screenshots
Look at the MacBook screenshots at `/mnt/c/Users/dustinf/Downloads/threejs/macbook-pro-screenshot.png` and `macbook-pro-screenshot-2.png`. The model renders correctly (screen facing camera) but the dashboard overlay content appears rotated/sideways.

## What the iPhone config looks like (working reference)

```typescript
{
  id: 'iphone',
  screenNode: 'Body_Wallpaper_0',
  htmlPosition: [0, 0, -0.025],
  htmlRotation: [0, 0, 0],
  modelRotation: [0, Math.PI, 0],
  portrait: true,
}
```

## MacBook mesh structure (from gltfjsx)

```jsx
<group position={[0.002, -0.038, 0.414]} rotation={[0.014, 0, 0]}>
  <group position={[0, 2.965, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
    <mesh geometry={nodes.Cube008.geometry} material={materials.aluminium} />
    <mesh geometry={nodes.Cube008_1.geometry} material={materials['matte.001']} />
    <mesh geometry={nodes.Cube008_2.geometry} material={materials['screen.001']} />  ← SCREEN
  </group>
</group>
<mesh geometry={nodes.keyboard.geometry} ... />
<group position={[0, -0.1, 3.394]}>  ← trackpad
  ...
</group>
```

## Known risks the previous spec missed

1. **Constraint contradiction**: The previous spec said "don't modify DeviceModel.tsx" but Step 7 requires it. You WILL need to modify DeviceModel.tsx (to read htmlRotation from overrides) and SettingsPanel.tsx (to add the input). That's OK — just be careful not to break the iPhone. Test BOTH devices after every change.

2. **Auto-sizing might give wrong dimensions**: DeviceModel computes screen size using `geometry.computeBoundingBox() * getWorldScale()`. This gives LOCAL mesh dimensions × scale, which works for the iPhone because its modelRotation (Y=180°) doesn't change scale magnitudes. The MacBook's screen mesh is inside a parent group with `rotation X=90°` which swaps Y and Z axes. The geometry approach might give the wrong width vs height. If the auto-sized overlay is the wrong aspect ratio, you may need to swap width and height, or use `Box3.setFromObject` for the MacBook instead. Report what you find.

3. **Retina wrapper assumes portrait**: The RENDER_SCALE inner div uses `height: autoScreenDims.htmlHeight / RENDER_SCALE` and wraps a 393px-wide dashboard. For landscape, the dashboard will be phone-shaped (narrow) on a wide laptop screen. That's acceptable for now — don't try to redesign the dashboard layout.

4. **CSS scaleX(-1)**: Applied when `config.modelRotation[1] !== 0`. The MacBook may have `modelRotation[1] = 0` (already faces camera from screenshots), so scaleX(-1) won't apply. But the screen content might still be mirrored due to the scene hierarchy's X rotation. If mirrored, you may need `scaleY(-1)` or a different CSS fix. Don't guess — test and report.

## Steps

### 1. Look at the screenshots

Read the screenshots at `/mnt/c/Users/dustinf/Downloads/threejs/macbook-pro-screenshot.png` and `macbook-pro-screenshot-2.png`. Understand what's currently happening visually before changing code.

### 2. Test which way the MacBook faces

From the screenshots, the MacBook already faces the camera (screen visible). So `modelRotation` should be `[0, 0, 0]`. Confirm by checking if changing to `[0, Math.PI, 0]` flips it backwards. If the current `[0, 0, 0]` is correct, keep it.

### 3. Check console output

Switch to MacBook in the GLB demo sidebar. Check the browser console for:
- `[Pos] localCenter:` — the screen mesh center position
- `[Screen]` — the auto-computed dimensions and distanceFactor

Report these values. They tell us if the auto-sizing is working correctly for the MacBook's rotated screen.

### 4. Find the correct htmlRotation

The dashboard appears rotated in the screenshots. The MacBook's screen mesh is inside a group with `rotation={[Math.PI / 2, 0, 0]}`. The Html inherits this rotation since it's inside the same group hierarchy.

Try `htmlRotation: [-Math.PI / 2, 0, 0]` to counter the parent rotation. If the content is upside down, try `[Math.PI / 2, 0, 0]`. If mirrored, add `scaleX(-1)` or `scaleY(-1)`.

### 5. Find the correct Z offset

Start with `htmlPosition: [0, 0, -0.025]`. Adjust if the screen is too deep or floating. The screen surface depth depends on the MacBook's geometry — it might need a very different value.

### 6. Add htmlRotation to ModelOverrides and settings panel

So the user can tune the screen rotation without editing code:

**deviceConfigs.ts**: Add `htmlRotation: [number, number, number]` to `ModelOverrides`. In `getDefaultOverrides()`, initialize from `config.htmlRotation` converted to degrees:
```typescript
htmlRotation: [
  config.htmlRotation[0] * (180 / Math.PI),
  config.htmlRotation[1] * (180 / Math.PI),
  config.htmlRotation[2] * (180 / Math.PI),
],
```

**DeviceModel.tsx**: Where `config.htmlRotation` is used on the Html component, read from overrides instead (convert degrees back to radians):
```typescript
const htmlRot = overrides?.htmlRotation
  ? [overrides.htmlRotation[0] * DEG2RAD, overrides.htmlRotation[1] * DEG2RAD, overrides.htmlRotation[2] * DEG2RAD]
  : config.htmlRotation;
```

**SettingsPanel.tsx**: Add a Vec3Input for "Screen Rotation (deg)" in the Model section, using `overrides.htmlRotation` and `onOverridesChange`.

Test: change Screen Rotation in the settings panel and verify the overlay rotates independently from the model.

### 7. Update deviceConfigs.ts

Once you have the right values for:
- modelRotation
- htmlRotation
- htmlPosition

Update the MacBook entry in deviceConfigs.ts.

### 8. Verify BOTH devices

- Switch to iPhone → screen overlay still works correctly (sizing, position, occlusion, retina)
- Switch to MacBook → screen overlay is visible, correctly oriented, readable
- Rotate to back on both → overlay hides (occlusion)
- Float animation works on both
- Settings panel shows the new Screen Rotation input on both devices

## Constraints

- React 18 — no React 19 features
- Branch: `feature/macbook-screen` (already created)
- Run `npx tsc --noEmit` after changes
- Run `npx prettier --write` on files you touch
- Test the IPHONE after every change to DeviceModel.tsx or SettingsPanel.tsx to ensure you haven't broken it
- The dashboard is phone-shaped (393x852 portrait). It will look narrow on the laptop screen. That's OK for now.

## What's already handled by DeviceModel (don't reimplement)

- Auto-sizing from geometry (`geometry.computeBoundingBox + getWorldScale`)
- distanceFactor formula (`worldW * 400 / (cssWidth * parentScale)`)
- Retina rendering (RENDER_SCALE = 2, CSS transform: scale(2))
- Depth occlusion (occlude="blending")
- Float freeze during measurement
- Black screen mesh on load
- CSS scaleX(-1) when modelRotation Y ≠ 0

## When you're done

1. **Update THIS spec file** (`specs/macbook-pro-setup.md`) by appending an "Implementation Results" section at the bottom with:
   - The final config values (modelRotation, htmlRotation, htmlPosition) and why
   - Console log output showing screen mesh dimensions
   - Whether auto-sizing worked or needed adjustment for the rotated screen
   - Whether occlusion works on both devices
   - Whether the iPhone still works after your changes
   - Every change you made to DeviceModel.tsx and SettingsPanel.tsx with reasoning
   - Anything you're uncertain about
   - Open issues or things that need follow-up

   This is how the reviewing agent will check your work — if it's not in the spec, it didn't happen.

2. **Commit everything** to `feature/macbook-screen` and push.

3. **Report a summary** to the user.

## If you're unsure

**Ask the user.** Don't guess at rotations or positioning. Don't make changes you can't verify. If something looks wrong and you don't know why, describe what you see and ask for guidance. Getting it right matters more than getting it done fast.

---

## ADDENDUM — Spec author's correction

The original spec failed to include values the user had ALREADY tuned in the settings panel before handoff. The user provided screenshots showing their work and I didn't read them carefully. This is the same mistake I keep making — not checking the user's actual input before writing instructions. I'm documenting this so you don't waste time rediscovering what the user already found.

### User's tuned values (from screenshot)

These are the values the user set in the settings panel that produced the closest-to-working result:

- **Position**: X=0, Y=-0.5, Z=0
- **Rotation**: X=0, Y=0, Z=0
- **Scale**: 0.25
- **Screen Position**: X=0, Y=0, Z=0

### Diagnostics from the user's session

- Box: 8.814 x 6.173 x 6.220
- normalizeScale: 0.3404
- Screen center: 0.002, 2.928, 0.327
- **Screen Size: 2.078 x 0.000** ← THIS IS THE BUG
- distanceFactor: 4.224

### Critical finding: Screen Size height is ZERO

The auto-sizing computes `worldH = geoSize.y * worldScale.y`. For the MacBook, the screen mesh is inside a parent group with `rotation X=90°`. This swaps Y and Z axes. The geometry's local Y (height) becomes world Z after rotation, but `getWorldScale()` only returns scale magnitudes — it doesn't account for axis swapping from rotation.

So `geoSize.y * worldScale.y` gives the WRONG dimension. The screen height is actually along the Z axis in world space. The auto-sizing in DeviceModel.tsx **NEEDS A FIX for non-axis-aligned screen meshes**.

### What you should do

1. **Start from the user's tuned values above**, not the current deviceConfigs defaults.
2. **Fix the Screen Size computation** — for the MacBook, the screen mesh's local Y becomes world Z after the parent's 90° X rotation. You may need to use `Box3.setFromObject` (which gives axis-aligned world bounds) for the SIZE computation instead of `geometry.boundingBox * worldScale`, or detect when parent rotations swap axes and adjust accordingly.
3. **The user's scale of 0.25** suggests normalizeScale (0.3404) is too large for the MacBook. The user manually reduced it. Investigate why — the MacBook model's bounding box is 8.814 which gives normalizeScale = 3.0/8.814 = 0.3404. But the model includes the keyboard and base, making the bounding box much larger than the screen. The phone's normalizeScale works because the phone IS mostly screen. The MacBook is mostly not-screen.

### Spec author's anti-pattern added

"Always check user-provided screenshots for tuned values before writing a spec. The user did the work — don't make the agent redo it."
