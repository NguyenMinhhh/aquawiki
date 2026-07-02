---
story_key: 3-1-tank-dimension-volume-calculation
epic: 3
story: 1
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 3.1: Tank Dimension & Volume Calculation

**As a** user,
**I want** to enter my tank dimensions (length, width, height),
**So that** the simulator can calculate my tank volume and use it for bioload calculations.

## Acceptance Criteria

**AC1 — SimulatorPage route:**
**Given** a user navigates to `/simulator`
**When** the page loads
**Then** the SimulatorPage renders with a 3-panel layout (left: inputs 260px, center: canvas 1fr, right: stats 300px)

**AC2 — Dimension inputs:**
**Given** the SimulatorPage is loaded
**When** the user enters L, W, H values in cm
**Then** the volume is calculated as L×W×H/1000 and displayed as "X lít" below the inputs

**AC3 — Validation — zero or negative:**
**Given** a user enters a dimension ≤ 0
**When** the value is entered
**Then** an error "Kích thước phải lớn hơn 0" is displayed and volume shows "—"

**AC4 — Validation — very large tank warning:**
**Given** a user enters any dimension > 1000 cm
**When** the value is entered
**Then** a warning "Kích thước rất lớn, kiểm tra lại đơn vị (cm)" is displayed (non-blocking, volume still calculates)

**AC5 — Species list preserved on dimension change:**
**Given** a user has added species to the simulator
**When** the user changes tank dimensions
**Then** the species list remains unchanged — only volume updates

## Tasks/Subtasks

- [x] **Task 1: SimulatorPage scaffold + routing**
  - [x] 1.1 Create `SimulatorPage.tsx` — 3-panel grid layout: left (260px) | center (1fr) | right (300px)
  - [x] 1.2 Add `/simulator` route in `main.tsx` wrapped in `ProtectedRoute`
  - [x] 1.3 Add "Mô phỏng hồ" nav link in `Navbar.tsx`

- [x] **Task 2: Dimension state + volume calculation**
  - [x] 2.1 `useState` for `length`, `width`, `height` (number | '')
  - [x] 2.2 `tankVolume` computed: `L > 0 && W > 0 && H > 0 ? (L * W * H) / 1000 : null`
  - [x] 2.3 Display volume below inputs: "X.X lít" hoặc "—" nếu null
  - [x] 2.4 Left panel heading "Bể cá của bạn" + 3 labeled inputs (Chiều dài, Chiều rộng, Chiều cao)

- [x] **Task 3: Validation**
  - [x] 3.1 Error message "Kích thước phải lớn hơn 0" nếu bất kỳ dimension nào ≤ 0
  - [x] 3.2 Warning message "Kích thước rất lớn, kiểm tra lại đơn vị (cm)" nếu bất kỳ dimension nào > 1000
  - [x] 3.3 Validation hiển thị per-field dưới mỗi input

## Dev Notes

### 3-panel layout
```css
/* Desktop: 3 columns */
grid-template-columns: 260px 1fr 300px;
/* Mobile (≤768px): single column, panel order top-to-bottom */
```
Left panel: sticky `top-16` (below navbar 64px).

### Volume display
```ts
const tankVolume = length > 0 && width > 0 && height > 0
  ? (length * width * height) / 1000
  : null;
```
Display: `${tankVolume.toFixed(1)} lít` — 1 decimal place.

### State design for Story 3.2 compatibility
`tankItems` state sẽ được thêm trong Story 3.2. Story 3.1 chỉ cần `length/width/height` state. Không cần lift state vì toàn bộ simulator là 1 page component.

### Navbar link
Thêm link "Mô phỏng hồ" vào Navbar giữa logo và user section. Dùng `NavLink` từ react-router với `isActive` style tương tự các nav items hiện tại.

## Dev Agent Record

### Debug Log

### Completion Notes
✅ AC1: `/simulator` route, `grid-cols-[260px_1fr_300px]` desktop layout, ProtectedRoute
✅ AC2: L×W×H/1000 volume → displayed as "X.X lít" with `toFixed(1)`
✅ AC3: `hasZeroOrNeg` → "Kích thước phải lớn hơn 0", volume shows "—"
✅ AC4: `hasOversize` → "Kích thước rất lớn, kiểm tra lại đơn vị (cm)" (non-blocking)
✅ AC5: Dimension change does not affect tankItems state — separate useState

## File List

**Frontend:**
- `aquawiki-frontend/src/pages/SimulatorPage.tsx` (new)
- `aquawiki-frontend/src/main.tsx` (modified — route /simulator)
- `aquawiki-frontend/src/components/Navbar.tsx` (modified — simulator nav link)

## Change Log

- 2026-05-15: Story 3.1 created and implemented — Tank Dimension & Volume Calculation complete
  - SimulatorPage.tsx (new), Navbar.tsx (simulator link), main.tsx (/simulator route)
