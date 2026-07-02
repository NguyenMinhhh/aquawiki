---
story_key: 5-3-species-image-upload
epic: 5
story: 3
status: done
created: 2026-05-15
completed:
---

# Story 5.3: Species Image Upload

**As an** administrator,
**I want** to upload and replace a species image,
**So that** every species has a representative photo in the encyclopedia.

## Acceptance Criteria

**AC1 — Image preview trước khi submit:**
**Given** admin đang ở SpeciesFormPage của species đã có (edit mode)
**When** chọn file ảnh qua upload input
**Then** filename được hiển thị và preview ảnh được show (img src = object URL) trước khi submit form

**AC2 — Upload thành công:**
**Given** admin upload file JPEG hoặc PNG hợp lệ (≤ 5MB)
**When** `PUT /api/species/{id}/image` được gọi với multipart form data (field name: `file`)
**Then** file được lưu vào `uploads/species/{id}.{ext}`, `species.image_url` được cập nhật thành `/uploads/species/{id}.{ext}`, HTTP 200 trả về với SpeciesResponse mới (bao gồm imageUrl mới)

**AC3 — MIME type validation:**
**Given** admin upload file với MIME type không hợp lệ (PDF, EXE, GIF, WebP...)
**When** processed server-side
**Then** API trả về HTTP 400 với message "Chỉ chấp nhận file ảnh JPEG hoặc PNG" — file không được lưu (NFR11)

**AC4 — File size validation:**
**Given** admin upload file vượt quá 5MB
**When** processed server-side
**Then** API trả về HTTP 400 với message "Kích thước file tối đa là 5MB" — file không được lưu (NFR11)

**AC5 — Image accessible sau upload:**
**Given** species image được upload thành công
**When** bất kỳ user nào xem species detail page
**Then** ảnh được serve từ `/uploads/species/{id}.{ext}` qua Spring static resource handler — không cần JWT để xem ảnh

**AC6 — Ảnh cũ bị thay thế:**
**Given** species đã có image_url
**When** admin upload ảnh mới cho cùng species
**Then** file cũ bị xóa khỏi filesystem, file mới ghi đè, `image_url` được update

## Tasks/Subtasks

- [x] **Task 1: application.properties — multipart và resource handler config**
  - [ ] 1.1 Thêm vào `application.properties`:
    ```
    spring.servlet.multipart.max-file-size=5MB
    spring.servlet.multipart.max-request-size=6MB
    spring.web.resources.static-locations=classpath:/static/,file:./uploads/
    ```
  - [ ] 1.2 Tạo thư mục `uploads/species/` (empty dir — gitignore content but track .gitkeep)
  - [ ] 1.3 Thêm `uploads/species/*` vào `.gitignore`, thêm `uploads/species/.gitkeep` để track thư mục

- [x] **Task 2: ImageStorageService**
  - [ ] 2.1 Create `src/main/java/com/aquawiki/service/ImageStorageService.java` — `@Service`
  - [ ] 2.2 `store(Long speciesId, MultipartFile file): String` — validate MIME type (image/jpeg, image/png only), validate size ≤ 5MB, determine extension từ content type, build path `uploads/species/{speciesId}.{ext}`, xóa file cũ nếu tồn tại, save bytes, return relative URL `/uploads/species/{speciesId}.{ext}`
  - [ ] 2.3 Nếu MIME type invalid → throw `ResponseStatusException(BAD_REQUEST, "Chỉ chấp nhận file ảnh JPEG hoặc PNG")`
  - [ ] 2.4 Nếu size > 5MB → throw `ResponseStatusException(BAD_REQUEST, "Kích thước file tối đa là 5MB")`

- [x] **Task 3: SpeciesController — thêm image upload endpoint**
  - [ ] 3.1 Thêm `PUT /api/species/{id}/image` — `@PreAuthorize("hasRole('ADMIN')")`, `@RequestParam("file") MultipartFile file`
  - [ ] 3.2 Delegate: gọi `imageStorageService.store(id, file)` → lấy imageUrl → gọi `speciesService.updateImageUrl(id, imageUrl)` → return SpeciesResponse

- [x] **Task 4: SpeciesService — updateImageUrl**
  - [ ] 4.1 Thêm `updateImageUrl(Long id, String imageUrl): SpeciesResponse` — findById (404 nếu không tìm thấy), set imageUrl, save, return SpeciesResponse

- [x] **Task 5: Frontend — image upload UI trong SpeciesFormPage**
  - [ ] 5.1 Thêm section "Ảnh loài" trong SpeciesFormPage (chỉ hiển thị ở edit mode — không có upload khi create vì cần id)
  - [ ] 5.2 `<input type="file" accept="image/jpeg,image/png" />` — onChange: preview với `URL.createObjectURL(file)`, lưu file vào state
  - [ ] 5.3 Nút "Upload ảnh" riêng biệt (không chung với form submit) → gọi `PUT /api/species/{id}/image` với FormData; show loading state; on success cập nhật preview; on error hiển thị message lỗi từ API
  - [ ] 5.4 Nếu species hiện có imageUrl → hiển thị ảnh hiện tại trước khi upload mới

