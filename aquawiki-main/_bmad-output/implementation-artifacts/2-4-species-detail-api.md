---
story_key: 2-4-species-detail-api
epic: 2
story: 4
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.4: Species Detail API

**As a** visitor,
**I want** to view the full detail of a species via API,
**So that** the frontend can display complete species information.

## Acceptance Criteria

**AC1 — GET /api/species/{id} valid APPROVED:**
**Given** `GET /api/species/{id}` is called with a valid ID of an APPROVED species
**When** processed
**Then** the API returns full SpeciesResponse: id, commonName, scientificName, imageUrl, phMin, phMax, tempMin, tempMax, maxSizeCm, behaviorTag, careDifficulty, description, bioloadFactor, status, createdAt

**AC2 — Not found 404:**
**Given** `GET /api/species/{id}` is called with a non-existent ID
**When** processed
**Then** the API returns HTTP 404 with error envelope: `{ "status": 404, "error": "NOT_FOUND", "message": "Species not found" }`

**AC3 — DRAFT hidden from non-admin:**
**Given** `GET /api/species/{id}` is called with a DRAFT species ID by a non-admin user
**When** processed
**Then** the API returns HTTP 404 — DRAFT species are not visible to non-admin users

## Tasks/Subtasks

- [x] **Task 1: Service**
  - [x] 1.1 Implement `SpeciesService.getById(id)` — `findById` + filter APPROVED + map to SpeciesResponse, else 404

- [x] **Task 2: Controller**
  - [x] 2.1 Add `GET /api/species/{id}` to `SpeciesController`

- [x] **Task 3: Tests**
  - [x] 3.1 `SpeciesControllerTest` — valid ID 200, not found 404

## Dev Notes

### DRAFT filtering
`getById` dùng `.filter(s -> s.getStatus() == SpeciesStatus.APPROVED)` — DRAFT species trả 404, không phải 403, để không lộ sự tồn tại của record.

### 404 response
`GlobalExceptionHandler` handle `ResponseStatusException` → `{ "status": 404, "error": "NOT_FOUND", "message": "Species not found" }`.

## Dev Agent Record

### Completion Notes
✅ AC1: `GET /api/species/1` → full SpeciesResponse với tất cả fields
✅ AC2: `GET /api/species/999` → HTTP 404 + error envelope
✅ AC3: DRAFT species → `filter(APPROVED)` fail → 404 (không phân biệt not found vs draft)

**Tests: 2 cases trong SpeciesControllerTest** (valid 200, not found 404)

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesService.java` (modified — getById method)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (modified — GET /{id})

## Change Log

- 2026-05-15: Story 2.4 implemented — Species Detail API complete (cùng PR với 2.2/2.3)
