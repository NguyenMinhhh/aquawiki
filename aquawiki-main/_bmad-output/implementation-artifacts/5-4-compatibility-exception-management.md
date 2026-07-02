---
story_key: 5-4-compatibility-exception-management
epic: 5
story: 4
status: done
created: 2026-05-15
completed:
---

# Story 5.4: Compatibility Exception Management

**As an** administrator,
**I want** to add, edit, and remove verified compatibility exception pairs,
**So that** known biological incompatibilities are captured even when the Rule Engine cannot detect them from parameters alone.

## Acceptance Criteria

**AC1 — List exceptions:**
**Given** ADMIN user xem trang compatibility exceptions
**When** page load
**Then** danh sách tất cả exception pairs hiển thị: species A tên, species B tên, level badge (COMPATIBLE/CAUTION/INCOMPATIBLE), note text, và action buttons (Edit / Delete)

**AC2 — Create exception:**
**Given** admin submit form thêm exception mới (species A id, species B id, level, note)
**When** `POST /api/compatibility/exceptions` được gọi
**Then** pair được lưu với normalization (speciesIdA = min(idA, idB)), HTTP 201 trả về với ExceptionResponse mới

**AC3 — Duplicate detection:**
**Given** admin tạo exception cho cặp species A-B đã có exception
**When** `POST /api/compatibility/exceptions` được gọi
**Then** API trả về HTTP 409 với message "Cặp loài này đã có exception"

**AC4 — Edit exception:**
**Given** admin edit exception đang có (thay đổi level hoặc note)
**When** `PUT /api/compatibility/exceptions/{id}` được gọi
**Then** exception được update, HTTP 200 trả về; future compatibility checks cho cặp đó dùng level mới ngay lập tức

**AC5 — Delete exception:**
**Given** admin delete một exception pair
**When** `DELETE /api/compatibility/exceptions/{id}` được gọi
**Then** exception bị xóa, HTTP 204 trả về; future compatibility checks cho cặp đó fallback về Rule Engine

**AC6 — RBAC enforcement:**
**Given** USER role JWT gọi bất kỳ endpoint nào của `/api/compatibility/exceptions`
**When** processed
**Then** API trả về HTTP 403

## Tasks/Subtasks

- [x] **Task 1: DTOs**
  - [ ] 1.1 Create `ExceptionRequest.java` — record: `@NotNull Long speciesIdA`, `@NotNull Long speciesIdB`, `@NotNull CompatibilityLevel level`, `String note`
  - [ ] 1.2 Create `ExceptionResponse.java` — record: `Long id`, `SpeciesSummary speciesA`, `SpeciesSummary speciesB`, `CompatibilityLevel level`, `String note`, `LocalDateTime createdAt`; thêm static factory `from(SpeciesCompatibility e)`
  - [ ] 1.3 `SpeciesSummary` đã có từ Story 4.3 — tái sử dụng, không tạo lại

- [x] **Task 2: CompatibilityExceptionService**
  - [ ] 2.1 Create `src/main/java/com/aquawiki/service/CompatibilityExceptionService.java` — `@Service`
  - [ ] 2.2 `listAll(): List<ExceptionResponse>` — findAll từ `SpeciesCompatibilityRepository`, map sang ExceptionResponse
  - [ ] 2.3 `create(ExceptionRequest req): ExceptionResponse`:
    - Load speciesA và speciesB từ SpeciesRepository (404 nếu không tìm thấy)
    - Normalize: `idA = Math.min(req.speciesIdA(), req.speciesIdB())`, `idB = Math.max(...)`
    - Check duplicate: `repo.findBySpeciesIdAAndSpeciesIdB(idA, idB)` → nếu tồn tại throw `ResponseStatusException(CONFLICT, "Cặp loài này đã có exception")`
    - Tạo `SpeciesCompatibility` entity, set speciesA (entity có id nhỏ hơn), speciesB, level, note, save
    - Return ExceptionResponse
  - [ ] 2.4 `update(Long id, ExceptionUpdateRequest req): ExceptionResponse` — findById (404 nếu không tìm thấy), update level và note, save, return ExceptionResponse
  - [ ] 2.5 `delete(Long id): void` — findById (404 nếu không tìm thấy), deleteById

- [x] **Task 3: ExceptionUpdateRequest DTO**
  - [ ] 3.1 Create `ExceptionUpdateRequest.java` — record: `@NotNull CompatibilityLevel level`, `String note` (chỉ cho phép update level và note — không cho đổi species pair)

- [x] **Task 4: CompatibilityExceptionController**
  - [ ] 4.1 Create `src/main/java/com/aquawiki/controller/CompatibilityExceptionController.java` — `@RestController @RequestMapping("/api/compatibility/exceptions")`
  - [ ] 4.2 `GET /api/compatibility/exceptions` — `@PreAuthorize("hasRole('ADMIN')")`, return `List<ExceptionResponse>`
  - [ ] 4.3 `POST /api/compatibility/exceptions` — `@PreAuthorize("hasRole('ADMIN')")`, `@Valid @RequestBody ExceptionRequest`, `@ResponseStatus(CREATED)`, return ExceptionResponse
  - [ ] 4.4 `PUT /api/compatibility/exceptions/{id}` — `@PreAuthorize("hasRole('ADMIN')")`, `@Valid @RequestBody ExceptionUpdateRequest`, return ExceptionResponse
  - [ ] 4.5 `DELETE /api/compatibility/exceptions/{id}` — `@PreAuthorize("hasRole('ADMIN')")`, `@ResponseStatus(NO_CONTENT)`

