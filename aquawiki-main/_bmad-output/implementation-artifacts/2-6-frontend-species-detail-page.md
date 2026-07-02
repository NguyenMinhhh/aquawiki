---
story_key: 2-6-frontend-species-detail-page
epic: 2
story: 6
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.6: Frontend Species Detail Page

**As a** visitor,
**I want** to view the complete details of a species on a dedicated page,
**So that** I can evaluate its parameters before adding it to my tank.

## Acceptance Criteria

**AC1 — Detail page renders full species info:**
**Given** a visitor clicks on a SpeciesCard
**When** navigating to `/species/:id`
**Then** the SpeciesDetailPage renders with: species image, common name, scientific name, pH range, temperature range, max size, behavior tag, care difficulty, bioload factor, and description

**AC2 — Placeholder for missing image:**
**Given** the species has no image uploaded
**When** the detail page renders
**Then** a placeholder image is shown — no broken image icon

**AC3 — Not found error state:**
**Given** an invalid or non-existent species ID is in the URL
**When** the page attempts to load
**Then** an error message "Không tìm thấy loài này" is displayed with a link back to the species list

**AC4 — Flag button for authenticated users:**
**Given** an authenticated user views the detail page
**When** the page renders
**Then** a "Báo cáo dữ liệu không chính xác" flag button is visible (hidden for unauthenticated visitors)

## Tasks/Subtasks

- [x] **Task 1: useSpeciesDetail hook**
  - [x] 1.1 Add `useSpeciesDetail(id)` to `useSpecies.ts` — fetch `/api/species/{id}`, loading/error states

- [x] **Task 2: SpeciesDetailPage**
  - [x] 2.1 Create `SpeciesDetailPage.tsx` — loading spinner, error state với back link
  - [x] 2.2 Image banner (aspect 16/7) với placeholder SVG nếu imageUrl null
  - [x] 2.3 Behavior badge + care difficulty badge với màu semantic
  - [x] 2.4 ParamCard grid: pH range, nhiệt độ, kích thước tối đa, bioload
  - [x] 2.5 Description text block
  - [x] 2.6 Flag button: hiển thị nếu `user` có giá trị, placeholder cho Story 2.7

- [x] **Task 3: Routing**
  - [x] 3.1 Add route `/species/:id` → `SpeciesDetailPage` trong `main.tsx`

## Dev Notes

### useSpeciesDetail
Chỉ fetch khi `id != null`. `useEffect` dependency `[id]` — refetch khi navigate sang species khác.

### ParamCard component
Local component trong cùng file — hiển thị label + value trong card nhỏ với `bg-background` nền.

### Back navigation
`<Link to="/">← Danh sách loài</Link>` — không dùng `navigate(-1)` vì user có thể đến từ direct URL.

### ProtectedRoute
`/species/:id` wrap trong `ProtectedRoute` (không adminOnly) — cần đăng nhập để xem. Phù hợp vì flag button cần auth và content là specialist data.

## Dev Agent Record

### Completion Notes
✅ AC1: Hiển thị đầy đủ: image banner, commonName + scientificName italic, badges, ParamCard grid (pH/temp/size/bioload), description
✅ AC2: `imageUrl === null` → SVG placeholder cá với `opacity-30`
✅ AC3: API error → "Không tìm thấy loài này." + Link "← Quay lại danh sách"
✅ AC4: Flag button chỉ render khi `user` truthy — placeholder button cho Story 2.7

## File List

**Frontend:**
- `aquawiki-frontend/src/hooks/useSpecies.ts` (modified — thêm useSpeciesDetail)
- `aquawiki-frontend/src/pages/SpeciesDetailPage.tsx` (new)
- `aquawiki-frontend/src/main.tsx` (modified — route /species/:id)

## Change Log

- 2026-05-15: Story 2.6 implemented — Frontend Species Detail Page complete
