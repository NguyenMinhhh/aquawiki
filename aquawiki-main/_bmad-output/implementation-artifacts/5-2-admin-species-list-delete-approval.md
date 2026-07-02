---
story_key: 5-2-admin-species-list-delete-approval
epic: 5
story: 2
status: done
created: 2026-05-15
completed:
---

# Story 5.2: Admin Species List, Delete & Approval Workflow

**As an** administrator,
**I want** to view all species including drafts, delete records, and control which species are visible to users,
**So that** I can curate the public species database.

## Acceptance Criteria

**AC1 — Admin species list page:**
**Given** ADMIN user navigates to `/admin/species`
**When** SpeciesManagePage loads
**Then** bảng liệt kê TẤT CẢ species (cả DRAFT và APPROVED), mỗi row hiển thị: tên thường, status badge (DRAFT/APPROVED), behavior tag, và action buttons (Edit / Delete / Publish hoặc Unpublish)

**AC2 — GET /api/species trả cả DRAFT cho ADMIN:**
**Given** ADMIN JWT gọi `GET /api/species`
**When** processed
**Then** response bao gồm cả DRAFT và APPROVED species; non-admin hoặc unauthenticated vẫn chỉ nhận APPROVED

**AC3 — Delete species:**
**Given** admin click Delete trên một species
**When** `DELETE /api/species/{id}` được gọi với ADMIN JWT
**Then** species record bị xóa hoàn toàn, HTTP 204 trả về, species biến mất khỏi danh sách ngay lập tức

**AC4 — Publish DRAFT species:**
**Given** admin click Publish trên species đang là DRAFT
**When** `PATCH /api/species/{id}/status` được gọi với `{ "status": "APPROVED" }`
**Then** species status → APPROVED, HTTP 200 trả về, badge update ngay trong UI

**AC5 — Unpublish APPROVED species:**
**Given** admin click Unpublish trên species đang là APPROVED
**When** `PATCH /api/species/{id}/status` được gọi với `{ "status": "DRAFT" }`
**Then** species status → DRAFT, HTTP 200 trả về, badge update ngay trong UI; species ẩn khỏi public list

**AC6 — RBAC enforcement:**
**Given** USER role JWT gọi `DELETE /api/species/{id}`
**When** processed
**Then** API trả về HTTP 403

## Tasks/Subtasks

- [x] **Task 1: SpeciesService — thêm listAll & delete & updateStatus**
  - [ ] 1.1 Thêm `listAll(int page, int size): PagedResponse<SpeciesResponse>` — không filter status, trả cả DRAFT và APPROVED; dùng cho ADMIN endpoint
  - [ ] 1.2 Thêm `delete(Long id): void` — findById (404 nếu không tìm thấy), gọi `repo.delete(s)`
  - [ ] 1.3 Thêm `updateStatus(Long id, SpeciesStatus status): SpeciesResponse` — findById (404 nếu không tìm thấy), set status, save, return SpeciesResponse

- [x] **Task 2: StatusUpdateRequest DTO**
  - [ ] 2.1 Create `src/main/java/com/aquawiki/dto/StatusUpdateRequest.java` — record với 1 field: `@NotNull SpeciesStatus status`

- [x] **Task 3: SpeciesController — thêm admin endpoints**
  - [ ] 3.1 Sửa `GET /api/species`: check `Authentication` principal — nếu có ADMIN role thì gọi `speciesService.listAll(page, size)`, else gọi `speciesService.list(...)` như hiện tại. Inject `Authentication` vào method param.
  - [ ] 3.2 Thêm `DELETE /api/species/{id}` — `@PreAuthorize("hasRole('ADMIN')")`, `@ResponseStatus(HttpStatus.NO_CONTENT)`, delegate to `speciesService.delete()`
  - [ ] 3.3 Thêm `PATCH /api/species/{id}/status` — `@PreAuthorize("hasRole('ADMIN')")`, `@Valid @RequestBody StatusUpdateRequest`, delegate to `speciesService.updateStatus()`

