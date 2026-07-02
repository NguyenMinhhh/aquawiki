---
story_key: 2-3-species-filter-api
epic: 2
story: 3
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.3: Species Filter API

**As a** visitor,
**I want** to filter the species list by water parameters and behavior via API,
**So that** I can find species compatible with my tank conditions.

## Acceptance Criteria

**AC1 — Filter by behaviorTag:**
**Given** `GET /api/species?behaviorTag=PEACEFUL` is called
**When** processed
**Then** only species with behaviorTag = PEACEFUL are returned

**AC2 — Filter by pH range (overlap):**
**Given** `GET /api/species?phMin=6.5&phMax=7.5` is called
**When** processed
**Then** only species whose pH range overlaps with 6.5–7.5 are returned (species.ph_min ≤ 7.5 AND species.ph_max ≥ 6.5)

**AC3 — Filter by temperature range (overlap):**
**Given** `GET /api/species?tempMin=24&tempMax=28` is called
**When** processed
**Then** only species whose temperature range overlaps with 24–28°C are returned

**AC4 — Filter by careDifficulty:**
**Given** `GET /api/species?careDifficulty=EASY` is called
**When** processed
**Then** only species with careDifficulty = EASY are returned

**AC5 — Combined filters (AND logic):**
**Given** multiple filter params are combined (e.g., `?behaviorTag=PEACEFUL&careDifficulty=EASY`)
**When** processed
**Then** all filters are applied with AND logic — only species matching all criteria are returned

## Tasks/Subtasks

- [x] **Task 1: SpeciesSpec — filter specs**
  - [x] 1.1 Add `hasBehaviorTag(tag)` spec — enum lookup, null-safe
  - [x] 1.2 Add `hasCareDifficulty(difficulty)` spec — enum lookup, null-safe
  - [x] 1.3 Add `phOverlaps(phMin, phMax)` spec — range overlap logic
  - [x] 1.4 Add `tempOverlaps(tempMin, tempMax)` spec — range overlap logic

- [x] **Task 2: Service + Controller params**
  - [x] 2.1 Add filter params to `SpeciesService.list()` — compose with AND
  - [x] 2.2 Add `@RequestParam` for behaviorTag, careDifficulty, phMin, phMax, tempMin, tempMax in controller

## Dev Notes

### Range Overlap Logic
Hai range [a, b] và [c, d] overlap khi: `a ≤ d AND b ≥ c`.
Áp dụng: `species.ph_min ≤ userPhMax AND species.ph_max ≥ userPhMin`.
Null-safe: nếu chỉ có phMin, chỉ check `species.ph_max ≥ phMin`.

### Enum Validation
`BehaviorTag.valueOf(tag.toUpperCase())` — nếu tag không hợp lệ sẽ throw `IllegalArgumentException`. GlobalExceptionHandler xử lý → 400 Bad Request.

### AND Composition
Tất cả filter specs được compose bằng `.and()` → SQL `WHERE ... AND ... AND ...`.

## Dev Agent Record

### Completion Notes
✅ AC1: `?behaviorTag=PEACEFUL` → chỉ loài PEACEFUL
✅ AC2: `?phMin=6.5&phMax=7.5` → overlap check `ph_min ≤ 7.5 AND ph_max ≥ 6.5`
✅ AC3: `?tempMin=24&tempMax=28` → overlap check tương tự
✅ AC4: `?careDifficulty=EASY` → chỉ loài EASY
✅ AC5: combined filters → AND logic qua Specification composition

**Tests: covered trong SpeciesControllerTest** (behavior filter test case)

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesSpec.java` (modified — thêm 4 filter specs)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesService.java` (modified — nhận filter params)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (modified — thêm filter @RequestParams)

## Change Log

- 2026-05-15: Story 2.3 implemented — Species Filter API complete (cùng PR với 2.2)
