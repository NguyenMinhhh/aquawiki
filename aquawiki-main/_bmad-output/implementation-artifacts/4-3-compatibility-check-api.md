---
story_key: 4-3-compatibility-check-api
epic: 4
story: 3
status: done
created: 2026-05-15
completed:
---

# Story 4.3: Compatibility Check API

**As the** system,
**I want** a compatibility check API that orchestrates exception table lookup and Rule Engine,
**So that** the frontend can request group compatibility for any species combination in under 2 seconds.

## Acceptance Criteria

**AC1 — POST /api/compatibility/check với valid ids:**
**Given** `POST /api/compatibility/check` được gọi với `{ "speciesIds": [1, 2, 3] }`
**When** processed bởi `CompatibilityService`
**Then** với mỗi unique pair: service query `SpeciesCompatibilityRepository` trước (exception table); nếu tìm thấy → dùng exception result; nếu không → gọi `CompatibilityRuleEngine.evaluate()`

**AC2 — Response format:**
**Given** service đã evaluate tất cả pairs
**When** build response
**Then** API trả về:
```json
{
  "groupResult": "INCOMPATIBLE",
  "pairs": [
    {
      "speciesA": { "id": 1, "commonName": "..." },
      "speciesB": { "id": 2, "commonName": "..." },
      "level": "INCOMPATIBLE",
      "reason": "...",
      "source": "EXCEPTION"
    }
  ]
}
```
`groupResult` là worst severity across all pairs. `source` là `"EXCEPTION"` hoặc `"RULE_ENGINE"`.

**AC3 — Single species:**
**Given** POST với `{ "speciesIds": [1] }`
**When** processed
**Then** trả về `{ "groupResult": "COMPATIBLE", "pairs": [] }` — không có pairs để evaluate

**AC4 — Validation:**
**Given** POST với empty array `{ "speciesIds": [] }` hoặc species id không tồn tại
**When** processed
**Then** trả về HTTP 400 với error envelope mô tả cụ thể

**AC5 — Performance:**
**Given** check được perform cho 10 species (45 unique pairs)
**When** processed
**Then** API respond trong < 2 giây

**AC6 — Error safety:**
**Given** unexpected error xảy ra trong Rule Engine evaluation
**When** caught bởi GlobalExceptionHandler
**Then** API trả về HTTP 500 với standard error envelope — KHÔNG bao giờ silently trả về COMPATIBLE sai

## Tasks/Subtasks

- [ ] **Task 1: DTOs**
  - [ ] 1.1 Create `CompatibilityCheckRequest` record: `List<Long> speciesIds` với `@NotEmpty`, `@Size(min=1, max=20)`
  - [ ] 1.2 Create `PairResult` record: speciesA (SpeciesSummary), speciesB (SpeciesSummary), level (CompatibilityLevel), reason (String), source (String: "EXCEPTION" | "RULE_ENGINE")
  - [ ] 1.3 Create `SpeciesSummary` record: id, commonName, scientificName — dùng cho pair response
  - [ ] 1.4 Create `CompatibilityCheckResponse` record: groupResult (CompatibilityLevel), pairs (List<PairResult>)

- [ ] **Task 2: CompatibilityService**
  - [ ] 2.1 Create `CompatibilityService` @Service
  - [ ] 2.2 `check(List<Long> speciesIds)`: load tất cả Species entities từ SpeciesRepository (404 nếu bất kỳ id nào không tồn tại)
  - [ ] 2.3 Generate all unique pairs: vòng lặp nested `i < j`
  - [ ] 2.4 Với mỗi pair: normalize (idA = min, idB = max), query exception table trước, nếu miss → gọi rule engine
  - [ ] 2.5 Aggregate groupResult: worst level across all pairs

- [ ] **Task 3: CompatibilityController**
  - [ ] 3.1 Create `CompatibilityController` — `POST /api/compatibility/check`
  - [ ] 3.2 Endpoint: `@Valid @RequestBody CompatibilityCheckRequest` → CompatibilityCheckResponse
  - [ ] 3.3 Không cần `@ResponseStatus` (default 200 OK)

- [ ] **Task 4: SecurityConfig**
  - [ ] 4.1 Add `POST /api/compatibility/check` → authenticated (đã covered bởi `anyRequest().authenticated()` — không cần thêm gì)

- [ ] **Task 5: Tests**
  - [ ] 5.1 `CompatibilityControllerTest` — valid 3 ids (mock service), single id → COMPATIBLE, empty list → 400, non-existent id → 404

## Dev Notes

### Exception table lookup với normalization
```java
long idA = Math.min(speciesA.getId(), speciesB.getId());
long idB = Math.max(speciesA.getId(), speciesB.getId());
Optional<SpeciesCompatibility> exception = compatibilityRepo
    .findBySpeciesIdAAndSpeciesIdB(idA, idB);
```

### Species loading với 404
```java
List<Species> speciesList = speciesIds.stream()
    .map(id -> speciesRepo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND,
            "Species not found: " + id)))
    .toList();
```

### Worst-case groupResult
```java
CompatibilityLevel group = pairs.stream()
    .map(PairResult::level)
    .max(Comparator.comparingInt(Enum::ordinal))
    .orElse(CompatibilityLevel.COMPATIBLE);
```
Enum ordinal: COMPATIBLE=0, CAUTION=1, INCOMPATIBLE=2

### SecurityConfig — không cần sửa
`anyRequest().authenticated()` đã cover `/api/compatibility/check`. Endpoint cần auth (user phải đăng nhập để check compatibility trong simulator).

### Unique pair generation
```java
for (int i = 0; i < speciesList.size(); i++) {
    for (int j = i + 1; j < speciesList.size(); j++) {
        evaluatePair(speciesList.get(i), speciesList.get(j));
    }
}
```

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/dto/CompatibilityCheckRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/CompatibilityCheckResponse.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/PairResult.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/SpeciesSummary.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/CompatibilityService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/CompatibilityController.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/CompatibilityControllerTest.java` (new)

## Change Log

- 2026-05-15: Story 4.3 created
