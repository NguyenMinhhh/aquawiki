---
story_key: 3-4-2d-tank-visualization
epic: 3
story: 4
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 3.4: 2D Tank Visualization

**As a** user,
**I want** to see a 2D visual representation of my tank with species icons,
**So that** I can get a visual sense of how stocked my tank is.

## Acceptance Criteria

**AC1 — SVG tank rectangle:**
**Given** valid tank dimensions are entered
**When** the canvas renders
**Then** an SVG rectangle is displayed with aspect ratio proportional to L × H (width : height)

**AC2 — Border color by bioload:**
**Given** bioload is calculated
**When** the canvas renders
**Then** the SVG tank border color matches bioload state: green (<80%), yellow (80-100%), red (>100%)

**AC3 — Species icons:**
**Given** species are in the tank items list
**When** the canvas renders
**Then** each unique species is represented by a circle icon with species initials, labeled "×qty" below

**AC4 — Max 10 icons:**
**Given** more than 10 unique species are added
**When** the canvas renders
**Then** only the first 10 species icons are shown, with a "+N more" label for the remainder

**AC5 — Empty state:**
**Given** no species have been added
**When** the canvas renders
**Then** "Thêm cá để bắt đầu mô phỏng" is displayed centered inside the tank

**AC6 — Mobile responsive:**
**Given** viewport width is 375px (mobile)
**When** the simulator renders
**Then** panels stack vertically (left → center → right), canvas fills available width

## Tasks/Subtasks

- [x] **Task 1: TankCanvas component**
  - [x] 1.1 Create `TankCanvas.tsx` — accepts `length`, `height`, `tankItems`, `bioloadColor` props
  - [x] 1.2 SVG viewBox computed from L×H ratio — fixed height 300px, width proportional
  - [x] 1.3 Border `stroke` color: `--color-success` / `--color-warning` / `--color-danger` based on `bioloadColor`
  - [x] 1.4 Border color defaults to `--color-border` when `bioloadColor === null`

- [x] **Task 2: Species icons**
  - [x] 2.1 For each species (max 10): render circle with initials (first letter commonName)
  - [x] 2.2 Each icon: colored circle (hue derived from species.id % 360), white initials, "×qty" text below
  - [x] 2.3 Layout icons in a grid pattern inside the SVG rectangle (distribute evenly)
  - [x] 2.4 If > 10 species: show first 10 + "+N loài nữa" text in bottom-right corner

- [x] **Task 3: Empty state + invalid state**
  - [x] 3.1 Empty state (no tankItems): centered text "Thêm cá để bắt đầu mô phỏng" inside SVG
  - [x] 3.2 Invalid dimensions (tankVolume === null): dashed border div with "Nhập kích thước bể để hiển thị mô phỏng"
  - [x] 3.3 Render TankCanvas in center panel of SimulatorPage

- [x] **Task 4: Mobile responsive**
  - [x] 4.1 `grid-cols-1` on mobile (<768px), `grid-cols-[260px_1fr_300px]` on `md:`
  - [x] 4.2 Panel order on mobile: inputs (top) → canvas (middle) → stats (bottom)

## Dev Notes

### SVG layout strategy
Fixed container width (e.g. fill parent div). Compute SVG height from aspect ratio:
```ts
const containerWidth = 600; // approximate, or use ResizeObserver
const svgHeight = containerWidth * (height / length);
```
Cap svgHeight at 400px to prevent very tall tanks from overflowing.

Use `viewBox="0 0 {length} {height}"` and let SVG scale to container via `width="100%"`.

### Species icon placement
Divide tank SVG space into a grid:
- cols = Math.ceil(Math.sqrt(count))
- rows = Math.ceil(count / cols)
- Each cell: icon centered in cell, ×qty below

Icon radius: ~20 (SVG units), adjust based on tank size.

### Icon color from id
```ts
const hue = (species.id * 137) % 360; // golden angle distribution
const fill = `oklch(65% 0.15 ${hue})`;
```

### Initials
```ts
const initials = species.commonName.charAt(0).toUpperCase();
```

### Border color mapping
```ts
const strokeColor = {
  success: 'oklch(52% 0.17 145)',
  warning: 'oklch(62% 0.16 75)',
  danger: 'oklch(50% 0.20 25)',
  null: 'oklch(88% 0.01 222)', // border color
}[bioloadColor ?? 'null'];
```

### Mobile layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-[260px_1fr_300px] gap-4">
  <div>{/* left: inputs + search + list */}</div>
  <div>{/* center: TankCanvas */}</div>
  <div>{/* right: bioload stats */}</div>
</div>
```

## Dev Agent Record

### Debug Log

### Completion Notes
✅ AC1: SVG viewBox={`0 0 ${L} ${H}`} → scales proportionally to L×H, `width="100%"` fills container
✅ AC2: stroke color mapped from bioloadColor (success/warning/danger) → OKLCH values matching design tokens
✅ AC3: circles with initials (first char of commonName), ×qty label below, grid distributed
✅ AC4: `tankItems.slice(0, 10)` + remaining count "+N loài nữa" text in bottom-right
✅ AC5: `count === 0` → centered SVG text "Thêm cá để bắt đầu mô phỏng"
✅ AC6: `grid-cols-1 md:grid-cols-[260px_1fr_300px]` — panels stack on mobile, 3-col on desktop

## File List

**Frontend:**
- `aquawiki-frontend/src/components/TankCanvas.tsx` (new)
- `aquawiki-frontend/src/pages/SimulatorPage.tsx` (modified — TankCanvas integration + mobile layout)

## Change Log

- 2026-05-15: Story 3.4 created and implemented — 2D Tank Visualization complete
  - TankCanvas.tsx (new), SimulatorPage.tsx mobile layout integrated
