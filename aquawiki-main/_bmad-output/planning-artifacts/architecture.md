---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-15'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/aquawiki-functional-spec.md
workflowType: 'architecture'
project_name: 'aquawiki'
user_name: 'NguyenMinhhh'
date: '2026-05-15'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

45 FRs organized across 7 capability areas. Architecturally, these group into 4 backend service domains and 1 computation engine:

| Domain | FRs | Architectural Implication |
|---|---|---|
| Identity & Access | FR1–FR6 | JWT auth + RBAC middleware on all protected routes |
| Species Catalog | FR7–FR12, FR27–FR32, FR36–FR37 | Read-heavy CRUD with search/filter; admin approval state machine |
| Tank Simulation & Compatibility | FR13–FR26 | Stateless computation API; real-time frontend state |
| Personal Data | FR18–FR19, FR38–FR42 | User-owned records with CRUD; Growth phase only |
| Utilities | FR43–FR45 | Lightweight; Growth phase only |

**Non-Functional Requirements:**

| NFR | Architectural Driver |
|---|---|
| Compatibility Engine < 2s | Efficient query strategy for compatibility matrix; avoid N+1 |
| FCP < 3s | Code splitting, lazy loading of admin routes |
| JWT + BCrypt + RBAC | Spring Security filter chain; server-side role validation |
| Graceful Engine failure | Error boundary pattern; never return silent incorrect results |
| Mobile 375px | React responsive layout; TailwindCSS breakpoints |

**Scale & Complexity:**

- Primary domain: Full-stack web (React SPA + Spring Boot REST API + MySQL)
- Complexity level: **Medium**
- No external integrations, no regulatory compliance, no multi-tenancy
- Solo developer — architecture must be lean and avoid over-engineering

### Technical Constraints & Dependencies

- **Fixed tech stack:** ReactJS, TailwindCSS, Java Spring Boot, Spring Security (JWT), MySQL 8 — no negotiation
- **No SSR/pre-rendering** — SPA only, no SEO requirement
- **Session-only Tank Simulator (MVP)** — no backend persistence for simulation state in Phase 1
- **BCrypt cost factor ≥ 10, JWT expiry 24h** — defined in NFRs
- **Image upload** — file type + size validation server-side; no CDN needed at MVP scale
- **Solo developer** — architecture must minimize complexity while maintaining clean separation of concerns

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — JWT validation and RBAC enforcement affect every API endpoint; must be implemented as a consistent filter/middleware layer
2. **Real-time Frontend State** — Tank Simulator recalculates bioload + compatibility on every species/dimension change; state management strategy determines UX responsiveness
3. **Admin Approval Workflow** — Species have a publish state (draft/approved); affects queries throughout the Species Catalog domain
4. **Input Validation** — Server-side validation on all user-submitted data; consistent validation strategy required across all controllers
5. **Error Propagation** — Compatibility Engine failures must surface as explicit error states, not silent incorrect results; error handling contract required

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application: React SPA (frontend) + Spring Boot REST API (backend) + MySQL 8 (database). Both components initialized separately — no monorepo required at this scale.

### Frontend Starter: Vite + React (TypeScript)

**Rationale:** Create React App is deprecated as of 2023. Vite is the current standard for React SPA projects — significantly faster dev server, native ESM, and better build performance.

**Initialization Command:**

```bash
npm create vite@latest aquawiki-frontend -- --template react-ts
cd aquawiki-frontend
npm install
```

**Post-init: Add TailwindCSS v4:**

```bash
npm install tailwindcss @tailwindcss/vite
```

**Architectural Decisions Provided:**

- **Language:** TypeScript (strict mode)
- **Build tooling:** Vite (ESBuild + Rollup)
- **Dev server:** Vite HMR — instant hot reload
- **Testing:** Add Vitest (Vite-native, compatible with React Testing Library)
- **Project structure:** `src/` with `assets/`, `components/` conventions
- **Code organization:** Component-based; extend with `pages/`, `hooks/`, `services/`, `context/` folders

### Backend Starter: Spring Initializr (Spring Boot 3.5.x)

**Rationale:** Spring Boot 4.x has breaking changes and limited ecosystem compatibility. Spring Boot 3.5.14 is the recommended stable branch for new projects requiring Spring Framework 6.

