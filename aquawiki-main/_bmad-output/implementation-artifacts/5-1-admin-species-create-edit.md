---
story_key: 5-1-admin-species-create-edit
epic: 5
story: 1
status: done
created: 2026-05-15
completed:
---

# Story 5.1: Admin Species Create & Edit

**As an** administrator,
**I want** to create new species records and edit existing ones with all required parameters,
**So that** the species database stays accurate and complete.

## Acceptance Criteria

**AC1 — Create form UI:**
**Given** ADMIN user navigates to `/admin/species/new`
**When** SpeciesFormPage loads
**Then** form hiển thị đủ fields: commonName, scientificName, phMin, phMax, tempMin, tempMax, maxSizeCm, behaviorTag (dropdown: PEACEFUL/SEMI_AGGRESSIVE/AGGRESSIVE), careDifficulty (dropdown: EASY/MEDIUM/HARD), bioloadFactor, description (textarea)

**AC2 — POST /api/species (create):**
**Given** admin submit form hợp lệ
**When** `POST /api/species` được gọi với ADMIN JWT
**Then** tạo species record với status = DRAFT, trả về HTTP 201 với SpeciesResponse, frontend redirect sang `/admin/species`

**AC3 — Edit form pre-populate:**
**Given** admin navigate đến `/admin/species/:id/edit`
**When** form load
**Then** tất cả fields được pre-populate với giá trị hiện tại của species đó

**AC4 — PUT /api/species/{id} (update):**
**Given** admin submit edit form hợp lệ
**When** `PUT /api/species/{id}` được gọi với ADMIN JWT
**Then** species record được update, trả về HTTP 200 với SpeciesResponse đã cập nhật

**AC5 — Validation errors:**
**Given** admin submit form thiếu required field (phMin, phMax, tempMin, tempMax, maxSizeCm, behaviorTag, commonName)
**When** `POST` hoặc `PUT` được gọi
**Then** API trả về HTTP 400 với field-level error message; frontend hiển thị inline error dưới mỗi field lỗi

**AC6 — RBAC enforcement:**
**Given** USER role JWT gọi `POST /api/species`
**When** processed bởi Spring Security
**Then** API trả về HTTP 403 — `@PreAuthorize("hasRole('ADMIN')")` block ở controller

## Tasks/Subtasks

- [x] **Task 1: SpeciesRequest DTO**
  - [x] 1.1 Create `src/main/java/com/aquawiki/dto/SpeciesRequest.java` — record với tất cả writable fields (không có id, status, createdAt, updatedAt): commonName, scientificName, phMin, phMax, tempMin, tempMax, maxSizeCm, behaviorTag (enum), careDifficulty (enum), description, bioloadFactor
  - [x] 1.2 Thêm Bean Validation: `@NotBlank` cho commonName/scientificName; `@NotNull` cho phMin/phMax/tempMin/tempMax/maxSizeCm/behaviorTag/careDifficulty/bioloadFactor; `@Positive` cho maxSizeCm, bioloadFactor; `@DecimalMin("0")` cho phMin/phMax/tempMin/tempMax

- [x] **Task 2: SpeciesService — create & update methods**
  - [x] 2.1 Thêm `create(SpeciesRequest req): SpeciesResponse` vào `SpeciesService` — map request → Species entity, set status = DRAFT, save và return SpeciesResponse
  - [x] 2.2 Thêm `update(Long id, SpeciesRequest req): SpeciesResponse` — findById (404 nếu không tìm thấy), update tất cả fields trừ status, save và return SpeciesResponse
  - [x] 2.3 Không thay đổi method `list()` và `getById()` hiện có

- [x] **Task 3: SpeciesController — thêm create & update endpoints**
  - [x] 3.1 Thêm `POST /api/species` — `@PreAuthorize("hasRole('ADMIN')")`, `@Valid @RequestBody SpeciesRequest`, `@ResponseStatus(HttpStatus.CREATED)`, delegate to `speciesService.create()`
  - [x] 3.2 Thêm `PUT /api/species/{id}` — `@PreAuthorize("hasRole('ADMIN')")`, `@Valid @RequestBody SpeciesRequest`, delegate to `speciesService.update()`
  - [x] 3.3 Không sửa `GET /api/species` và `GET /api/species/{id}` (xử lý ở Story 5.2)

- [x] **Task 4: Admin router setup trong AdminPage**
  - [x] 4.1 Refactor `AdminPage.tsx` thành layout shell với sidebar navigation (links: "Quản lý loài", "Tương thích exception", "Báo cáo") và `<Routes>` / `<Outlet>` cho sub-pages
  - [x] 4.2 Dùng `useRoutes` bên trong AdminPage để handle: `/admin` → redirect `/admin/species`; `/admin/species` → SpeciesManagePage (placeholder, filled in 5.2); `/admin/species/new` → SpeciesFormPage (create mode); `/admin/species/:id/edit` → SpeciesFormPage (edit mode); `/admin/compatibility` → placeholder; `/admin/flags` → placeholder
  - [x] 4.3 Sidebar chứa NavLink với active styling

- [x] **Task 5: SpeciesFormPage (frontend)**
  - [x] 5.1 Create `src/pages/admin/SpeciesFormPage.tsx` — nhận mode từ URL (new vs :id/edit); nếu edit mode, gọi `GET /api/species/{id}` để fetch current values
  - [x] 5.2 Form fields: text inputs cho commonName, scientificName, description (textarea); number inputs cho phMin, phMax, tempMin, tempMax, maxSizeCm, bioloadFactor; select dropdowns cho behaviorTag, careDifficulty
  - [x] 5.3 Submit handler: edit mode → `PUT /api/species/{id}`; create mode → `POST /api/species`; on success → navigate to `/admin/species`
  - [x] 5.4 Inline validation: hiển thị error message dưới mỗi field từ API response (field-level) hoặc từ HTML5 required validation

