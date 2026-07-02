---
story_key: 2-1-species-database-schema
epic: 2
story: 1
status: done
created: 2026-05-15
completed: 2026-05-15
---

# Story 2.1: Species Database Schema

**As a** developer,
**I want** the species database table created with all required fields including rule engine parameters,
**So that** species data can be stored and the Compatibility Engine can function correctly in later epics.

## Acceptance Criteria

**AC1 — Flyway migration V3__create_species_flags.sql (species table via V2):**
**Given** Flyway migration `V2__create_species.sql` runs on application startup
**When** the migration completes
**Then** the `species` table exists with columns: id, common_name, scientific_name, image_url, ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag (PEACEFUL/SEMI_AGGRESSIVE/AGGRESSIVE), care_difficulty (EASY/MEDIUM/HARD), description, bioload_factor, status (DRAFT/APPROVED), created_at, updated_at

**AC2 — Hibernate entity mapping:**
**Given** a `Species` JPA entity mapped to the `species` table
**When** the application starts
**Then** Hibernate validates the entity mapping with no schema errors

**AC3 — Required field validation:**
**Given** ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag are required fields on the Species entity
**When** a species record is created without any of these fields
**Then** Spring Validation returns HTTP 400 — these fields cannot be null

## Tasks/Subtasks

- [x] **Task 1: Flyway migration**
  - [x] 1.1 Create `V2__create_species.sql` — species table with all 15 columns + indexes
  - [x] 1.2 Insert 10 seed species (loài cá phổ biến tại Việt Nam) with status APPROVED

- [x] **Task 2: JPA entity + enums**
  - [x] 2.1 Create `BehaviorTag` enum: PEACEFUL, SEMI_AGGRESSIVE, AGGRESSIVE
  - [x] 2.2 Create `CareDifficulty` enum: EASY, MEDIUM, HARD
  - [x] 2.3 Create `SpeciesStatus` enum: DRAFT, APPROVED
  - [x] 2.4 Create `Species` entity — all fields with proper annotations, `@PrePersist`/`@PreUpdate`

- [x] **Task 3: Repository**
  - [x] 3.1 Create `SpeciesRepository extends JpaRepository, JpaSpecificationExecutor`

- [x] **Task 4: Tests**
  - [x] 4.1 `SpeciesEntityTest` — save valid species, missing required fields throws exception, default status DRAFT, default bioloadFactor = 1.0

## Dev Notes

### Migration file
`V2__create_species.sql` — tên file bắt đầu từ V2 vì V1 đã được dùng cho users table.
Species table dùng `DECIMAL(4,2)` cho pH, `DECIMAL(4,1)` cho temperature, `DECIMAL(5,1)` cho size.
Seed data 10 loài: Betta, Neon Tetra, Vàng Ryukin, Guppy, Molly, Platy, Otocinclus, Corydoras, Cichlid Phi Châu, Pleco Hoàng Đế.

### JpaSpecificationExecutor
`SpeciesRepository` extends `JpaSpecificationExecutor<Species>` để support dynamic filtering trong Stories 2.2/2.3.

### @PrePersist / @PreUpdate
Entity dùng `@PrePersist` và `@PreUpdate` thay vì `@CreationTimestamp`/`@UpdateTimestamp` để tránh phụ thuộc Hibernate annotation.

## Dev Agent Record

### Implementation Plan
V2 migration → enums → Species entity → SpeciesRepository → SpeciesEntityTest

### Completion Notes
✅ AC1: `V2__create_species.sql` chạy khi app start, tạo đúng schema + 10 seed species APPROVED
✅ AC2: `Species.java` entity pass Hibernate validation — `spring.jpa.hibernate.ddl-auto=validate`
✅ AC3: `@NotNull` trên ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag — save thiếu field → exception

**Tests: 4/4 pass** (SpeciesEntityTest)

## File List

**Backend:**
- `aquawiki-backend/src/main/resources/db/migration/V2__create_species.sql` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/BehaviorTag.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/CareDifficulty.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/SpeciesStatus.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/Species.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesRepository.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/model/SpeciesEntityTest.java` (new)

## Change Log

- 2026-05-15: Story 2.1 implemented — Species schema complete
  - V2 migration: species table + 10 seed APPROVED species
  - Enums: BehaviorTag, CareDifficulty, SpeciesStatus
  - Species JPA entity với full field mapping
  - SpeciesRepository với JpaSpecificationExecutor
  - Tests: 4/4 pass
