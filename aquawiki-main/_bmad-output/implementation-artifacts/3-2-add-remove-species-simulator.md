---
story_key: 3-2-add-remove-species-simulator
epic: 3
story: 2
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 3.2: Add/Remove Species to Simulator

**As a** user,
**I want** to search and add species to my tank simulator with quantities,
**So that** I can build my tank stocking list and see compatibility information.

## Acceptance Criteria

**AC1 — Searchable species selector:**
**Given** the user types ≥ 2 characters in the search input in the left panel
**When** the input changes (debounced 300ms)
**Then** a dropdown appears with matching species fetched from `GET /api/species?search=...`

**AC2 — Add species to list:**
**Given** the user selects a species from the dropdown
**When** the selection is made
**Then** the species is added to the tank items list with quantity = 1, and the search input clears

**AC3 — Quantity stepper:**
**Given** a species is in the tank items list
**When** the user clicks + or -
**Then** quantity increases/decreases (min = 1, cannot go below 1)

**AC4 — Remove species:**
**Given** a species is in the tank items list
**When** the user clicks the remove (×) button
**Then** the species is removed from the list

**AC5 — Duplicate prevention:**
**Given** a species is already in the tank items list
**When** the user tries to add the same species again
**Then** the species is NOT duplicated — the search dropdown shows it but clicking does nothing (or increments qty)

**AC6 — Session state only:**
**Given** the user refreshes the page or navigates away and returns
**When** the page loads
**Then** the tank items list is empty — no persistence across sessions

## Tasks/Subtasks

- [x] **Task 1: TankItem type + state**
  - [x] 1.1 Define `TankItem` interface: `{ species: Species; quantity: number }`
  - [x] 1.2 Add `tankItems: TankItem[]` + `setTankItems` state to SimulatorPage
  - [x] 1.3 Add `addSpecies(species)`, `removeSpecies(id)`, `updateQty(id, delta)` handlers

- [x] **Task 2: Species search dropdown**
  - [x] 2.1 Add search input in left panel below dimension inputs — "Tìm loài cá..."
  - [x] 2.2 Fetch `GET /api/species?search=q&size=10` khi search.length ≥ 2 (300ms debounce)
  - [x] 2.3 Render dropdown list dưới input — tên loài + scientific name italic
  - [x] 2.4 Click species → `addSpecies()` + clear search + close dropdown
  - [x] 2.5 Click ngoài dropdown → close (blur hoặc outside click handler)

- [x] **Task 3: Tank items list**
  - [x] 3.1 Render `tankItems` list dưới search input — mỗi item: tên loài, stepper qty, remove button
  - [x] 3.2 Stepper: `-` button (disabled khi qty=1), qty display, `+` button
  - [x] 3.3 Remove button: `×` icon, removes item from list

## Dev Notes

### TankItem state placement
Tất cả state (`length/width/height/tankItems`) trong `SimulatorPage` — không cần context vì toàn bộ là 1 page component. Pass down chỉ qua props nếu extract sub-components.

### Species search API
Dùng lại GET `/api/species` endpoint đã có từ Epic 2:
```
GET /api/species?search=neon&size=10&page=0
```
Response: `PagedResponse<Species>` — chỉ cần `data` array.

### Duplicate prevention
```ts
const addSpecies = (species: Species) => {
  if (tankItems.some(item => item.species.id === species.id)) return;
  setTankItems(prev => [...prev, { species, quantity: 1 }]);
};
```

### Dropdown close on outside click
Dùng `useRef` + `useEffect` với `mousedown` event listener:
```ts
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (!ref.current?.contains(e.target as Node)) setShowDropdown(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);
```

### Qty stepper min = 1
`updateQty(id, delta)`: `max(1, current + delta)` — không cần check lần nào cũng lớn hơn 0.

## Dev Agent Record

### Debug Log

### Completion Notes
✅ AC1: Search input debounced 300ms, calls GET /api/species?search=q&size=10 when ≥2 chars
✅ AC2: addSpecies() adds with qty=1, clears search, closes dropdown
✅ AC3: + button increments, - button decrements (disabled at qty=1), `max(1, qty+delta)`
✅ AC4: removeSpecies(id) filters tankItems, × button calls it
✅ AC5: `if (tankItems.some(item => item.species.id === species.id)) return` — prevents duplicates
✅ AC6: Session state only via useState — resets on page reload

## File List

**Frontend:**
- `aquawiki-frontend/src/pages/SimulatorPage.tsx` (modified — tankItems state + species search + list)

## Change Log

- 2026-05-15: Story 3.2 created and implemented — Add/Remove Species to Simulator complete
