---
story_key: 5-5-review-flagged-species
epic: 5
story: 5
status: done
created: 2026-05-15
completed:
---

# Story 5.5: Review Flagged Species Reports

**As an** administrator,
**I want** to review species data quality flags submitted by users,
**So that** I can investigate reported inaccuracies and maintain database integrity.

## Acceptance Criteria

**AC1 — Flags list page:**
**Given** ADMIN user navigate đến `/admin/flags`
**When** FlagReviewPage load
**Then** danh sách tất cả PENDING flags hiển thị: tên species, reason báo cáo, tên user báo cáo, ngày submit; và action buttons (Mark Reviewed / Dismiss)

**AC2 — GET /api/species/flags (ADMIN only):**
**Given** ADMIN JWT gọi `GET /api/species/flags?status=PENDING`
**When** processed
**Then** response trả về danh sách PENDING flags với species info và reporter info; HTTP 200

**AC3 — Mark as REVIEWED:**
**Given** admin click "Đã xem xét" trên một flag
**When** `PUT /api/species/flags/{id}` được gọi với `{ "status": "REVIEWED" }`
**Then** flag status → REVIEWED, HTTP 200 trả về; flag biến mất khỏi PENDING list trong UI ngay lập tức

**AC4 — Mark as DISMISSED:**
**Given** admin click "Bỏ qua" trên flag (báo cáo không chính xác)
**When** `PUT /api/species/flags/{id}` được gọi với `{ "status": "DISMISSED" }`
**Then** flag status → DISMISSED, HTTP 200 trả về; flag biến mất khỏi PENDING list trong UI ngay lập tức

**AC5 — RBAC enforcement:**
**Given** USER role JWT gọi `GET /api/species/flags` hoặc `PUT /api/species/flags/{id}`
**When** processed
**Then** API trả về HTTP 403

**AC6 — Empty state:**
**Given** không có PENDING flags
**When** FlagReviewPage load
**Then** hiển thị "Không có báo cáo nào đang chờ xem xét" — không phải blank page hay error

## Tasks/Subtasks

- [x] **Task 1: DTOs**
  - [ ] 1.1 Create `FlagResponse.java` — record: `Long id`, `Long speciesId`, `String speciesName`, `String reportedByEmail`, `String reason`, `FlagStatus status`, `LocalDateTime createdAt`; thêm static factory `from(SpeciesFlag f)`
  - [ ] 1.2 Create `FlagStatusUpdateRequest.java` — record: `@NotNull FlagStatus status` (chỉ accept REVIEWED hoặc DISMISSED — PENDING không hợp lệ khi update); thêm validation `@AssertTrue` hoặc check trong service

- [x] **Task 2: SpeciesFlagService — thêm admin methods**
  - [ ] 2.1 Kiểm tra `SpeciesFlagService.java` đã có — xem method nào tồn tại (Story 2.7 đã implement createFlag)
  - [ ] 2.2 Thêm `listByStatus(FlagStatus status): List<FlagResponse>` — query `SpeciesFlagRepository.findByStatusOrderByCreatedAtDesc(status)`, map sang FlagResponse
  - [ ] 2.3 Thêm `updateStatus(Long flagId, FlagStatus newStatus): FlagResponse`:
    - findById flagId (404 nếu không tìm thấy)
    - Validate `newStatus != FlagStatus.PENDING` (không cho update về PENDING — 400)
    - Set status, save, return FlagResponse

- [x] **Task 3: SpeciesFlagRepository — thêm query method**
  - [ ] 3.1 Kiểm tra `SpeciesFlagRepository.java` — thêm `List<SpeciesFlag> findByStatusOrderByCreatedAtDesc(FlagStatus status)` nếu chưa có

- [x] **Task 4: FlagsController (hoặc thêm vào SpeciesController)**
  - [ ] 4.1 Tạo `FlagsController.java` riêng: `@RestController @RequestMapping("/api/species/flags")` hoặc thêm vào `SpeciesController` (prefer tách ra để tránh file quá lớn)
  - [ ] 4.2 `GET /api/species/flags` — `@PreAuthorize("hasRole('ADMIN')")`, `@RequestParam(defaultValue = "PENDING") String status`, parse FlagStatus, return `List<FlagResponse>`
  - [ ] 4.3 `PUT /api/species/flags/{id}` — `@PreAuthorize("hasRole('ADMIN')")`, `@Valid @RequestBody FlagStatusUpdateRequest`, return FlagResponse

- [x] **Task 5: FlagReviewPage (frontend)**
  - [ ] 5.1 Create `src/pages/admin/FlagReviewPage.tsx` — gọi `GET /api/species/flags?status=PENDING` khi load
  - [ ] 5.2 Render table: Tên loài (link sang `/species/{id}`) | Lý do báo cáo | Người báo cáo (email) | Ngày báo cáo | Actions
  - [ ] 5.3 Action "Đã xem xét" (icon: ✓ xanh) → gọi `PUT /api/species/flags/{id}` với `{ "status": "REVIEWED" }` → remove khỏi list state (optimistic)
  - [ ] 5.4 Action "Bỏ qua" (icon: × xám) → gọi `PUT /api/species/flags/{id}` với `{ "status": "DISMISSED" }` → remove khỏi list state (optimistic)
  - [ ] 5.5 Empty state: khi `flags.length === 0` hiển thị "Không có báo cáo nào đang chờ xem xét" với icon check circle
  - [ ] 5.6 Loading state: skeleton rows trong khi fetch
  - [ ] 5.7 Badge đếm số flags PENDING trong sidebar của AdminPage (fetch count từ API khi AdminPage mount)

