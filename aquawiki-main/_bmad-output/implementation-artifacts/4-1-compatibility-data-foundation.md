---
story_key: 4-1-compatibility-data-foundation
epic: 4
story: 1
status: done
created: 2026-05-15
completed:
---

# Story 4.1: Compatibility Data Foundation

**As a** developer,
**I want** the compatibility exception table created and seeded with initial data,
**So that** the Compatibility Engine has verified exception pairs to work with.

## Acceptance Criteria

**AC1 — species_compatibility table:**
**Given** Flyway migration `V4__create_species_compatibility.sql` runs on startup
**When** the migration completes
**Then** the `species_compatibility` table exists with columns: id, species_id_a (FK), species_id_b (FK), level (ENUM: COMPATIBLE/CAUTION/INCOMPATIBLE), note (TEXT), verified_by (VARCHAR), created_at — với constraint `species_id_a < species_id_b`

**AC2 — Seed exception pairs:**
**Given** Flyway migration `V5__seed_compatibility.sql` runs after V4
**When** the migration completes
**Then** ít nhất 3 verified exception pairs tồn tại trong `species_compatibility`:
- Cá Betta + Cá Guppy = INCOMPATIBLE
- Cá Betta + Cá Neon Tetra = CAUTION
- Cá Betta + Cá Corydoras = COMPATIBLE

**AC3 — JPA entity + repository:**
**Given** `SpeciesCompatibility` entity được map đến bảng
**When** application starts
**Then** Hibernate validates mapping không có schema errors và `SpeciesCompatibilityRepository` có thể query theo species_id_a, species_id_b

**AC4 — Query by pair:**
**Given** SpeciesCompatibilityRepository
**When** query `findBySpeciesIdAAndSpeciesIdB(idA, idB)` hoặc ngược lại
**Then** trả về Optional<SpeciesCompatibility> đúng

## Tasks/Subtasks

- [ ] **Task 1: Flyway migrations**
  - [ ] 1.1 Create `V4__create_species_compatibility.sql` — bảng với FK ON DELETE CASCADE đến species, CHECK `species_id_a < species_id_b`
  - [ ] 1.2 Create `V5__seed_compatibility.sql` — INSERT 3+ exception pairs theo species id đã seed từ V2

- [ ] **Task 2: Backend entity + repository**
  - [ ] 2.1 Create `CompatibilityLevel` enum: COMPATIBLE, CAUTION, INCOMPATIBLE
  - [ ] 2.2 Create `SpeciesCompatibility` entity — ManyToOne speciesA, speciesB; level; note; verifiedBy; createdAt
  - [ ] 2.3 Create `SpeciesCompatibilityRepository` — extends JpaRepository, thêm `findBySpeciesIdAAndSpeciesIdB()` + `findBySpeciesIdBAndSpeciesIdA()`

- [ ] **Task 3: Tests**
  - [ ] 3.1 `SpeciesCompatibilityRepositoryTest` — save pair, query by (idA, idB), query reversed (idB, idA)

## Dev Notes

### Migration numbering
V1=users, V2=species+seed, V3=species_flags → V4=species_compatibility, V5=seed_compatibility

### species_id_a < species_id_b constraint
Đảm bảo không có duplicate pair theo thứ tự ngược lại. Khi service lookup cần normalize:
```java
long idA = Math.min(id1, id2);
long idB = Math.max(id1, id2);
```

### V4 migration
```sql
CREATE TABLE species_compatibility (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    species_id_a BIGINT NOT NULL,
    species_id_b BIGINT NOT NULL,
    level ENUM('COMPATIBLE', 'CAUTION', 'INCOMPATIBLE') NOT NULL,
    note TEXT,
    verified_by VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compat_a FOREIGN KEY (species_id_a) REFERENCES species(id) ON DELETE CASCADE,
    CONSTRAINT fk_compat_b FOREIGN KEY (species_id_b) REFERENCES species(id) ON DELETE CASCADE,
    CONSTRAINT chk_order CHECK (species_id_a < species_id_b),
    CONSTRAINT uq_pair UNIQUE (species_id_a, species_id_b)
);
```

### V5 seed — species ids từ V2
Cần biết id của Betta, Guppy, Neon Tetra, Corydoras từ seed V2 để insert đúng.
Seed V2 insert theo thứ tự: Betta=1, Cichlid=2, Corydoras=3, Guppy=4, Molly=5, Neon Tetra=6, Otocinclus=7, Platy=8, Pleco=9, Ryukin=10 (AUTO_INCREMENT từ 1).

### Repository
```java
Optional<SpeciesCompatibility> findBySpeciesIdAAndSpeciesIdB(Long idA, Long idB);
```
Service phải call cả hai chiều hoặc normalize trước khi query.

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend:**
- `aquawiki-backend/src/main/resources/db/migration/V4__create_species_compatibility.sql` (new)
- `aquawiki-backend/src/main/resources/db/migration/V5__seed_compatibility.sql` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/CompatibilityLevel.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/SpeciesCompatibility.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/SpeciesCompatibilityRepository.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/repository/SpeciesCompatibilityRepositoryTest.java` (new)

## Change Log

- 2026-05-15: Story 4.1 created
