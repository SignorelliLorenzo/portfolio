# Wow Effect — Neural Network Particles (Hero → Fade Out)

## Goal
Add a premium “AI / neural network” background effect with:
- A node + edge particle network rendered on **Canvas**.
- Strongest in the **Hero** section.
- Fades away smoothly as the user scrolls past the hero.
- Theme-compliant (dark/light) and minimal (no gimmicky glow).

This doc describes the planned implementation and where changes should be made.

---

## Visual Concept
### What it looks like
- Small, subtle **nodes** drifting slowly.
- Thin **connecting edges** appear between nodes within a distance threshold.
- A light **mouse influence** (optional) makes the network feel alive.
- The effect is **behind content**, never reducing readability.

### Design rules (premium/minimal)
- Keep density low (avoid “screensaver”):
  - Desktop: ~70–90 nodes
  - Mobile: ~30–50 nodes
- Slow motion (no fast particle velocity).
- Low opacity; avoid heavy bloom / big box-shadows.

---

## Implementation Summary
### New component
Create a new client component:
- `site/components/shared/neural-background.tsx`

Responsibilities:
- Own a `<canvas />` and render loop.
- Generate nodes, update positions, draw edges.
- Support an `intensity` prop (0..1) to control fade.
- Optional pointer interaction.

### Integrate into Hero section
Update:
- `site/components/sections/hero-section.tsx`

Responsibilities:
- Mount the neural background as a layer behind hero content.
- Compute scroll-based fade intensity and pass it down.
- Add a bottom gradient mask to visually blend into the next section.

---

## Component API (planned)
`NeuralBackground` props:
- `intensity?: number` (default `1`) — controls global alpha.
- `maxNodes?: number` (default computed by viewport)
- `interactive?: boolean` (default `true` on desktop)
- `className?: string`

Example usage:
```tsx
<NeuralBackground
  intensity={intensity}
  interactive
  className="absolute inset-0 pointer-events-none"
/>
```

---

## Hero Layout / Layering (Tailwind references)
### Hero `<section>` baseline
Ensure hero container supports background layering:
- `relative overflow-hidden bg-background`

### Neural layer wrapper
Recommended wrapper classes:
- `absolute inset-0 pointer-events-none`
- `opacity-40 md:opacity-70` (base visibility)
- optional: `filter blur-[0.2px]` (tiny softening)

### Canvas element
- `w-full h-full`

### Bottom fade mask (visual blend)
Add a mask to fade the effect into the next section:
- `absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background`

### Content layer
Hero content should sit above:
- `relative z-10`

---

## Scroll Fade Strategy (recommended)
Use Framer Motion scroll progress from the hero container.

### Target behavior
- `intensity = 1` at top of hero.
- fades toward `0` shortly after leaving hero.

Example mapping (conceptual):
- `intensity = clamp(1 - scrollYProgress * 1.6, 0, 1)`

Apply intensity to wrapper opacity:
- `style={{ opacity: intensity * 0.65 }}`

This avoids re-mounting the canvas and prevents flicker.

---

## Interaction (optional but recommended)
### Desktop pointer influence
- Track pointer on the hero container (not on canvas because of `pointer-events-none`).
- Apply a subtle repulsion/attraction force to nodes within a radius.

### Mobile
- Disable pointer interaction.
- Reduce node count.

---

## Performance + Accessibility Guardrails
### Reduced motion
If `prefers-reduced-motion: reduce`:
- Disable animation loop (render once) OR
- Hide canvas entirely and keep a static background.

Implementation options:
- `useReducedMotion()` from Framer Motion
- `window.matchMedia('(prefers-reduced-motion: reduce)')`

### FPS cap
- Cap at ~30fps by skipping frames (`dt < 33ms`).

### Resize handling
- Use `ResizeObserver` on hero container.
- Render crisp lines via DPR scaling:
  - `canvas.width = rect.width * dpr`
  - `canvas.height = rect.height * dpr`
  - `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`

### Tab visibility
- Pause animation when `document.hidden` is true.

---

## Planned Files To Change
- **New**: `site/components/shared/neural-background.tsx`
- **Edit**: `site/components/sections/hero-section.tsx`

Optional (only if needed):
- `site/app/globals.css` (if you want reusable mask/noise utilities)

---

## Acceptance Criteria
- Effect is visible behind hero and looks like a neural network.
- Content readability stays high (no contrast issues).
- The effect fades out smoothly as you scroll down.
- Works on mobile with reduced density.
- Respects reduced motion (static or disabled).
- No noticeable jank during scroll.

---

## Next Decisions
Confirm the final choices before implementation:
1. Fade mode:
   - A) Scroll-based fade (recommended)
   - B) Hero-only gradient mask fade (simpler)

2. Interaction:
   - A) Subtle mouse repulsion (recommended)
   - B) No interaction