- [x] **Task 6: Types (frontend)**
  - [ ] 6.1 Create `src/types/flag.ts`:
    ```ts
    export type FlagStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED'
    export interface FlagResponse {
      id: number
      speciesId: number
      speciesName: string
      reportedByEmail: string
      reason: string
      status: FlagStatus
      createdAt: string
    }
    ```

- [x] **Task 7: Navbar badge — admin flags indicator**
  - [ ] 7.1 Nếu user có role ADMIN: Navbar hiển thị link "Admin" với badge đỏ nếu có PENDING flags (`GET /api/species/flags?status=PENDING` → count); fetch khi Navbar mount, không poll

- [x] **Task 8: Tests**
  - [ ] 8.1 `FlagsControllerTest` — GET với ADMIN JWT và status=PENDING → 200; PUT với REVIEWED → 200; PUT với PENDING → 400; GET/PUT với USER JWT → 403; GET với non-existent flag PUT → 404

## Dev Notes

### FlagResponse.from()
```java
public static FlagResponse from(SpeciesFlag f) {
    return new FlagResponse(
        f.getId(),
        f.getSpecies().getId(),
        f.getSpecies().getCommonName(),
        f.getReportedBy().getEmail(),
        f.getReason(),
        f.getStatus(),
        f.getCreatedAt()
    );
}
```
Lưu ý: `f.getSpecies()` và `f.getReportedBy()` là `LAZY` fetch. Trong service, khi gọi `findByStatusOrderByCreatedAtDesc()`, cần đảm bảo session còn mở (đã là trong `@Service` → trong transaction nếu có `@Transactional`) hoặc dùng `@EntityGraph` trên query.

### SpeciesFlagRepository query method
```java
@Query("SELECT f FROM SpeciesFlag f JOIN FETCH f.species JOIN FETCH f.reportedBy WHERE f.status = :status ORDER BY f.createdAt DESC")
List<SpeciesFlag> findByStatusWithDetails(@Param("status") FlagStatus status);
```
Dùng JOIN FETCH để tránh N+1 khi map sang FlagResponse (cần eager load species và reportedBy cùng 1 query).

### FlagStatusUpdateRequest validation
```java
public record FlagStatusUpdateRequest(@NotNull FlagStatus status) {
    public FlagStatusUpdateRequest {
        if (status == FlagStatus.PENDING) {
            throw new IllegalArgumentException("Cannot set flag status back to PENDING");
        }
    }
}
```
Hoặc validate trong service:
```java
if (newStatus == FlagStatus.PENDING) {
    throw new ResponseStatusException(BAD_REQUEST, "Không thể đặt lại trạng thái về PENDING");
}
```

### Optimistic remove trong FlagReviewPage
```ts
const handleAction = async (id: number, status: 'REVIEWED' | 'DISMISSED') => {
  setFlags(prev => prev.filter(f => f.id !== id))  // optimistic remove
  try {
    await api.put(`/api/species/flags/${id}`, { status })
  } catch {
    // revert: refetch list
    refetch()
    alert('Có lỗi xảy ra, vui lòng thử lại')
  }
}
```

### Navbar badge (admin only)
```tsx
// Trong Navbar.tsx, khi user.role === 'ADMIN':
const [pendingCount, setPendingCount] = useState(0)
useEffect(() => {
  if (user?.role === 'ADMIN') {
    api.get<FlagResponse[]>('/api/species/flags?status=PENDING')
      .then(r => setPendingCount(r.data.length))
      .catch(() => {}) // silently fail — badge optional
  }
}, [user])
```

### FlagsController vs SpeciesController
Tách ra `FlagsController` với `@RequestMapping("/api/species/flags")` để tránh conflict với `@GetMapping("/flags")` trong SpeciesController (Spring có thể conflict URL mapping nếu cùng controller). Nếu dùng `@RequestMapping("/api/species")` cho SpeciesController thì thêm `@GetMapping("/flags")` trong SpeciesController sẽ work. Prefer tách controller riêng cho clarity.

### SecurityConfig
`anyRequest().authenticated()` đã cover `/api/species/flags`. `@PreAuthorize` enforce ADMIN. Không sửa SecurityConfig.

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend (new/modified):**
- `aquawiki-backend/src/main/java/com/aquawiki/dto/FlagResponse.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/FlagStatusUpdateRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesFlagService.java` (modified — add listByStatus, updateStatus)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesFlagRepository.java` (modified — add JOIN FETCH query)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/FlagsController.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/FlagsControllerTest.java` (new)

**Frontend (new/modified):**
- `aquawiki-frontend/src/types/flag.ts` (new)
- `aquawiki-frontend/src/pages/admin/FlagReviewPage.tsx` (new — full implementation)
- `aquawiki-frontend/src/components/Navbar.tsx` (modified — admin flag badge)

## Change Log

- 2026-05-15: Story 5.5 created