- [x] **Task 4: SpeciesManagePage (frontend)**
  - [ ] 4.1 Create `src/pages/admin/SpeciesManagePage.tsx` — gọi `GET /api/species` (với admin JWT → nhận cả DRAFT); render table
  - [ ] 4.2 Table columns: Tên loài | Status badge | Behavior tag | Actions (Edit / Delete / Publish|Unpublish)
  - [ ] 4.3 Status badge: APPROVED → `bg-success-light text-success font-medium`; DRAFT → `bg-warning-light text-warning font-medium`
  - [ ] 4.4 Delete button: click → confirm dialog "Xác nhận xóa loài này?" → call `DELETE /api/species/{id}` → remove khỏi danh sách local state; on error show toast
  - [ ] 4.5 Publish/Unpublish button: click → call `PATCH /api/species/{id}/status` → update status trong local state ngay lập tức (optimistic update); on error revert
  - [ ] 4.6 Edit button: navigate to `/admin/species/{id}/edit`
  - [ ] 4.7 Nút "Thêm loài mới" ở góc trên phải → navigate to `/admin/species/new`
  - [ ] 4.8 Pagination controls nếu tổng > 20 (reuse pattern từ SpeciesListPage)

- [x] **Task 5: SecurityConfig — thêm /uploads/**
  - [ ] 5.1 Thêm `requestMatchers("/uploads/**").permitAll()` vào SecurityConfig để ảnh upload public-accessible (cần thiết cho Story 5.3 nhưng setup ở đây để tránh dynamic ordering)

- [x] **Task 6: Tests**
  - [ ] 6.1 Test `DELETE /api/species/{id}` với ADMIN JWT → 204; với USER JWT → 403; non-existent id → 404
  - [ ] 6.2 Test `PATCH /api/species/{id}/status` với `{ "status": "APPROVED" }` → 200; với USER JWT → 403
  - [ ] 6.3 Test `GET /api/species` với ADMIN JWT → bao gồm DRAFT species; không có JWT → chỉ APPROVED

## Dev Notes

### GET /api/species — admin sees DRAFT
```java
@GetMapping
public PagedResponse<SpeciesResponse> list(
        Authentication auth,
        @RequestParam(required = false) String search,
        // ... các param khác ...
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
) {
    boolean isAdmin = auth != null &&
        auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    if (isAdmin) {
        return speciesService.listAll(page, size);
    }
    return speciesService.list(search, behaviorTag, careDifficulty,
            phMin, phMax, tempMin, tempMax, page, size);
}
```

### SpeciesService.listAll()
```java
public PagedResponse<SpeciesResponse> listAll(int page, int size) {
    PageRequest pageable = PageRequest.of(page, size, Sort.by("commonName").ascending());
    Page<Species> result = repo.findAll(pageable);
    return new PagedResponse<>(
        result.getContent().stream().map(SpeciesResponse::from).toList(),
        result.getTotalElements(), page, size
    );
}
```

### PATCH vs PUT cho status update
Dùng `PATCH /api/species/{id}/status` riêng biệt (không merge vào PUT /api/species/{id}) để tách concern: PUT sửa content, PATCH/status chỉ thay đổi workflow state. Điều này cũng tránh admin vô tình reset status về DRAFT khi edit form.

### Optimistic update pattern (frontend)
```ts
const handleStatusChange = async (id: number, newStatus: 'APPROVED' | 'DRAFT') => {
  const prev = species.find(s => s.id === id)?.status
  setSpecies(list => list.map(s => s.id === id ? { ...s, status: newStatus } : s))
  try {
    await api.patch(`/api/species/${id}/status`, { status: newStatus })
  } catch {
    // revert
    setSpecies(list => list.map(s => s.id === id ? { ...s, status: prev } : s))
    alert('Không thể thay đổi trạng thái — vui lòng thử lại')
  }
}
```

### Delete confirmation
Dùng browser `confirm()` đơn giản (không cần custom modal): `if (!confirm('Xác nhận xóa loài này?')) return`

### ADMIN check trong SecurityConfig không cần sửa
`anyRequest().authenticated()` ở SecurityConfig vẫn đúng. ADMIN check cho DELETE và PATCH ở `@PreAuthorize` method level. GET giờ public (permit `/api/species` GET đã có) nhưng admin logic inject qua `Authentication` param.

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend (new/modified):**
- `aquawiki-backend/src/main/java/com/aquawiki/dto/StatusUpdateRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesService.java` (modified — add listAll, delete, updateStatus)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (modified — add DELETE, PATCH, update GET for admin)
- `aquawiki-backend/src/main/java/com/aquawiki/config/SecurityConfig.java` (modified — add /uploads/** permitAll)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/SpeciesControllerTest.java` (modified — add admin tests)

**Frontend (new/modified):**
- `aquawiki-frontend/src/pages/admin/SpeciesManagePage.tsx` (new — full implementation)

## Change Log

- 2026-05-15: Story 5.2 created