- [x] **Task 5: SpeciesCompatibilityRepository — thêm query method**
  - [ ] 5.1 Kiểm tra `SpeciesCompatibilityRepository` đã có `findBySpeciesIdAAndSpeciesIdB(Long idA, Long idB)` (từ Story 4.3). Nếu chưa có, thêm vào.
  - [ ] 5.2 Thêm `findAll(): List<SpeciesCompatibility>` nếu chưa có (JpaRepository đã có sẵn từ parent)

- [x] **Task 6: CompatibilityExceptionPage (frontend)**
  - [ ] 6.1 Create `src/pages/admin/CompatibilityExceptionPage.tsx` — gọi `GET /api/compatibility/exceptions` khi load
  - [ ] 6.2 Render table: Species A | Species B | Level badge | Note | Actions (Edit / Delete)
  - [ ] 6.3 Level badges: INCOMPATIBLE → `text-danger`; CAUTION → `text-warning`; COMPATIBLE → `text-success`
  - [ ] 6.4 Form thêm exception mới (inline form phía trên table hoặc modal):
    - Dropdown chọn speciesA từ `GET /api/species` (load toàn bộ, không phân trang cho dropdown — size=100)
    - Dropdown chọn speciesB (lọc bỏ speciesA đã chọn)
    - Select level (COMPATIBLE/CAUTION/INCOMPATIBLE)
    - Textarea note (optional)
    - Submit → `POST /api/compatibility/exceptions` → thêm vào list state
  - [ ] 6.5 Edit exception: click Edit → mở inline edit row hoặc modal với level và note pre-filled → `PUT /api/compatibility/exceptions/{id}` → update list state
  - [ ] 6.6 Delete: click Delete → confirm → `DELETE /api/compatibility/exceptions/{id}` → remove khỏi list state
  - [ ] 6.7 Error handling: 409 conflict → hiển thị "Cặp loài này đã có exception"

- [x] **Task 7: Types (frontend)**
  - [ ] 7.1 Thêm vào `src/types/compatibility.ts`: interface `ExceptionResponse { id: number; speciesA: SpeciesSummary; speciesB: SpeciesSummary; level: CompatibilityLevel; note: string | null; createdAt: string }`

- [x] **Task 8: Tests**
  - [ ] 8.1 `CompatibilityExceptionControllerTest` — GET list → 200 (ADMIN); POST valid → 201; POST duplicate → 409; PUT → 200; DELETE → 204; GET với USER JWT → 403

## Dev Notes

### ExceptionResponse.from()
```java
public static ExceptionResponse from(SpeciesCompatibility e) {
    return new ExceptionResponse(
        e.getId(),
        SpeciesSummary.from(e.getSpeciesA()),
        SpeciesSummary.from(e.getSpeciesB()),
        e.getLevel(),
        e.getNote(),
        e.getCreatedAt()
    );
}
```

### Normalize trong create()
```java
long idA = Math.min(req.speciesIdA(), req.speciesIdB());
long idB = Math.max(req.speciesIdA(), req.speciesIdB());
Species speciesA = speciesRepo.findById(idA)
    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Species not found: " + idA));
Species speciesB = speciesRepo.findById(idB)
    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Species not found: " + idB));
```

### Không expose /api/compatibility/check khi exception bị delete
`CompatibilityService` đã dùng `repo.findBySpeciesIdAAndSpeciesIdB()` trước khi fallback Rule Engine. Khi exception bị delete, future calls tự động fallback — không cần cache invalidation hay notify.

### Frontend dropdown species
```ts
const [allSpecies, setAllSpecies] = useState<SpeciesSummary[]>([])
useEffect(() => {
  api.get('/api/species?size=100').then(r => {
    setAllSpecies(r.data.data.map(s => ({ id: s.id, commonName: s.commonName, scientificName: s.scientificName })))
  })
}, [])
```
Filter speciesB options khi speciesA đã chọn: `allSpecies.filter(s => s.id !== selectedA?.id)`

### GET /api/compatibility/exceptions — SecurityConfig
`anyRequest().authenticated()` đã cover endpoint này. `@PreAuthorize("hasRole('ADMIN')")` enforce ADMIN. SecurityConfig không cần sửa.

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend (new/modified):**
- `aquawiki-backend/src/main/java/com/aquawiki/dto/ExceptionRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/ExceptionResponse.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/ExceptionUpdateRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/CompatibilityExceptionService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/CompatibilityExceptionController.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesCompatibilityRepository.java` (potentially modified — verify findAll exists)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/CompatibilityExceptionControllerTest.java` (new)

**Frontend (new/modified):**
- `aquawiki-frontend/src/types/compatibility.ts` (modified — add ExceptionResponse)
- `aquawiki-frontend/src/pages/admin/CompatibilityExceptionPage.tsx` (new — full implementation)

## Change Log

- 2026-05-15: Story 5.4 created