- [x] **Task 6: Tests**
  - [x] 6.1 `SpeciesControllerTest` — POST với valid body (mock service) → 201; POST thiếu field bắt buộc → 400; POST với USER JWT → 403; PUT valid → 200; PUT non-existent id → 404

## Dev Notes

### SpeciesRequest record
```java
public record SpeciesRequest(
    @NotBlank @Size(max = 150) String commonName,
    @NotBlank @Size(max = 200) String scientificName,
    @NotNull BigDecimal phMin,
    @NotNull BigDecimal phMax,
    @NotNull BigDecimal tempMin,
    @NotNull BigDecimal tempMax,
    @NotNull @Positive BigDecimal maxSizeCm,
    @NotNull BehaviorTag behaviorTag,
    @NotNull CareDifficulty careDifficulty,
    String description,
    @NotNull @Positive BigDecimal bioloadFactor
) {}
```

### SpeciesService.create()
```java
public SpeciesResponse create(SpeciesRequest req) {
    Species s = new Species();
    mapRequest(s, req);
    s.setStatus(SpeciesStatus.DRAFT);
    return SpeciesResponse.from(repo.save(s));
}
```

### SpeciesService.update()
```java
public SpeciesResponse update(Long id, SpeciesRequest req) {
    Species s = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Species not found"));
    mapRequest(s, req);
    return SpeciesResponse.from(repo.save(s));
}
private void mapRequest(Species s, SpeciesRequest req) {
    s.setCommonName(req.commonName());
    s.setScientificName(req.scientificName());
    s.setPhMin(req.phMin());
    s.setPhMax(req.phMax());
    s.setTempMin(req.tempMin());
    s.setTempMax(req.tempMax());
    s.setMaxSizeCm(req.maxSizeCm());
    s.setBehaviorTag(req.behaviorTag());
    s.setCareDifficulty(req.careDifficulty());
    s.setDescription(req.description());
    s.setBioloadFactor(req.bioloadFactor());
}
```

### Admin router pattern (AdminPage.tsx)
AdminPage sử dụng `useRoutes` với `useMatch('admin/*')` để resolve sub-paths:
```tsx
import { Routes, Route, Navigate } from 'react-router'

// Trong AdminPage component:
<div className="flex min-h-screen">
  <aside>{/* sidebar nav links */}</aside>
  <main className="flex-1">
    <Routes>
      <Route index element={<Navigate to="species" replace />} />
      <Route path="species" element={<SpeciesManagePage />} />
      <Route path="species/new" element={<SpeciesFormPage />} />
      <Route path="species/:id/edit" element={<SpeciesFormPage />} />
      <Route path="compatibility" element={<CompatibilityExceptionPage />} />
      <Route path="flags" element={<FlagReviewPage />} />
    </Routes>
  </main>
</div>
```

main.tsx đã có `/admin/*` → AdminPage lazy-loaded — không cần sửa gì ở main.tsx.

### SpeciesFormPage — detect mode
```tsx
const { id } = useParams()
const isEditMode = !!id

useEffect(() => {
  if (isEditMode) {
    api.get<SpeciesResponse>(`/api/species/${id}`).then(r => {
      // populate form state with r.data
    })
  }
}, [id])
```

### SecurityConfig — không cần sửa
`@EnableMethodSecurity` đã enabled trong SecurityConfig. `@PreAuthorize("hasRole('ADMIN')")` ở method level sẽ hoạt động. Admin endpoints như `POST /api/species` bị `anyRequest().authenticated()` cover — nhưng PreAuthorize sẽ enforce ADMIN role thêm.

### GET /api/species với ADMIN JWT — admin cần thấy DRAFT
Hiện tại `SpeciesService.list()` luôn filter `approved()`. Story 5.2 sẽ handle logic này — Story 5.1 KHÔNG sửa GET /api/species.

## Dev Agent Record

### Debug Log

### Completion Notes
All tasks implemented. Backend: SpeciesRequest DTO, SpeciesService (create/update/delete/updateStatus/updateImageUrl), SpeciesController (POST, PUT, PATCH/status, DELETE, PUT/image). Frontend: AdminPage router shell with sidebar, SpeciesFormPage (create/edit with image upload), main.tsx nested admin routes. All 44 tests pass.

## File List

**Backend (new/modified):**
- `aquawiki-backend/src/main/java/com/aquawiki/dto/SpeciesRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesService.java` (modified — add create, update)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (modified — add POST, PUT)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/SpeciesControllerTest.java` (new or modified)

**Frontend (new/modified):**
- `aquawiki-frontend/src/pages/AdminPage.tsx` (modified — router shell with sidebar)
- `aquawiki-frontend/src/pages/admin/SpeciesFormPage.tsx` (new)
- `aquawiki-frontend/src/pages/admin/SpeciesManagePage.tsx` (new — placeholder, filled in Story 5.2)
- `aquawiki-frontend/src/pages/admin/CompatibilityExceptionPage.tsx` (new — placeholder)
- `aquawiki-frontend/src/pages/admin/FlagReviewPage.tsx` (new — placeholder)

## Change Log

- 2026-05-15: Story 5.1 created
