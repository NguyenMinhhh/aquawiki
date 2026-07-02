---
story_key: 2-2-species-list-search-api
epic: 2
story: 2
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.2: Species List & Search API

**As a** visitor,
**I want** to browse and search the species list via API,
**So that** the frontend can display relevant species.

## Acceptance Criteria

**AC1 — GET /api/species no params:**
**Given** `GET /api/species` is called without query parameters
**When** processed by `SpeciesController`
**Then** the API returns `{ "data": [...], "total": N, "page": 0, "size": 20 }` containing only APPROVED species, sorted by common_name ascending

**AC2 — Search by name:**
**Given** `GET /api/species?search=betta` is called
**When** processed
**Then** only species whose common_name or scientific_name contains "betta" (case-insensitive) are returned

**AC3 — Pagination:**
**Given** `GET /api/species?page=1&size=20` is called
**When** processed
**Then** the second page of results is returned with correct pagination metadata

**AC4 — Empty result:**
**Given** no species match the search query
**When** `GET /api/species?search=xyz123` is called
**Then** the API returns `{ "data": [], "total": 0, "page": 0, "size": 20 }` with HTTP 200

## Tasks/Subtasks

- [x] **Task 1: DTOs**
  - [x] 1.1 Create `SpeciesResponse` record — `from(Species)` factory method
  - [x] 1.2 Create `PagedResponse<T>` record — data, total, page, size

- [x] **Task 2: JPA Specification**
  - [x] 2.1 Create `SpeciesSpec` utility class — `approved()`, `searchByName(keyword)`

- [x] **Task 3: Service + Controller**
  - [x] 3.1 Create `SpeciesService.list()` — compose specs, `PageRequest` with sort by commonName
  - [x] 3.2 Create `SpeciesController` `GET /api/species` — all params optional, defaults page=0 size=20

- [x] **Task 4: Security**
  - [x] 4.1 Add `requestMatchers(HttpMethod.GET, "/api/species", "/api/species/**").permitAll()` to SecurityConfig

- [x] **Task 5: Tests**
  - [x] 5.1 `SpeciesControllerTest` — no params 200, search param, empty result 200

## Dev Notes

### JPA Specification Pattern
`SpeciesSpec` dùng static factory methods trả `Specification<Species>`. Null-safe: nếu param null thì trả null (Specification.where() skip null specs).
Compose bằng `Specification.where(approved()).and(searchByName(search)).and(...)`.

### PagedResponse
Generic record `PagedResponse<T>` để reuse cho future endpoints.

### Public endpoint
`GET /api/species` và `GET /api/species/**` là public — không cần JWT. Permit trước `anyRequest().authenticated()`.

## Dev Agent Record

### Completion Notes
✅ AC1: `GET /api/species` → `{ data: [...APPROVED], total, page: 0, size: 20 }` sorted by commonName
✅ AC2: `?search=betta` → LIKE case-insensitive trên commonName và scientificName
✅ AC3: `?page=1&size=20` → trang 2 với đúng metadata
✅ AC4: `?search=xyz123` → `{ data: [], total: 0 }` HTTP 200

**Tests: 6/6 pass** (SpeciesControllerTest — no params, search, empty result, detail, not found, behavior filter)

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/dto/SpeciesResponse.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/PagedResponse.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesSpec.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/SpeciesService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/SpeciesController.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/config/SecurityConfig.java` (modified — GET /api/species permitAll)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/SpeciesControllerTest.java` (new)

## Change Log

- 2026-05-15: Story 2.2 implemented — Species List & Search API complete