- [x] **Task 6: SpeciesDetailPage — xử lý imageUrl**
  - [ ] 6.1 Kiểm tra `SpeciesDetailPage.tsx` và `SpeciesCard.tsx` — nếu `imageUrl` là null hoặc empty, hiển thị placeholder image (không broken img icon). Nếu imageUrl là relative path (`/uploads/...`), prepend `http://localhost:8080` cho dev environment (hoặc dùng base URL từ api.ts baseURL)

- [x] **Task 7: GlobalExceptionHandler — handle MaxUploadSizeExceededException**
  - [ ] 7.1 Thêm handler cho `MaxUploadSizeExceededException` trong `GlobalExceptionHandler` → HTTP 400, message "Kích thước file tối đa là 5MB" (Spring ném exception này trước khi đến controller nếu file > max-file-size)

- [x] **Task 8: Tests**
  - [ ] 8.1 `ImageStorageServiceTest` — valid JPEG → lưu thành công; invalid MIME type → 400; file > 5MB → 400
  - [ ] 8.2 `SpeciesControllerTest` — `PUT /api/species/{id}/image` với valid JPEG → 200; với USER JWT → 403

## Dev Notes

### ImageStorageService.store()
```java
private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png");
private static final long MAX_SIZE = 5 * 1024 * 1024L; // 5MB

public String store(Long speciesId, MultipartFile file) throws IOException {
    if (file.isEmpty() || !ALLOWED.contains(file.getContentType())) {
        throw new ResponseStatusException(BAD_REQUEST, "Chỉ chấp nhận file ảnh JPEG hoặc PNG");
    }
    if (file.getSize() > MAX_SIZE) {
        throw new ResponseStatusException(BAD_REQUEST, "Kích thước file tối đa là 5MB");
    }
    String ext = "image/png".equals(file.getContentType()) ? "png" : "jpg";
    Path dir = Paths.get("uploads", "species");
    Files.createDirectories(dir);
    // Xóa file cũ (bất kỳ extension nào)
    for (String e : List.of("jpg", "png")) {
        Files.deleteIfExists(dir.resolve(speciesId + "." + e));
    }
    Path dest = dir.resolve(speciesId + "." + ext);
    Files.write(dest, file.getBytes());
    return "/uploads/species/" + speciesId + "." + ext;
}
```

### Spring static resource handler
Với `spring.web.resources.static-locations=classpath:/static/,file:./uploads/`, Spring tự động serve `uploads/species/1.jpg` tại URL `/species/1.jpg`. Nhưng ta muốn URL là `/uploads/species/1.jpg` → cần WebMvcConfigurer:

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}
```

SecurityConfig đã có `requestMatchers("/uploads/**").permitAll()` (từ Story 5.2 Task 5.1).

### Frontend upload (FormData)
```ts
const handleImageUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.put<SpeciesResponse>(
    `/api/species/${id}/image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  setImageUrl(res.data.imageUrl)
}
```

### imageUrl resolution
SpeciesResponse.imageUrl từ backend là relative path `/uploads/species/1.jpg`. Frontend cần prepend base URL:
```ts
const imageUrl = species.imageUrl
  ? `http://localhost:8080${species.imageUrl}`
  : '/placeholder-fish.png'
```
Hoặc lấy từ `api.defaults.baseURL`:
```ts
import api from '../services/api'
const imgSrc = species.imageUrl
  ? `${api.defaults.baseURL}${species.imageUrl}`
  : placeholderUrl
```

### Upload chỉ ở edit mode
Species cần có id để tạo filename. Create form không có upload — admin tạo trước, sau đó edit và upload ảnh.

### GlobalExceptionHandler — MaxUploadSizeExceededException
```java
@ExceptionHandler(MaxUploadSizeExceededException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
public ApiError handleMaxUpload(MaxUploadSizeExceededException ex) {
    return new ApiError(400, "BAD_REQUEST", "Kích thước file tối đa là 5MB");
}
```

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend (new/modified):**
- `aquawiki-backend/src/main/java/com/aquawiki/service/ImageStorageService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesService.java` (modified — add updateImageUrl)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (modified — add PUT /image)
- `aquawiki-backend/src/main/java/com/aquawiki/config/WebMvcConfig.java` (new — resource handler)
- `aquawiki-backend/src/main/resources/application.properties` (modified — multipart config)
- `aquawiki-backend/src/test/java/com/aquawiki/service/ImageStorageServiceTest.java` (new)
- `uploads/species/.gitkeep` (new)

**Frontend (new/modified):**
- `aquawiki-frontend/src/pages/admin/SpeciesFormPage.tsx` (modified — add image upload section)
- `aquawiki-frontend/src/components/SpeciesCard.tsx` (modified — imageUrl resolution)
- `aquawiki-frontend/src/pages/SpeciesDetailPage.tsx` (modified — imageUrl resolution)

## Change Log

- 2026-05-15: Story 5.3 created
