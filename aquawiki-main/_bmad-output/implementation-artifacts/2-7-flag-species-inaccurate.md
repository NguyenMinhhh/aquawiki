---
story_key: 2-7-flag-species-inaccurate
epic: 2
story: 7
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.7: Flag Species as Inaccurate

**As an** authenticated user,
**I want** to flag a species record as potentially inaccurate,
**So that** administrators can review and correct bad data.

## Acceptance Criteria

**AC1 — species_flags table:**
**Given** Flyway migration `V3__create_species_flags.sql` creates the `species_flags` table with columns: id, species_id (FK), reported_by_user_id (FK), reason, status (PENDING/REVIEWED/DISMISSED), created_at
**When** the application starts
**Then** the `species_flags` table exists with correct schema

**AC2 — POST /api/species/{id}/flags authenticated:**
**Given** an authenticated user clicks the flag button and submits a reason
**When** `POST /api/species/{id}/flags` is called with `{ "reason": "..." }`
**Then** a flag record is created with status PENDING and the API returns HTTP 201

**AC3 — POST /api/species/{id}/flags unauthenticated:**
**Given** an unauthenticated visitor calls `POST /api/species/{id}/flags`
**When** processed
**Then** the API returns HTTP 401

**AC4 — Frontend validation:**
**Given** an authenticated user submits a flag without providing a reason
**When** the form is submitted
**Then** frontend validation prevents submission and displays "Vui lòng mô tả vấn đề bạn phát hiện"

**AC5 — Reported state:**
**Given** a flag is successfully submitted
**When** the confirmation is received
**Then** the flag button shows "Đã báo cáo" state and cannot be clicked again for the same species in the same session

## Tasks/Subtasks

- [x] **Task 1: Backend — migration + entity**
  - [x] 1.1 Create `V3__create_species_flags.sql` — species_flags table với FK đến species và users
  - [x] 1.2 Create `FlagStatus` enum: PENDING, REVIEWED, DISMISSED
  - [x] 1.3 Create `SpeciesFlag` entity — species (ManyToOne), reportedBy (ManyToOne), reason, status
  - [x] 1.4 Create `SpeciesFlagRepository`

- [x] **Task 2: Backend — DTO + Service + Controller**
  - [x] 2.1 Create `FlagRequest` record — `@NotBlank(message="Vui lòng mô tả vấn đề bạn phát hiện")` reason
  - [x] 2.2 Create `SpeciesFlagService.createFlag()` — lookup species (404 nếu không tồn tại) + user + save PENDING
  - [x] 2.3 Add `POST /api/species/{id}/flags` to `SpeciesController` — `@ResponseStatus(201)`, `Principal` inject

- [x] **Task 3: Backend tests**
  - [x] 3.1 `SpeciesFlagControllerTest` — unauthenticated 401, authenticated 201, empty reason 400

- [x] **Task 4: Frontend — FlagModal**
  - [x] 4.1 Create `FlagModal.tsx` — backdrop, textarea, client-side validation, loading, API error state
  - [x] 4.2 Backdrop click-to-close (click outside modal)

- [x] **Task 5: Frontend — SpeciesDetailPage integration**
  - [x] 5.1 Replace placeholder flag button với working button + `showFlagModal` state
  - [x] 5.2 `flagged` session state — sau khi submit thành công, button → "Đã báo cáo" disabled
  - [x] 5.3 Render `FlagModal` conditionally

## Dev Notes

### POST /api/species/{id}/flags security
Endpoint không cần thêm vào SecurityConfig — đã covered bởi `anyRequest().authenticated()`. `Principal` được inject bởi Spring Security từ JWT context.

### FlagRequest validation
`@NotBlank` trên `reason` field với message tiếng Việt — GlobalExceptionHandler xử lý `MethodArgumentNotValidException` → 400.

### Session-only flagged state
`flagged` là `useState(false)` trong `SpeciesDetailPage` component — reset khi navigate đi và quay lại. Không persist sang localStorage — đây là behavior mong muốn theo spec.

### FlagModal backdrop
`onClick={(e) => { if (e.target === e.currentTarget) onClose() }}` — chỉ đóng khi click đúng backdrop, không phải content bên trong.

### SpeciesControllerTest fix
Sau khi thêm `SpeciesFlagService` vào `SpeciesController`, cần thêm `@MockitoBean SpeciesFlagService flagService` vào `SpeciesControllerTest` để tránh context load error.

## Dev Agent Record

### Debug Log
- `SpeciesControllerTest` 6 errors sau khi thêm `SpeciesFlagService` dependency vào controller — thiếu `@MockitoBean`. Fixed bằng cách thêm mock vào test class.

### Completion Notes
✅ AC1: `V3__create_species_flags.sql` — bảng `species_flags` với FK ON DELETE CASCADE đến species và users
✅ AC2: Authenticated POST với reason → flag saved PENDING → HTTP 201
✅ AC3: No JWT → `AuthEntryPoint` → JSON `{"status": 401}` — không reach controller
✅ AC4: Empty reason → frontend validation trước khi API call → "Vui lòng mô tả vấn đề bạn phát hiện"
✅ AC5: `onSuccess()` → `setFlagged(true)` → button "Đã báo cáo" disabled (session state)

**Tests: 33/33 pass** (3 SpeciesFlagControllerTest mới + 30 existing)

## File List

**Backend:**
- `aquawiki-backend/src/main/resources/db/migration/V3__create_species_flags.sql` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/FlagStatus.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/SpeciesFlag.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesFlagRepository.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/FlagRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesFlagService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (modified — POST /{id}/flags)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/SpeciesFlagControllerTest.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/SpeciesControllerTest.java` (modified — thêm @MockitoBean SpeciesFlagService)

**Frontend:**
- `aquawiki-frontend/src/components/FlagModal.tsx` (new)
- `aquawiki-frontend/src/pages/SpeciesDetailPage.tsx` (modified — flag button + FlagModal integration)

## Change Log

- 2026-05-15: Story 2.7 implemented — Flag Species as Inaccurate complete
  - Backend: V3 migration, SpeciesFlag entity, FlagRequest validation, POST /api/species/{id}/flags
  - Frontend: FlagModal với validation + backdrop + loading, SpeciesDetailPage flagged session state
  - Tests: 33/33 pass
