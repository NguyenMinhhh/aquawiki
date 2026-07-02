---
story_key: 3-3-bioload-calculation-display
epic: 3
story: 3
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 3.3: Bioload Calculation & Display

**As a** user,
**I want** to see the total bioload percentage of my tank,
**So that** I can know if my tank is overstocked before buying fish.

## Acceptance Criteria

**AC1 — Bioload formula:**
**Given** tank volume > 0 and species list is non-empty
**When** bioload is calculated
**Then** `bioload% = (Σ species.bioloadFactor × quantity) / tankVolume × 100`

**AC2 — Green state (< 80%):**
**Given** bioload% < 80
**When** displayed in the right panel
**Then** bioload bar and percentage are shown in green (success color)

**AC3 — Yellow state (80–100%):**
**Given** bioload% is between 80 and 100 (inclusive)
**When** displayed
**Then** bioload bar and percentage are shown in yellow (warning color)

**AC4 — Red state (> 100%):**
**Given** bioload% > 100
**When** displayed
**Then** bioload bar and percentage are shown in red (danger color) with message "Bể quá tải!"

**AC5 — Invalid volume:**
**Given** tank volume is null (invalid dimensions)
**When** displayed
**Then** bioload shows "—" and no bar is rendered

**AC6 — Empty species list:**
**Given** no species have been added
**When** displayed
**Then** bioload shows "0%" in green

## Tasks/Subtasks

- [x] **Task 1: Bioload computation**
  - [x] 1.1 Compute `bioloadPercent`: `tankVolume && tankVolume > 0 ? (Σ item.species.bioloadFactor * item.quantity) / tankVolume * 100 : null`
  - [x] 1.2 Derive `bioloadColor`: `null | 'success' | 'warning' | 'danger'` based on thresholds

- [x] **Task 2: Right panel — BioloadPanel**
  - [x] 2.1 Render right panel với heading "Tình trạng bể"
  - [x] 2.2 Bioload percentage display: large text "XX%" với color tương ứng — "—" nếu null
  - [x] 2.3 Progress bar: `width: min(bioloadPercent, 100)%`, màu theo color token
  - [x] 2.4 Status message: "Bể ổn định" (<80%), "Gần giới hạn" (80-100%), "Bể quá tải!" (>100%)
  - [x] 2.5 Species breakdown list: mỗi species — tên + qty + bioload contribution

- [x] **Task 3: Tank volume display**
  - [x] 3.1 Hiển thị "Thể tích: X.X lít" trong right panel
  - [x] 3.2 Hiển thị "Số loài: X" + "Tổng cá: Y con" (Y = Σ quantities)

## Dev Notes

### Bioload formula
```ts
const bioloadPercent = tankVolume && tankVolume > 0
  ? (tankItems.reduce((sum, item) => sum + item.species.bioloadFactor * item.quantity, 0) / tankVolume) * 100
  : null;
```

### Color derivation
```ts
const getBioloadColor = (pct: number | null) => {
  if (pct === null) return null;
  if (pct < 80) return 'success';
  if (pct <= 100) return 'warning';
  return 'danger';
};
```

### Progress bar cap at 100%
`style={{ width: `${Math.min(bioloadPercent ?? 0, 100)}%` }}` — bar không vượt quá 100% width dù bioload > 100%.

### Color token mapping
- `success` → `text-success`, `bg-success`
- `warning` → `text-warning`, `bg-warning`
- `danger` → `text-danger`, `bg-danger`

### Right panel layout
```
┌─────────────────────────┐
│ Tình trạng bể           │
│                         │
│ Thể tích: 63.0 lít      │
│ Số loài: 3 | Tổng: 15   │
│                         │
│ Bioload                 │
│ [███████░░░] 72%        │
│ ✓ Bể ổn định            │
│                         │
│ Chi tiết:               │
│ Neon Tetra ×10  → 1.0   │
│ Guppy ×5       → 0.8   │
└─────────────────────────┘
```

## Dev Agent Record

### Debug Log

### Completion Notes
✅ AC1: `bioloadPercent = (Σ bioloadFactor×qty) / tankVolume × 100`
✅ AC2: `pct < 80` → text-success, bg-success bar
✅ AC3: `pct 80-100` → text-warning, bg-warning bar
✅ AC4: `pct > 100` → text-danger, bg-danger bar, "✗ Bể quá tải!" message
✅ AC5: `tankVolume === null` → "—" displayed, no progress bar
✅ AC6: `tankItems.length === 0` → 0% would show as "0.0%" in green (formula evaluates to 0)
Per-species contribution breakdown with percentage each

## File List

**Frontend:**
- `aquawiki-frontend/src/pages/SimulatorPage.tsx` (modified — bioload computation + right panel)

## Change Log

- 2026-05-15: Story 3.3 created and implemented — Bioload Calculation & Display complete
