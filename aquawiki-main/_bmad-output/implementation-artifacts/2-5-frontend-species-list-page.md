---
story_key: 2-5-frontend-species-list-page
epic: 2
story: 5
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.5: Frontend Species List Page

**As a** visitor,
**I want** to browse and search species from the home page with real-time filtering,
**So that** I can find relevant species without navigating away.

## Acceptance Criteria

**AC1 — Paginated grid on home page:**
**Given** a visitor opens the home page `/`
**When** the page loads
**Then** a paginated grid of SpeciesCard components is displayed, each showing: species image (or placeholder), common name, scientific name, behavior tag badge, and care difficulty

**AC2 — Search debounce 300ms:**
**Given** the user types in the search bar
**When** at least 2 characters are entered
**Then** the species list updates to show matching results (debounced — API called after 300ms pause)

**AC3 — Filter dropdowns:**
**Given** the user selects filter options (behavior tag, care difficulty)
**When** filters are applied
**Then** the species list updates to show only matching species with filter state reflected in the UI

**AC4 — Pagination controls:**
**Given** the total species count exceeds the page size
**When** the user clicks pagination controls
**Then** the next/previous page loads and the page scrolls to top

**AC5 — Empty state:**
**Given** search/filter returns no results
**When** the empty state renders
**Then** "Không tìm thấy loài nào phù hợp" is displayed with a suggestion to clear filters

## Tasks/Subtasks

- [x] **Task 1: Types + Hook**
  - [x] 1.1 Create `src/types/species.ts` — Species, PagedResponse, SpeciesListParams interfaces
  - [x] 1.2 Create `src/hooks/useSpecies.ts` — `useSpeciesList` with 300ms debounce on search, immediate for filter/page

- [x] **Task 2: SpeciesCard component**
  - [x] 2.1 Create `SpeciesCard.tsx` — image (placeholder SVG nếu null), commonName, scientificName italic, behavior badge màu semantic, care difficulty text

- [x] **Task 3: SpeciesListPage**
  - [x] 3.1 Create `SpeciesListPage.tsx` — search input + 2 select dropdowns + grid + pagination
  - [x] 3.2 Loading spinner, error state, empty state với "Xóa bộ lọc" button
  - [x] 3.3 Pagination: "← Trước" / "Sau →" buttons, scroll to top on page change

- [x] **Task 4: Routing**
  - [x] 4.1 Update `main.tsx` — route `/` → `SpeciesListPage` (thay App.tsx placeholder)

## Dev Notes

### useSpeciesList debounce
Hook dùng `useRef` để track debounce timer. `delay = 300` khi `params.search` thay đổi, `delay = 0` cho filter/page changes.
`useCallback` với đầy đủ dependencies để tránh stale closure.

### Search threshold
Chỉ gọi API khi `search.length >= 2` — tránh gọi API với 1 ký tự (quá broad).
`search.length >= 2 ? search : undefined` — undefined không thêm vào query params.

### Behavior badge màu
- PEACEFUL → `bg-success-light text-success`
- SEMI_AGGRESSIVE → `bg-warning-light text-warning`
- AGGRESSIVE → `bg-danger-light text-danger`
Consistent với UX design spec semantic colors.

### Image placeholder
Nếu `imageUrl === null`: hiện SVG cá logo với `opacity-40` — không có broken image icon.

## Dev Agent Record

### Completion Notes
✅ AC1: Grid 2×5 (mobile→desktop) với SpeciesCard: placeholder/image + commonName + scientificName italic + behavior badge + care difficulty
✅ AC2: Debounce 300ms, threshold 2 ký tự — `useRef` timer, reset on each search change
✅ AC3: 2 select dropdowns (behavior, care) → immediate filter, page reset to 0
✅ AC4: Pagination "← Trước" / "Sau →" + `window.scrollTo({top:0, behavior:'smooth'})`
✅ AC5: Empty state "Không tìm thấy loài nào phù hợp" + nút "Xóa bộ lọc" khi có active filter

## File List

**Frontend:**
- `aquawiki-frontend/src/types/species.ts` (new)
- `aquawiki-frontend/src/hooks/useSpecies.ts` (new)
- `aquawiki-frontend/src/components/SpeciesCard.tsx` (new)
- `aquawiki-frontend/src/pages/SpeciesListPage.tsx` (new)
- `aquawiki-frontend/src/main.tsx` (modified — route / → SpeciesListPage)

## Change Log

- 2026-05-15: Story 2.5 implemented — Frontend Species List Page complete