**Initialization:** Via [start.spring.io](https://start.spring.io) or CLI:

```bash
curl -G https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.5.14 \
  -d groupId=com.aquawiki \
  -d artifactId=aquawiki-backend \
  -d name=aquawiki-backend \
  -d packaging=jar \
  -d javaVersion=21 \
  -d dependencies=web,data-jpa,security,mysql,lombok,validation \
  -o aquawiki-backend.zip
```

**Dependencies included from start:**

| Dependency | Purpose |
|---|---|
| Spring Web | REST API controllers |
| Spring Data JPA | ORM + repository pattern |
| Spring Security | JWT filter chain + RBAC |
| MySQL Driver | MySQL 8 connection |
| Lombok | Boilerplate reduction (getters/setters/builders) |
| Spring Validation | `@Valid` annotations for input validation |

**Architectural Decisions Provided:**

- **Language:** Java 21 (LTS)
- **Build:** Maven (`pom.xml`)
- **Project structure:** Standard layered: `controller/`, `service/`, `repository/`, `model/`, `dto/`, `config/`
- **Security:** Spring Security auto-configured; customized for JWT stateless auth
- **ORM:** Hibernate via Spring Data JPA

### Project Structure Overview

```
aquawiki/
├── aquawiki-frontend/          # Vite + React TS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/           # Axios API calls
│   │   └── context/            # Auth context
│   └── vite.config.ts
├── aquawiki-backend/           # Spring Boot 3.5.x
│   └── src/main/java/com/aquawiki/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── model/
│       ├── dto/
│       └── config/             # Security, CORS config
└── docs/
```

> **Note:** Project initialization for both frontend and backend should be the first implementation stories in the sprint plan.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Hybrid Compatibility Engine (Exception Table + Rule Engine)
- JWT stateless auth với `jjwt 0.12.x`
- Global CORS configuration
- Species entity phải có đủ rule engine parameters (ph_min/max, temp_min/max, behavior_tag, max_size_cm)

**Important Decisions (Shape Architecture):**
- Flyway cho schema migration
- Standard REST error envelope via `@ControllerAdvice`
- React Router v7 với lazy-loaded admin routes
- Single Axios instance với auto-attach JWT header

**Deferred Decisions (Post-MVP):**
- Caching (Caffeine/Redis) — thêm nếu Compatibility Engine chậm hơn 2s thực tế
- API versioning — thêm khi có external consumers
- Deployment & CI/CD — ngoài scope, local-only

---

### Data Architecture

**Migration Tool: Flyway**
- SQL-based migration files: `V1__create_species.sql`, `V2__create_compatibility.sql`, v.v.
- Tích hợp qua `spring.flyway.*` properties
- Rationale: SQL thuần, zero learning curve, phù hợp solo developer

**Compatibility Matrix: Hybrid Approach**
- Bảng `species_compatibility` chỉ lưu verified exception pairs:
  ```
  species_compatibility (species_id_a, species_id_b, level, note, verified_by)
  ```
  Normalization rule: `species_id_a = min(id)`, `species_id_b = max(id)` — tránh duplicate A→B và B→A
- Rule Engine (Spring `@Service`) tự tính từ species parameters khi không có exception
- Query flow: check exception table → nếu không có → chạy Rule Engine
- Rationale: pure matrix không scale (N² entries khi thêm species); hybrid giảm admin workload và xử lý được edge cases sinh học

**Species Entity — Required Rule Engine Parameters:**
`ph_min`, `ph_max`, `temp_min`, `temp_max`, `behavior_tag` (enum: PEACEFUL/SEMI_AGGRESSIVE/AGGRESSIVE), `max_size_cm` — bắt buộc nhập khi tạo species mới

**Caching: None (MVP)**
- MySQL index đủ cho < 2s với 5–10 species
- Thêm Spring Cache + Caffeine nếu benchmark thực tế cho thấy cần

---

### Authentication & Security

**JWT Library: `jjwt 0.12.x`**
- Stateless auth, 24h expiry (per NFR)
- Rationale: nhẹ, API rõ ràng, community lớn, phù hợp custom stateless JWT

**Token Storage: localStorage**
- Frontend lưu JWT vào `localStorage`; Axios instance tự attach vào `Authorization: Bearer <token>`
- Rationale: phù hợp SPA portfolio, không cần CSRF config

**CORS: Global `CorsConfigurationSource`**
- Configured trong `SecurityConfig` bean — một điểm duy nhất
- Dev whitelist: `http://localhost:5173`
- Rationale: không bị miss ở từng controller, dễ maintain

---

### API & Communication Patterns

**REST Naming Convention:**
```
GET    /api/species              → list (filter/search via query params)
GET    /api/species/{id}         → detail
POST   /api/species              → create (Admin)
PUT    /api/species/{id}         → update (Admin)
DELETE /api/species/{id}         → delete (Admin)
POST   /api/compatibility/check  → group check (body: list of species IDs)
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users/me
```

**Error Response Format — Standard Envelope:**
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "pH min must be less than pH max",
  "path": "/api/species",
  "timestamp": "2026-05-15T10:30:00Z"
}
```
Implement via `@ControllerAdvice` + `@ExceptionHandler` — một handler class cho tất cả exception types.

**API Versioning: None (MVP)**
- Endpoint prefix: `/api/` (không có `/api/v1/`)
- Rationale: không có external consumers, có thể thêm version prefix sau nếu cần

**API Documentation: None**
- Không dùng SpringDoc/Swagger
- Rationale: giảm dependency, contract đủ rõ từ REST convention

---

### Frontend Architecture

**State Management:**
- `AuthContext` — JWT token, user info, login/logout; persist vào `localStorage`
- Server state (species, compatibility): custom hooks (`useSpecies`, `useCompatibility`) fetch trực tiếp
- Tank Simulator: local `useState` — session-only, không persist
- Không dùng Redux/Zustand/React Query

**Axios Configuration:**
- Single instance trong `src/services/api.ts`
- Interceptor tự attach `Authorization: Bearer <token>` từ `localStorage`
- Interceptor tự redirect về `/login` khi nhận 401

**Routing: React Router v7**
```
/                → Species list (Home)
/species/:id     → Species detail
/simulator       → Tank Simulator
/login           → Login
/register        → Register
/admin/*         → Admin (lazy loaded via React.lazy)
```
Admin routes lazy-load để đáp ứng FCP < 3s NFR.

**Component Organization:**
```
src/
├── components/   # Shared reusable UI
├── pages/        # Route-level components
├── hooks/        # useAuth, useSpecies, useCompatibility...
├── services/     # api.ts + service modules
├── context/      # AuthContext
└── types/        # TypeScript interfaces
```

---

### Infrastructure & Deployment

**Local Development: Docker Compose**
```yaml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: aquawiki
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
```
Frontend: `npm run dev` (port 5173) · Backend: Spring Boot (port 8080) · DB: Docker MySQL (port 3306)

**Deployment: Local only** — ngoài scope MVP. Không có CI/CD, không có prod environment config.

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Docker Compose MySQL up → Flyway migration V1 (species schema)
2. Species entity với đầy đủ rule engine parameters
3. JWT filter chain + RBAC
4. Species CRUD API (Admin)
5. Rule Engine + Exception table + Compatibility API
6. Frontend AuthContext + Axios instance
7. Species list/detail pages
8. Tank Simulator (local state)
9. Admin routes (lazy-loaded)

**Cross-Component Dependencies:**
- Rule Engine phụ thuộc vào Species entity có đầy đủ parameters → Species schema phải complete trước khi build Engine
- Axios interceptor phụ thuộc vào AuthContext token contract → định nghĩa token storage key trước khi viết interceptor
- Admin lazy routes phụ thuộc vào RBAC middleware → Spring Security config phải hoàn thành trước

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (MySQL) — `snake_case`:**
- Tables: plural snake_case — `users`, `species`, `species_compatibility`
- Columns: snake_case — `species_id`, `ph_min`, `ph_max`, `behavior_tag`, `created_at`
- Foreign keys: `{table_singular}_id` — `user_id`, `species_id`
- Indexes: `idx_{table}_{column}` — `idx_species_name`, `idx_compatibility_species_a`

**Java (Backend):**
- Classes: PascalCase — `SpeciesService`, `CompatibilityController`
- Fields/methods: camelCase — `phMin`, `behaviorTag`, `findBySpeciesId()`
- Hibernate `SpringPhysicalNamingStrategy` auto-maps `phMin` → `ph_min`

**JSON (API Contract) — `camelCase`:**
- Jackson default, nhất quán Java → JSON → TypeScript
- Example: `{ "speciesId": 1, "phMin": 6.5, "behaviorTag": "PEACEFUL" }`

**TypeScript/React:**
- Component files: PascalCase — `SpeciesCard.tsx`, `TankSimulator.tsx`
- Non-component files: camelCase — `useSpecies.ts`, `api.ts`, `speciesService.ts`
- Interfaces/Types: PascalCase — `Species`, `CompatibilityResult`, `AuthUser`

---

### API Response Format Patterns

**Single item endpoints:** Direct return (no wrapper)
```json
GET /api/species/1 → { "id": 1, "name": "Betta splendens", "phMin": 6.0, ... }
```

**List endpoints without pagination:** Direct array
```json
GET /api/species → [ {...}, {...} ]
```

**List endpoints with pagination:** Wrapped with metadata
```json
GET /api/species?page=0&size=20 → {
  "data": [ {...}, {...} ],
  "total": 50,
  "page": 0,
  "size": 20
}
```

**Error response:** Standard envelope (defined in Core Architectural Decisions)

---

### Date/Time Format Pattern

**Standard: ISO 8601 UTC strings** trên toàn bộ API
```json
"createdAt": "2026-05-15T10:30:00Z"
```
- Backend: `LocalDateTime` + Jackson `@JsonFormat` serialize thành ISO string
- Frontend: `new Date(isoString)` để parse, không tự format raw timestamp

---

### Frontend State Pattern

**Loading/Error state naming chuẩn trong mọi custom hook:**
```ts
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```
- Luôn dùng `isLoading` (không phải `loading` hay `isFetching`)
- `error` là `string | null` — human-readable message, hiển thị trực tiếp trong UI

---

### Test File Location

- **Backend:** `src/test/java/com/aquawiki/` mirroring `src/main/java/` (Maven standard)
  - Example: `src/test/java/com/aquawiki/service/CompatibilityServiceTest.java`
- **Frontend:** Co-located cạnh file gốc
  - Example: `src/hooks/useSpecies.test.ts`, `src/pages/SpeciesDetail.test.tsx`

---

### Enforcement — All Agents MUST:

1. Use `snake_case` for all database tables and columns
2. Use `camelCase` for all JSON fields in API requests and responses
3. Use `isLoading` / `error` naming in React hooks — no deviations
4. Return ISO 8601 UTC strings for all date/time fields
5. Never wrap single-item API responses — direct return only
6. PascalCase for React component files, camelCase for all other `.ts` files

## Project Structure & Boundaries

### Complete Project Directory Structure

**Backend — `aquawiki-backend/`**

```
aquawiki-backend/
├── pom.xml
├── docker-compose.yml
├── .gitignore
├── src/
│   ├── main/
│   │   ├── java/com/aquawiki/
│   │   │   ├── AquawikiApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java              # JWT filter chain, CORS, RBAC
│   │   │   │   ├── JwtTokenProvider.java            # jjwt 0.12.x create/validate
│   │   │   │   └── JwtAuthenticationFilter.java     # OncePerRequestFilter
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java              # POST /api/auth/*
│   │   │   │   ├── SpeciesController.java           # GET/POST/PUT/DELETE /api/species
│   │   │   │   ├── CompatibilityController.java     # POST /api/compatibility/check
│   │   │   │   └── UserController.java              # GET /api/users/me
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── SpeciesService.java
│   │   │   │   ├── CompatibilityService.java        # orchestrates: exception table → Rule Engine
│   │   │   │   ├── CompatibilityRuleEngine.java     # pure computation @Service (no DB)
│   │   │   │   └── UserService.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── SpeciesRepository.java
│   │   │   │   └── SpeciesCompatibilityRepository.java
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Species.java                     # includes ph_min/max, temp, behavior_tag, max_size_cm
│   │   │   │   ├── SpeciesCompatibility.java        # exception table entity
│   │   │   │   └── enums/
│   │   │   │       ├── Role.java                    # USER, ADMIN
│   │   │   │       ├── BehaviorTag.java             # PEACEFUL, SEMI_AGGRESSIVE, AGGRESSIVE
│   │   │   │       ├── CompatibilityLevel.java      # COMPATIBLE, CAUTION, INCOMPATIBLE
│   │   │   │       └── SpeciesStatus.java           # DRAFT, APPROVED
│   │   │   ├── dto/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   └── AuthResponse.java            # token + user info
│   │   │   │   ├── species/
│   │   │   │   │   ├── SpeciesRequest.java
│   │   │   │   │   ├── SpeciesResponse.java
│   │   │   │   │   └── SpeciesPageResponse.java     # data + total + page + size
│   │   │   │   └── compatibility/
│   │   │   │       ├── CompatibilityCheckRequest.java
│   │   │   │       └── CompatibilityCheckResponse.java
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java      # @ControllerAdvice
│   │   │       ├── ResourceNotFoundException.java
│   │   │       └── ErrorResponse.java               # standard error envelope
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── db/migration/
│   │           ├── V1__create_users.sql
│   │           ├── V2__create_species.sql
│   │           ├── V3__create_species_compatibility.sql
│   │           └── V4__seed_species_data.sql
│   └── test/
│       └── java/com/aquawiki/
│           ├── service/
│           │   ├── CompatibilityRuleEngineTest.java  # unit test rule engine (most critical)
│           │   └── SpeciesServiceTest.java
│           └── controller/
│               └── SpeciesControllerTest.java
```

**Frontend — `aquawiki-frontend/`**

```
aquawiki-frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── .env.development                             # VITE_API_URL=http://localhost:8080
├── .gitignore
└── src/
    ├── main.tsx                                 # entry point
    ├── App.tsx                                  # React Router setup
    ├── index.css                                # TailwindCSS import
    ├── components/
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── ErrorMessage.tsx
    │   │   └── Navbar.tsx
    │   ├── species/
    │   │   ├── SpeciesCard.tsx
    │   │   ├── SpeciesFilter.tsx
    │   │   └── SpeciesSearch.tsx
    │   └── simulator/
    │       ├── TankCanvas.tsx                   # 2D rectangle + species icons + colored border
    │       ├── SpeciesSelector.tsx
    │       ├── BioloadIndicator.tsx
    │       └── CompatibilityWarning.tsx
    ├── pages/
    │   ├── HomePage.tsx                         # /
    │   ├── SpeciesDetailPage.tsx                # /species/:id
    │   ├── SimulatorPage.tsx                    # /simulator
    │   ├── LoginPage.tsx                        # /login
    │   ├── RegisterPage.tsx                     # /register
    │   └── admin/                               # lazy loaded via React.lazy
    │       ├── AdminDashboardPage.tsx           # /admin
    │       ├── SpeciesManagePage.tsx            # /admin/species
    │       └── SpeciesFormPage.tsx              # /admin/species/new, /admin/species/:id/edit
    ├── hooks/
    │   ├── useAuth.ts                           # reads AuthContext
    │   ├── useSpecies.ts                        # fetch species list + filters + pagination
    │   ├── useSpeciesDetail.ts                  # fetch single species by id
    │   └── useCompatibility.ts                  # POST /api/compatibility/check
    ├── services/
    │   ├── api.ts                               # Axios instance + JWT interceptor + 401 redirect
    │   ├── authService.ts                       # register, login, logout
    │   └── speciesService.ts                    # CRUD + image upload
    ├── context/
    │   └── AuthContext.tsx                      # JWT token, user info, login/logout
    └── types/
        ├── species.ts                           # Species, BehaviorTag, CompatibilityLevel, SpeciesStatus
        ├── auth.ts                              # AuthUser, LoginRequest, RegisterRequest, AuthResponse
        └── compatibility.ts                    # CompatibilityCheckRequest, CompatibilityCheckResponse
```

---

### Architectural Boundaries

**API Boundary:**
- Tất cả requests từ frontend đi qua Axios instance (`api.ts`) → `http://localhost:8080/api/*`
- JWT filter validate token trước khi request chạm đến Controller
- `@PreAuthorize("hasRole('ADMIN')")` bảo vệ các endpoint write của species

**Data Flow — Compatibility Check:**
```
SimulatorPage
  → useCompatibility hook
  → POST /api/compatibility/check [body: speciesIds]
  → CompatibilityController
  → CompatibilityService.check(ids)
      1. Load Species entities by ids
      2. For each pair: query SpeciesCompatibilityRepository
         - If exception found → use exception result
         - If not found → CompatibilityRuleEngine.evaluate(speciesA, speciesB)
      3. Aggregate pair results → group result
  → CompatibilityCheckResponse → frontend
```

---

### Requirements to Structure Mapping

| FR Domain | Backend Files | Frontend Files |
|---|---|---|
| Identity & Access (FR1–6) | `AuthController`, `AuthService`, `SecurityConfig` | `AuthContext`, `authService.ts`, `LoginPage`, `RegisterPage` |
| Species Catalog (FR7–12, 27–32) | `SpeciesController`, `SpeciesService` | `HomePage`, `SpeciesDetailPage`, `useSpecies`, `useSpeciesDetail` |
| Compatibility Engine (FR13–20) | `CompatibilityController`, `CompatibilityService`, `CompatibilityRuleEngine` | `useCompatibility`, `CompatibilityWarning` |
| Tank Simulator (FR21–26) | — (session-only, no backend) | `SimulatorPage`, `TankCanvas`, `BioloadIndicator`, `SpeciesSelector` |
| Admin Panel (FR36–42) | `SpeciesController` write endpoints | `admin/` pages (lazy loaded) |

**Cross-Cutting Concerns:**
- Error handling: `GlobalExceptionHandler.java` (backend) + `ErrorMessage.tsx` + Axios interceptor (frontend)
- Auth guard: `JwtAuthenticationFilter.java` (backend) + `AuthContext` + route protection (frontend)
- Species status workflow: `SpeciesStatus` enum flows through `SpeciesService` → `SpeciesController` → `SpeciesFormPage`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- React TS + Vite + TailwindCSS v4 + React Router v7: tương thích hoàn toàn
- Spring Boot 3.5.14 + Java 21 + jjwt 0.12.x + Spring Data JPA + Flyway: tương thích hoàn toàn
- MySQL 8 + Hibernate `SpringPhysicalNamingStrategy`: auto-map `phMin` → `ph_min` không cần config thêm

**Pattern Consistency:**
- `snake_case` DB ↔ `camelCase` JSON via Hibernate naming strategy: nhất quán không cần manual mapping
- `camelCase` JSON ↔ `camelCase` TypeScript: zero conversion across API boundary
- `isLoading`/`error` hook pattern áp dụng nhất quán trên mọi custom hook

**Structure Alignment:**
- `config/` chứa đủ SecurityConfig + JwtTokenProvider + JwtAuthenticationFilter
- `exception/` có GlobalExceptionHandler cover toàn bộ error envelope
- `dto/` phân theo domain (auth/, species/, compatibility/)
- Frontend `types/` mirror backend DTO structure

---

### Requirements Coverage Validation ✅

**Functional Requirements:**

| FR Domain | Architectural Support | Status |
|---|---|---|
| FR1–6: Auth | `AuthController`, `AuthService`, `SecurityConfig`, `AuthContext` | ✅ |
| FR7–12: Species Catalog | `SpeciesController`, `SpeciesService`, `SpeciesRepository` | ✅ |
| FR13–20: Compatibility Engine | `CompatibilityService`, `CompatibilityRuleEngine`, exception table | ✅ |
| FR21–26: Tank Simulator | `SimulatorPage`, `TankCanvas`, local `useState` | ✅ |
| FR27–32: Species search/filter | GET `/api/species?query params`, `useSpecies` hook | ✅ |
| FR36–37: Admin approval workflow | `SpeciesStatus` enum, `SpeciesService`, `SpeciesFormPage` | ✅ |
| FR38–42: Personal data | Deferred to Growth phase | ✅ scoped |
| FR43–45: Utilities | Deferred to Growth phase | ✅ scoped |

**Non-Functional Requirements:**
- Compatibility Engine < 2s: Hybrid approach (exception table DB hit + in-memory Rule Engine) tránh N+1 hoàn toàn ✅
- FCP < 3s: Admin routes lazy-loaded via `React.lazy` ✅
- JWT + BCrypt + RBAC: `SecurityConfig`, `JwtTokenProvider`, `@PreAuthorize("hasRole('ADMIN')")` ✅
- Graceful Engine failure: `GlobalExceptionHandler` + error envelope — engine failure → 500 với message rõ ràng, không silent ✅
- Mobile 375px: TailwindCSS breakpoints ✅

---

### Gap Analysis Results

**Critical Gaps: Không có.**

**Important — Image Upload chưa fully specified:**
- PRD (FR11): Admin upload ảnh loài cá; validation file type + size server-side
- Quyết định: `MultipartFile` → lưu vào `uploads/species/` trên local filesystem, serve qua Spring static resource handler
- Không blocking MVP implementation; cần specify khi implement `SpeciesController` POST endpoint

**Minor:**
- BCrypt cost factor ≥ 10: set trong `application.properties` (`spring.security.bcrypt.strength=10`) — implementation detail

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium, solo developer)
- [x] Technical constraints identified (fixed stack, session-only simulator)
- [x] Cross-cutting concerns mapped (auth, validation, error propagation)

**Architectural Decisions**
- [x] Critical decisions documented with versions (jjwt 0.12.x, Spring Boot 3.5.14, Java 21, Flyway)
- [x] Technology stack fully specified
- [x] Integration patterns defined (Axios instance, JWT filter chain)
- [x] Performance considerations addressed (Hybrid engine, lazy loading)

**Implementation Patterns**
- [x] Naming conventions established (snake_case DB, camelCase JSON/TS, PascalCase components)
- [x] Structure patterns defined (test co-location, DTO/service/controller layers)
- [x] Communication patterns specified (error envelope, pagination wrapper)
- [x] Process patterns documented (isLoading/error hook, @ControllerAdvice)

**Project Structure**
- [x] Complete directory structure defined (all files named)
- [x] Component boundaries established (Rule Engine isolated, Admin lazy-loaded)
- [x] Integration points mapped (Compatibility data flow documented)
- [x] Requirements to structure mapping complete (FR→File table)

---

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- Hybrid Compatibility Engine giải quyết scalability problem một cách elegant (exception table + Rule Engine)
- Stack lean và nhất quán — không có unnecessary abstractions
- FR→File mapping đủ cụ thể để AI agent implement không cần guessing
- Implementation sequence rõ ràng từ Docker → Flyway → Entity → JWT → API → Frontend

**Areas for Future Enhancement (Post-MVP):**
- Image upload → CDN (Cloudinary) khi cần scale
- Caching layer (Spring Cache + Caffeine) nếu Compatibility Engine cần optimize
- API versioning khi có external consumers
- Deployment pipeline khi cần demo online

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries defined in Step 6
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
# 1. Backend init
curl -G https://start.spring.io/starter.zip \
  -d type=maven-project -d language=java \
  -d bootVersion=3.5.14 -d javaVersion=21 \
  -d groupId=com.aquawiki -d artifactId=aquawiki-backend \
  -d dependencies=web,data-jpa,security,mysql,lombok,validation \
  -o aquawiki-backend.zip

# 2. Frontend init
npm create vite@latest aquawiki-frontend -- --template react-ts
cd aquawiki-frontend && npm install
npm install tailwindcss @tailwindcss/vite

# 3. Start MySQL
docker-compose up -d

# 4. First Flyway migrations: V1__create_users.sql → V2__create_species.sql → V3__create_species_compatibility.sql → V4__seed_species_data.sql
```

---

## Course Correction 2026-06-24 — New Architecture Decisions (Epics 6 & 7)

> Source: `sprint-change-proposal-2026-06-24.md` + `research/technical-ai-fish-species-identification-aquawiki-research-2026-06-24.md`. Adds two epics: Personal Tanks & Water Change Reminders (Epic 6) and AI Fish Identification (Epic 7).
>
> **Migration numbering correction:** existing migrations occupy V1–V6 (V6 = seed_admin_user). New migrations are **V7** and **V8** (NOT V5/V6 as the proposal originally said).

### AR11 — Tank Persistence (Epic 6)

- **V7__create_tanks.sql** — `tanks` table: `id`, `user_id` (FK → users, ON DELETE CASCADE), `name`, `length_cm`, `width_cm`, `height_cm`, `volume_liters` (DECIMAL), `water_change_interval_days` (INT, nullable), `last_water_change_date` (DATE, nullable), `created_at`, `updated_at`. Index on `user_id`.
- **V8__create_tank_maintenance_log.sql** — `tank_maintenance_log` table: `id`, `tank_id` (FK → tanks, ON DELETE CASCADE), `event_type` ENUM('WATER_CHANGE','SPECIES_ADDED','TREATMENT','NOTE'), `event_date` DATE, `note` VARCHAR, `created_at`.
- **Entities:** `Tank`, `TankMaintenanceLog` (+ `MaintenanceEventType` enum), Lombok `@Getter/@Setter/@NoArgsConstructor`, mirroring `User`/`Species` conventions. `volume_liters` computed server-side as `length×width×height / 1000` (same formula as the simulator).
- **Ownership:** every tank operation is scoped to the authenticated user (principal email → `User`). Cross-user access → 403, matching the existing flag/admin ownership pattern.

### AR12 — Water Change Reminder via Compute-on-Read (Epic 6)

- **No scheduler.** `next_due_date = last_water_change_date + water_change_interval_days`, computed at request time. Status: `OK` (next_due in future / no schedule), `DUE` (next_due == today), `OVERDUE` (next_due < today).
- **Endpoints:**
  - `GET /api/tanks`, `POST /api/tanks`, `GET/PUT/DELETE /api/tanks/{id}` — CRUD, user-scoped.
  - `GET /api/reminders` — tanks with `next_due <= today` (DUE/OVERDUE), computed on read.
  - `POST /api/tanks/{id}/water-change` — appends a `WATER_CHANGE` log, sets `last_water_change_date = today`, recomputes next due.
- **Rationale:** in-app-only channel (owner decision) + solo-dev simplicity. Keeps the fixed stack — no Quartz/@Scheduled/message queue.

### AR13 — AI Fish Identification Provider Abstraction (Epic 7)

- **Provider decision (research-confirmed): Fishial.AI** — free, fish-specialized REST API. Feature scoped to **fish only**. Claude vision (Spring AI) documented as an optional paid future augmentation behind the same interface.
- **`SpeciesRecognitionService` interface:** `List<SpeciesMatch> identify(byte[] image, String mimeType)` → `SpeciesMatch(Long speciesId, String commonName, String scientificName, double confidence)`. Default impl `FishialRecognitionService`.
- **Endpoint:** `POST /api/identify` — `multipart/form-data` single image, JWT-required (authenticated users only, FR50). Reuses `ImageStorageService`-style MIME/extension validation (AR10 / NFR11). Returns ranked candidates resolvable to `species.id` + a `noMatch` flag; provider failure → 502/503 explicit error (NFR17). Result links to species detail (FR51).
- **Provider mapping:** Fishial returns fish by scientific name + a per-match score → map scientific_name to AquaWiki `species.id`, adapt score → `confidence` (0–1). Non-fish photos → empty list → `noMatch: true`.
- **Config:** Fishial API key + base URL from environment (`application.properties` placeholders), never committed.
- **Backend packages:** new `tank/` (controller/service/repo/model/dto split as existing) and identification classes following the flat package convention already in use (`controller/`, `service/`, `dto/`, `model/`).

### Security Additions

- `SecurityConfig`: `/api/tanks/**`, `/api/reminders`, `/api/identify` require authentication (covered by `anyRequest().authenticated()`; no public GET added). No new public endpoints.

### Frontend Additions

- Routes (protected): `/tanks` (My Tanks list + reminder banners), `/tanks/new`, `/tanks/:id/edit`, `/identify` (upload + results). Reuse `api`, `AuthContext`, `ProtectedRoute`, Tailwind tokens, and the simulator's volume formula.
- Navbar links to "Bể của tôi" and "Nhận diện cá".
