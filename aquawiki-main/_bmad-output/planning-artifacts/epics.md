---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: 'complete'
completedAt: '2026-05-15'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# AquaWiki - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AquaWiki, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**MVP Scope:**
- FR1: Unregistered visitors can create an account using an email address and password
- FR2: Registered users can authenticate using email and password and receive a session token
- FR3: Authenticated users can terminate their current session
- FR6: The system assigns one of two roles to each user (USER or ADMIN) and enforces role-appropriate access throughout the application
- FR7: Visitors can browse a paginated list of aquatic species spanning fish, shrimp, snails, and aquatic plants
- FR8: Visitors can search species by common name, scientific name, or keyword
- FR9: Visitors can filter the species list by behavioral category (aggressive/peaceful), body size, pH range, temperature range, and care difficulty level
- FR10: Visitors can view a full species detail page including representative image, scientific name, natural habitat parameters (pH, temperature, hardness), feeding behavior, adult size, and social behavior traits
- FR13: Users can input tank dimensions (length × width × height in cm) and the system calculates and displays total volume in liters
- FR14: Users can add aquatic species to a simulated tank with a specified quantity
- FR15: Users can remove species from the simulated tank
- FR16: The system recalculates bioload percentage in real time whenever species, quantities, or tank dimensions change — without losing the current species selection state
- FR17: The system displays a 2D visual representation of the simulated tank showing species presence and quantity, with an overall status indicator (green / yellow / red) based on compatibility and bioload state
- FR20: The system evaluates compatibility between every pair of species in the current simulation and identifies conflicts
- FR21: The system evaluates compatibility across all species in the simulation simultaneously and returns a consolidated conflict list
- FR22: The system displays compatibility warnings in real time as species are added to or removed from the simulation
- FR23: Compatibility warnings are categorized by severity: red (critical), yellow (caution), green (compatible)
- FR24: The system detects and flags parameter conflicts between species, including temperature range incompatibility and pH range incompatibility
- FR25: Each compatibility warning includes a brief plain-language explanation of the conflict reason
- FR27: Administrators can create new species records, including all habitat parameters, behavioral traits, care difficulty rating, and species categorization
- FR28: Administrators can edit existing species records
- FR29: Administrators can delete species records
- FR30: Administrators can upload and replace the representative image for a species
- FR31: New species records require administrator review and approval before becoming visible to non-admin users
- FR32: Administrators can manage compatibility matrix entries — adding, editing, and removing species pair compatibility exception rules
- FR36: Authenticated users can flag a species record as potentially inaccurate, creating a review task for administrators
- FR37: Administrators can review flagged species records, assess reported inaccuracies, and update or dismiss the flag

**Growth Scope (deferred):**
- FR4: Authenticated users can request a password reset link via their registered email address
- FR5: Authenticated users can update their profile information (display name, avatar image, password)
- FR11: Authenticated users can bookmark species to a personal favorites list
- FR12: Authenticated users can select 2–3 species to view a side-by-side parameter comparison table
- FR18: Authenticated users can save a named tank simulation configuration for later retrieval
- FR19: Authenticated users can load a previously saved tank simulation configuration into the simulator
- FR26: The system suggests species compatible with the current tank composition
- FR33: Administrators can manage aquarium equipment records
- FR34: Administrators can view user account list and deactivate/reactivate accounts
- FR35: Administrators can view system-wide statistics
- FR38–42: Personal tank management (named tanks, dashboard, logs)
- FR43–45: Utility tools (unit converter, global search, notifications)

### NonFunctional Requirements

**Performance:**
- NFR1: First Contentful Paint (4G) < 3 seconds
- NFR2: Time to Interactive — Tank Simulator page < 4 seconds
- NFR3: Compatibility Engine API response (5–10 species) < 2 seconds
- NFR4: Lighthouse Performance Score ≥ 75
- NFR5: Species list API response (with filters) < 1 second

**Security:**
- NFR6: Password storage — BCrypt, minimum cost factor 10
- NFR7: Session token — JWT, stateless, 24-hour expiry
- NFR8: Token transmission — HTTPS only
- NFR9: ADMIN role validated server-side on every protected endpoint
- NFR10: Server-side input validation; SQL injection and XSS sanitized at API boundary
- NFR11: Image upload — MIME type validation (images only); maximum file size enforced server-side

**Accessibility:**
- NFR12: Text contrast ratio ≥ 4.5:1 for body text; ≥ 3:1 for large text
- NFR13: Keyboard navigation for primary flows (species search, add to simulator, login/register)
- NFR14: All inputs have associated visible labels or aria-label attributes
- NFR15: Error states communicated via text, not color alone

**Reliability:**
- NFR16: No data corruption on concurrent read/write to species or compatibility matrix tables
- NFR17: Compatibility Engine failure displays an error state — never silently shows incorrect results
- NFR18: Tank Simulator handles edge cases without crash: 0 species, 0 volume, overflow >10 icons shown as "+N more"
- NFR19: Core flows functional on 375px viewport without horizontal scrolling

### Additional Requirements

Architecture-derived technical requirements affecting implementation:

- AR1: Frontend initialized via `npm create vite@latest aquawiki-frontend -- --template react-ts` + TailwindCSS v4
- AR2: Backend initialized via Spring Initializr — Spring Boot 3.5.14, Java 21, dependencies: web, data-jpa, security, mysql, lombok, validation
- AR3: MySQL local dev via Docker Compose (`mysql:8` image, port 3306)
- AR4: Database schema managed by Flyway — migration files: V1__create_users.sql, V2__create_species.sql, V3__create_species_compatibility.sql, V4__seed_species_data.sql
- AR5: JWT implemented with jjwt 0.12.x; token stored in localStorage; global CORS via CorsConfigurationSource bean
- AR6: Hybrid Compatibility Engine — exception table (`species_compatibility`) checked first; Rule Engine (`CompatibilityRuleEngine.java`) used when no exception found
- AR7: Species entity must include rule engine parameters as required fields: ph_min, ph_max, temp_min, temp_max, behavior_tag (enum), max_size_cm
- AR8: Single Axios instance in `src/services/api.ts` with interceptors: auto-attach JWT header + redirect to /login on 401
- AR9: Admin routes lazy-loaded via React.lazy (not bundled unless ADMIN role detected)
- AR10: Image upload stored to local filesystem `uploads/species/`; served via Spring static resource handler

### UX Design Requirements

No UX Design document — SPA scope defined directly in PRD Web Application Specific Requirements section.

### FR Coverage Map

| FR | Epic | Mô tả |
|---|---|---|
| FR1 | Epic 1 | User registration |
| FR2 | Epic 1 | User login + JWT |
| FR3 | Epic 1 | Logout |
| FR6 | Epic 1 | RBAC enforcement |
| FR7 | Epic 2 | Browse paginated species list |
| FR8 | Epic 2 | Search species |
| FR9 | Epic 2 | Filter species |
| FR10 | Epic 2 | Species detail page |
| FR13 | Epic 3 | Tank dimensions + volume calculation |
| FR14 | Epic 3 | Add species to simulation |
| FR15 | Epic 3 | Remove species from simulation |
| FR16 | Epic 3 | Real-time bioload recalculation |
| FR17 | Epic 3 | 2D visualization |
| FR20 | Epic 4 | Pair compatibility evaluation |
| FR21 | Epic 4 | Group compatibility evaluation |
| FR22 | Epic 4 | Real-time compatibility warnings |
| FR23 | Epic 4 | Warning severity (red/yellow/green) |
| FR24 | Epic 4 | Parameter conflict detection |
| FR25 | Epic 4 | Plain-language conflict explanation |
| FR27 | Epic 5 | Admin create species |
| FR28 | Epic 5 | Admin edit species |
| FR29 | Epic 5 | Admin delete species |
| FR30 | Epic 5 | Admin image upload |
| FR31 | Epic 5 | Admin approval workflow |
| FR32 | Epic 5 | Admin compatibility matrix management |
| FR36 | Epic 2 | User flag species as inaccurate |
| FR37 | Epic 5 | Admin review flagged species |
| FR46 | Epic 6 | Minimal tank persistence (CRUD) |
| FR47 | Epic 6 | Water-change schedule + next-due |
| FR48 | Epic 6 | In-app water-change reminder |
| FR49 | Epic 6 | Log water change + reset schedule |
| FR50 | Epic 7 | AI fish photo → candidate species |
| FR51 | Epic 7 | Identification result → species detail |

## Epic List

### Epic 1: Project Foundation & User Authentication
Users can register, login, and logout. The system enforces role-based access (USER / ADMIN) on all protected routes. All project infrastructure (starter templates, Docker Compose, Flyway, Spring Security, Axios instance) is established in this epic.

**FRs covered:** FR1, FR2, FR3, FR6
**ARs covered:** AR1 (Vite+React-TS init), AR2 (Spring Boot 3.5.14 + Java 21 init), AR3 (Docker Compose MySQL), AR4 (Flyway V1 users migration), AR5 (jjwt 0.12.x + SecurityConfig), AR8 (Axios instance + interceptors), AR9 (admin lazy loading route setup)

### Epic 2: Species Encyclopedia
Users can browse a paginated species list, search by name/keyword, filter by behavioral and parameter criteria, and view full species detail pages. Authenticated users can flag inaccurate species data for admin review.

**FRs covered:** FR7, FR8, FR9, FR10, FR36
**ARs covered:** AR6 (Species entity with required rule engine params: ph_min/max, temp_min/max, behavior_tag, max_size_cm), AR4 (Flyway V2 species migration)

### Epic 3: Tank Simulator
Users can input tank dimensions to calculate volume, add and remove species with quantities, see real-time bioload percentage recalculation (without losing species state), and view a 2D visualization of the tank with an overall status indicator (green/yellow/red). Session-only — no backend persistence.

**FRs covered:** FR13, FR14, FR15, FR16, FR17

### Epic 4: Compatibility Engine
Users receive real-time compatibility warnings as they add or remove species in the simulator. Warnings cover pair and group compatibility, severity levels (red/yellow/green), parameter conflicts (temperature and pH), and include plain-language Vietnamese explanations of each conflict.

**FRs covered:** FR20, FR21, FR22, FR23, FR24, FR25
**ARs covered:** AR5 (Hybrid Engine: exception table checked first, Rule Engine fallback), AR6 (Species rule engine params reused), AR4 (Flyway V3 species_compatibility table + V4 seed data)

### Epic 5: Admin & Content Management
Administrators can create, edit, and delete species records with full parameter sets; upload and replace species images; manage the approval workflow (draft → approved); manage compatibility exception rules; and review species flagged as inaccurate by users.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR37
**ARs covered:** AR9 (Admin routes lazy-loaded via React.lazy), AR10 (Image upload → local filesystem uploads/species/)

### Epic 6: Personal Tanks & Water Change Reminders
> Added via Sprint Change Proposal 2026-06-24 — **top priority**.

Authenticated users can save tanks, configure a water-change schedule, and receive in-app reminders when a water change is due or overdue, clearing the reminder by logging a completed water change. Builds a minimal tank-persistence layer (the simulator is otherwise session-only). Reminders use **compute-on-read** — no background scheduler.

**FRs covered:** FR46, FR47, FR48, FR49
**Depends on:** Epic 1 (auth/RBAC), Epic 2 (species), Epic 3 (volume calculation)
**New ARs:** Flyway V5 `tanks` table, Flyway V6 `tank_maintenance_log` table; reminder compute-on-read ADR

### Epic 7: AI Fish Identification
> Added via Sprint Change Proposal 2026-06-24 — **top priority**. Research spike (7.0) **complete**: provider selected.

Authenticated users can upload a **fish** photo and receive ranked candidate species from the AquaWiki database with confidence indicators, navigating from a result to the species detail page. **Provider decision (research-confirmed): Fishial.AI** — free, fish-specialized REST API — isolated behind a swappable `SpeciesRecognitionService` interface (Claude vision kept as optional paid future augmentation). **Scope: fish only** (shrimp/snails/plants excluded by owner decision).

**FRs covered:** FR50, FR51
**Depends on:** Epic 2 (species DB), Epic 5 (image upload infra / AR10)
**New ARs:** `SpeciesRecognitionService` provider abstraction, `POST /api/identify` endpoint, **Fishial.AI** REST client + API-key secret config

---

## Epic 1: Project Foundation & User Authentication

Users can register, login, and logout. The system enforces role-based access (USER / ADMIN) on all protected routes. All project infrastructure is established.

### Story 1.1: Project Initialization

As a developer,
I want the frontend and backend projects initialized with all dependencies and a running local database,
So that development can begin with a verified, working foundation.

**Acceptance Criteria:**

**Given** the developer runs `npm create vite@latest aquawiki-frontend -- --template react-ts` and installs TailwindCSS v4
**When** `npm run dev` is executed
**Then** the Vite dev server starts on port 5173 with no errors

**Given** the developer generates the Spring Boot project (Spring Boot 3.5.14, Java 21, dependencies: web, data-jpa, security, mysql, lombok, validation) and adds jjwt 0.12.x to pom.xml
**When** `./mvnw spring-boot:run` is executed
**Then** the Spring Boot application starts on port 8080 with no errors

**Given** `docker-compose.yml` defines a `mysql:8` service with database `aquawiki` on port 3306
**When** `docker-compose up -d` is executed
**Then** MySQL is accessible at `localhost:3306` and the Spring Boot app connects successfully on startup

**Given** Flyway is configured in `application-dev.properties`
**When** the application starts
**Then** Flyway runs with zero pending migrations (baseline state confirmed)

**Given** the Axios instance is configured in `src/services/api.ts` with base URL `http://localhost:8080`
**When** a test request is made
**Then** the request reaches the backend (even if it returns 404 — connection is confirmed)

---

### Story 1.2: User Registration

As an unregistered visitor,
I want to create an account with my email and password,
So that I can access authenticated features of AquaWiki.

**Acceptance Criteria:**

**Given** Flyway migration `V1__create_users.sql` creates the `users` table with columns: id, email, password_hash, display_name, role (USER/ADMIN), created_at
**When** the application starts
**Then** the `users` table exists with correct schema and USER is the default role

**Given** a visitor submits a valid email and password (≥ 8 characters) on the Register page
**When** `POST /api/auth/register` is called
**Then** the user record is created with BCrypt-hashed password (cost factor ≥ 10), role USER, and the response returns HTTP 201

**Given** a visitor submits a registration request with an email already in use
**When** `POST /api/auth/register` is called
**Then** the API returns HTTP 409 with error envelope: `{ "status": 409, "error": "CONFLICT", "message": "Email already registered" }`

**Given** a visitor submits an empty email or password shorter than 8 characters
**When** `POST /api/auth/register` is called
**Then** the API returns HTTP 400 with a validation error message

**Given** the Register page at `/register`
**When** the form is submitted successfully
**Then** the user is redirected to `/login` and a success message is displayed

---

### Story 1.3: User Login & Session Management

As a registered user,
I want to log in with my email and password and stay logged in across page refreshes,
So that I can access my account without re-authenticating on every visit.

**Acceptance Criteria:**

**Given** a registered user submits valid credentials on the Login page
**When** `POST /api/auth/login` is called
**Then** the API returns HTTP 200 with `{ "token": "<jwt>", "user": { "id", "email", "displayName", "role" } }` and the JWT has a 24-hour expiry

**Given** a successful login response
**When** the frontend receives the token
**Then** the JWT is stored in `localStorage` under key `aquawiki_token`, and `AuthContext` is updated with user info (id, email, displayName, role)

**Given** the user refreshes the browser
**When** the app initializes
**Then** the JWT is read from `localStorage`, validated (not expired), and `AuthContext` is restored — the user remains logged in

**Given** a user submits incorrect credentials
**When** `POST /api/auth/login` is called
**Then** the API returns HTTP 401 with the standard error envelope and no token is stored

**Given** an authenticated user clicks Logout
**When** the logout action is triggered
**Then** the JWT is removed from `localStorage`, `AuthContext` is cleared, and the user is redirected to `/login`

---

### Story 1.4: Role-Based Access Control

As the system,
I want to enforce role-based access on all protected API endpoints and frontend routes,
So that only authorized users can access USER and ADMIN functionality.

**Acceptance Criteria:**

**Given** a request to any protected endpoint (e.g., `GET /api/users/me`) without a JWT token
**When** the request is processed by the JWT filter
**Then** the server returns HTTP 401 — the request never reaches the controller

**Given** a request to an ADMIN-only endpoint (e.g., `POST /api/species`) with a USER role JWT
**When** the request is processed
**Then** the server returns HTTP 403 — `@PreAuthorize("hasRole('ADMIN')")` blocks the request server-side

**Given** a USER role JWT token in the frontend
**When** navigating to `/admin/*`
**Then** the user is redirected to `/` and the admin bundle is never loaded

**Given** the Axios interceptor receives a 401 response from any API call
**When** this occurs with any stored token
**Then** the token is cleared from `localStorage`, `AuthContext` is reset, and the user is redirected to `/login`

**Given** `GET /api/users/me` is called with a valid JWT
**When** processed by the backend
**Then** the response returns the authenticated user's id, email, displayName, and role

---

## Epic 2: Species Encyclopedia

Users can browse, search, and filter the species list, view full species detail pages, and flag inaccurate data for admin review.

### Story 2.1: Species Database Schema

As a developer,
I want the species database table created with all required fields including rule engine parameters,
So that species data can be stored and the Compatibility Engine can function correctly in later epics.

**Acceptance Criteria:**

**Given** Flyway migration `V2__create_species.sql` runs on application startup
**When** the migration completes
**Then** the `species` table exists with columns: id, common_name, scientific_name, image_url, ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag (PEACEFUL/SEMI_AGGRESSIVE/AGGRESSIVE), care_difficulty (EASY/MEDIUM/HARD), description, bioload_factor, status (DRAFT/APPROVED), created_at, updated_at

**Given** a `Species` JPA entity mapped to the `species` table
**When** the application starts
**Then** Hibernate validates the entity mapping with no schema errors

**Given** ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag are required fields on the Species entity
**When** a species record is created without any of these fields
**Then** Spring Validation returns HTTP 400 — these fields cannot be null

---

### Story 2.2: Species List & Search API

As a visitor,
I want to browse and search the species list via API,
So that the frontend can display relevant species.

**Acceptance Criteria:**

**Given** `GET /api/species` is called without query parameters
**When** processed by `SpeciesController`
**Then** the API returns `{ "data": [...], "total": N, "page": 0, "size": 20 }` containing only APPROVED species, sorted by common_name ascending

**Given** `GET /api/species?search=betta` is called
**When** processed
**Then** only species whose common_name or scientific_name contains "betta" (case-insensitive) are returned

**Given** `GET /api/species?page=1&size=20` is called
**When** processed
**Then** the second page of results is returned with correct pagination metadata

**Given** no species match the search query
**When** `GET /api/species?search=xyz123` is called
**Then** the API returns `{ "data": [], "total": 0, "page": 0, "size": 20 }` with HTTP 200

---

### Story 2.3: Species Filter API

As a visitor,
I want to filter the species list by water parameters and behavior via API,
So that I can find species compatible with my tank conditions.

**Acceptance Criteria:**

**Given** `GET /api/species?behaviorTag=PEACEFUL` is called
**When** processed
**Then** only species with behaviorTag = PEACEFUL are returned

**Given** `GET /api/species?phMin=6.5&phMax=7.5` is called
**When** processed
**Then** only species whose pH range overlaps with 6.5–7.5 are returned (species.ph_min ≤ 7.5 AND species.ph_max ≥ 6.5)

**Given** `GET /api/species?tempMin=24&tempMax=28` is called
**When** processed
**Then** only species whose temperature range overlaps with 24–28°C are returned

**Given** `GET /api/species?careDifficulty=EASY` is called
**When** processed
**Then** only species with careDifficulty = EASY are returned

**Given** multiple filter params are combined (e.g., `?behaviorTag=PEACEFUL&careDifficulty=EASY`)
**When** processed
**Then** all filters are applied with AND logic — only species matching all criteria are returned

---

### Story 2.4: Species Detail API

As a visitor,
I want to view the full detail of a species via API,
So that the frontend can display complete species information.

**Acceptance Criteria:**

**Given** `GET /api/species/{id}` is called with a valid ID of an APPROVED species
**When** processed
**Then** the API returns full SpeciesResponse: id, commonName, scientificName, imageUrl, phMin, phMax, tempMin, tempMax, maxSizeCm, behaviorTag, careDifficulty, description, bioloadFactor, status, createdAt

**Given** `GET /api/species/{id}` is called with a non-existent ID
**When** processed
**Then** the API returns HTTP 404 with error envelope: `{ "status": 404, "error": "NOT_FOUND", "message": "Species not found" }`

**Given** `GET /api/species/{id}` is called with a DRAFT species ID by a non-admin user
**When** processed
**Then** the API returns HTTP 404 — DRAFT species are not visible to non-admin users

---

### Story 2.5: Frontend Species List Page

As a visitor,
I want to browse and search species from the home page with real-time filtering,
So that I can find relevant species without navigating away.

**Acceptance Criteria:**

**Given** a visitor opens the home page `/`
**When** the page loads
**Then** a paginated grid of SpeciesCard components is displayed, each showing: species image, common name, scientific name, behavior tag badge, and care difficulty

**Given** the user types in the search bar
**When** at least 2 characters are entered
**Then** the species list updates to show matching results (debounced — API called after 300ms pause)

**Given** the user selects filter options (behavior tag, care difficulty)
**When** filters are applied
**Then** the species list updates to show only matching species with filter state reflected in the UI

**Given** the total species count exceeds the page size
**When** the user clicks pagination controls
**Then** the next/previous page loads and the page scrolls to top

**Given** search/filter returns no results
**When** the empty state renders
**Then** "Không tìm thấy loài nào phù hợp" is displayed with a suggestion to clear filters

---

### Story 2.6: Frontend Species Detail Page

As a visitor,
I want to view the complete details of a species on a dedicated page,
So that I can evaluate its parameters before adding it to my tank.

**Acceptance Criteria:**

**Given** a visitor clicks on a SpeciesCard
**When** navigating to `/species/:id`
**Then** the SpeciesDetailPage renders with: species image, common name, scientific name, pH range, temperature range, max size, behavior tag, care difficulty, bioload factor, and description

**Given** the species has no image uploaded
**When** the detail page renders
**Then** a placeholder image is shown — no broken image icon

**Given** an invalid or non-existent species ID is in the URL
**When** the page attempts to load
**Then** an error message "Không tìm thấy loài này" is displayed with a link back to the species list

**Given** an authenticated user views the detail page
**When** the page renders
**Then** a "Báo cáo dữ liệu không chính xác" flag button is visible (hidden for unauthenticated visitors)

---

### Story 2.7: Flag Species as Inaccurate

As an authenticated user,
I want to flag a species record as potentially inaccurate,
So that administrators can review and correct bad data.

**Acceptance Criteria:**

**Given** Flyway migration `V2b__create_species_flags.sql` creates the `species_flags` table with columns: id, species_id (FK), reported_by_user_id (FK), reason, status (PENDING/REVIEWED/DISMISSED), created_at
**When** the application starts
**Then** the `species_flags` table exists with correct schema

**Given** an authenticated user clicks the flag button and submits a reason
**When** `POST /api/species/{id}/flags` is called with `{ "reason": "..." }`
**Then** a flag record is created with status PENDING and the API returns HTTP 201

**Given** an unauthenticated visitor calls `POST /api/species/{id}/flags`
**When** processed
**Then** the API returns HTTP 401

**Given** an authenticated user submits a flag without providing a reason
**When** the form is submitted
**Then** frontend validation prevents submission and displays "Vui lòng mô tả vấn đề bạn phát hiện"

**Given** a flag is successfully submitted
**When** the confirmation is received
**Then** the flag button shows "Đã báo cáo" state and cannot be clicked again for the same species in the same session

---

## Epic 3: Tank Simulator

Users can input tank dimensions to calculate volume, add and remove species with quantities, see real-time bioload percentage, and view a 2D visualization of the tank. Session-only — no backend persistence.

> **Note:** In Epic 3, the tank border color reflects bioload status only. Compatibility status will be integrated into the visualization in Epic 4.

### Story 3.1: Tank Dimension Input & Volume Calculation

As a user,
I want to input my tank's dimensions and immediately see the calculated volume,
So that I know exactly how much water my tank holds before planning fish quantities.

**Acceptance Criteria:**

**Given** the user navigates to `/simulator`
**When** the SimulatorPage loads
**Then** three numeric input fields are displayed for length, width, and height (all in cm) with visible labels

**Given** the user enters valid dimensions (e.g., 60 × 30 × 35)
**When** any dimension value changes
**Then** the volume is recalculated immediately: volume (liters) = (L × W × H) / 1000, displayed as "63 lít"

**Given** the user enters 0 or a negative number in any dimension field
**When** the value is entered
**Then** the volume displays "—" and a validation message "Kích thước phải lớn hơn 0" is shown — no crash occurs

**Given** the user enters an unreasonably large value (e.g., 10000 cm)
**When** the value is entered
**Then** a warning "Kích thước không hợp lệ (tối đa 1000 cm)" is displayed but the calculation still runs

**Given** the user changes dimensions after species have been added
**When** the new volume is calculated
**Then** the species list is preserved — no species are removed — and bioload percentage updates immediately

---

### Story 3.2: Add & Remove Species in Simulator

As a user,
I want to add and remove species from my simulated tank,
So that I can plan the composition of my aquarium.

**Acceptance Criteria:**

**Given** the simulator has valid dimensions entered
**When** the user opens the species selector
**Then** a searchable dropdown or modal appears, fetching from `GET /api/species` (APPROVED only)

**Given** the user searches for a species by name in the selector
**When** at least 2 characters are typed
**Then** matching species appear in the list with their common name and behavior tag

**Given** the user selects a species from the selector
**When** it is added to the simulator
**Then** the species appears in the simulator's species list with a default quantity of 1 and a quantity stepper (+/−)

**Given** a species is already in the simulator list
**When** the user adjusts the quantity stepper
**Then** the quantity updates (minimum 1) and bioload recalculates immediately

**Given** the user clicks the remove button on a species
**When** the species is removed
**Then** it disappears from the list and bioload recalculates immediately — remaining species are unaffected

**Given** the user has added species and then changes tank dimensions
**When** the volume updates
**Then** all species and their quantities remain in the list unchanged (FR16 — state preservation)

---

### Story 3.3: Real-time Bioload Calculation & Display

As a user,
I want to see the bioload percentage of my tank update in real time,
So that I know whether my tank is overstocked before committing to a fish purchase.

**Acceptance Criteria:**

**Given** the simulator has valid dimensions and at least one species added
**When** any species, quantity, or dimension changes
**Then** bioload percentage is recalculated immediately: `bioload% = (Σ species.bioloadFactor × quantity) / tankVolume × 100`

**Given** the calculated bioload is below 80%
**When** the bioload indicator renders
**Then** it displays green color with the percentage value (e.g., "45%")

**Given** the calculated bioload is between 80% and 100%
**When** the bioload indicator renders
**Then** it displays yellow color and message "Hồ đang gần đầy tải"

**Given** the calculated bioload exceeds 100%
**When** the bioload indicator renders
**Then** it displays red color and message "Hồ quá tải — nên giảm số lượng cá"

**Given** no species have been added
**When** the bioload indicator renders
**Then** it displays 0% with green color — no crash or NaN is shown

**Given** tank dimensions are 0 or invalid
**When** the bioload calculation runs
**Then** the bioload indicator shows "—" — no division-by-zero error occurs

---

### Story 3.4: 2D Tank Visualization

As a user,
I want to see a visual representation of my tank showing which species are inside,
So that I can intuitively understand the state of my simulated aquarium.

**Acceptance Criteria:**

**Given** the simulator has valid dimensions and at least one species
**When** the TankCanvas component renders
**Then** a rectangle proportional to the tank's length × height ratio is displayed with species icons inside

**Given** up to 10 species are in the simulator
**When** the TankCanvas renders
**Then** each species is shown as a distinct icon (or placeholder circle with initials) with a quantity label (e.g., "×3")

**Given** more than 10 species are in the simulator
**When** the TankCanvas renders
**Then** the first 10 species icons are shown and a "+N more" label indicates the overflow count — no icons are cropped or overlap the border

**Given** the bioload is below 80%
**When** the TankCanvas renders
**Then** the tank border is green

**Given** the bioload is between 80% and 100%
**When** the TankCanvas renders
**Then** the tank border is yellow

**Given** the bioload exceeds 100%
**When** the TankCanvas renders
**Then** the tank border is red

**Given** no species have been added
**When** the TankCanvas renders
**Then** the tank rectangle is shown empty with prompt "Thêm cá để bắt đầu mô phỏng" — no error state

**Given** the simulator is viewed on a 375px viewport
**When** the TankCanvas renders
**Then** the tank rectangle fits within the screen width without horizontal scrolling

---

## Epic 4: Compatibility Engine

Users receive real-time compatibility warnings as they add or remove species in the simulator — covering pair and group compatibility, severity levels, parameter conflict detection, and plain-language Vietnamese explanations.

### Story 4.1: Compatibility Data Foundation

As a developer,
I want the compatibility exception table created and seeded with initial data,
So that the Compatibility Engine has verified exception pairs and the app has demo species data to work with.

**Acceptance Criteria:**

**Given** Flyway migration `V3__create_species_compatibility.sql` runs on startup
**When** the migration completes
**Then** the `species_compatibility` table exists with columns: id, species_id_a, species_id_b, level (COMPATIBLE/CAUTION/INCOMPATIBLE), note, verified_by, created_at — with constraint that species_id_a < species_id_b

**Given** Flyway migration `V4__seed_data.sql` runs after V3
**When** the migration completes
**Then** at least 10 APPROVED species records exist in the `species` table with all required rule engine parameters populated (ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag, bioload_factor)

**Given** the seed data includes known biological exception pairs
**When** the migration completes
**Then** at least 3 verified exception pairs exist in `species_compatibility` (e.g., Betta + Guppy = INCOMPATIBLE, Betta + Neon Tetra = CAUTION)

**Given** the `SpeciesCompatibility` JPA entity is mapped to the table
**When** the application starts
**Then** Hibernate validates the entity mapping with no schema errors and `SpeciesCompatibilityRepository` can query by species_id_a and species_id_b

---

### Story 4.2: Compatibility Rule Engine

As a developer,
I want a Rule Engine service that computes compatibility from species parameters,
So that species pairs without verified exceptions are automatically evaluated without manual data entry.

**Acceptance Criteria:**

**Given** `CompatibilityRuleEngine` is a Spring `@Service` with method `evaluate(Species a, Species b): RuleResult`
**When** two species with overlapping pH ranges are evaluated
**Then** the pH rule returns COMPATIBLE for that parameter

**Given** two species with non-overlapping temperature ranges
**When** evaluated by the Rule Engine
**Then** the engine returns INCOMPATIBLE with reason "Xung đột nhiệt độ: [Species A] cần [X–Y]°C, [Species B] cần [P–Q]°C"

**Given** two species where both have behaviorTag = AGGRESSIVE
**When** evaluated
**Then** the engine returns CAUTION with reason "Cả hai loài có tính hung hăng — có thể xảy ra xung đột lãnh thổ"

**Given** species A has behaviorTag = AGGRESSIVE and species B has maxSizeCm < species A's maxSizeCm × 0.3
**When** evaluated
**Then** the engine returns INCOMPATIBLE with reason "Nguy cơ bị ăn: [Species A] có thể coi [Species B] là con mồi"

**Given** two species that pass all rule checks (compatible pH, temp, behavior, size)
**When** evaluated
**Then** the engine returns COMPATIBLE

**Given** the Rule Engine is a pure computation service with no database calls
**When** evaluated with two fully populated Species objects
**Then** it completes in under 10ms — all inputs come from the caller, no lazy loading occurs

---

### Story 4.3: Compatibility Check API

As the system,
I want a compatibility check API that orchestrates the exception table lookup and Rule Engine,
So that the frontend can request group compatibility for any species combination in under 2 seconds.

**Acceptance Criteria:**

**Given** `POST /api/compatibility/check` is called with `{ "speciesIds": [1, 2, 3] }`
**When** processed by `CompatibilityService`
**Then** for each unique pair: the service first queries `SpeciesCompatibilityRepository` for a verified exception; if found the exception result is used; if not found `CompatibilityRuleEngine.evaluate()` is called

**Given** the service has evaluated all pairs
**When** building the response
**Then** the API returns `{ "groupResult": "INCOMPATIBLE", "pairs": [{ "speciesA": {...}, "speciesB": {...}, "level": "INCOMPATIBLE", "reason": "..." }] }` where `groupResult` is the worst severity across all pairs

**Given** `POST /api/compatibility/check` is called with a single species ID
**When** processed
**Then** the API returns `{ "groupResult": "COMPATIBLE", "pairs": [] }` — no pairs to evaluate

**Given** `POST /api/compatibility/check` is called with an empty array or a non-existent species ID
**When** processed
**Then** the API returns HTTP 400 with a descriptive validation error

**Given** the check is performed for 10 species (45 unique pairs)
**When** processed
**Then** the API responds in under 2 seconds (NFR3)

**Given** an unexpected error occurs during Rule Engine evaluation
**When** caught by `GlobalExceptionHandler`
**Then** the API returns HTTP 500 with the standard error envelope — it never silently returns an incorrect COMPATIBLE result (NFR17)

---

### Story 4.4: Real-time Compatibility Warnings in Simulator

As a user,
I want to see compatibility warnings update in real time as I add or remove species,
So that I can immediately understand which species conflicts exist and why.

**Acceptance Criteria:**

**Given** the user adds or removes a species in the simulator
**When** the species list changes
**Then** `useCompatibility` hook calls `POST /api/compatibility/check` with all current species IDs (debounced 300ms)

**Given** the compatibility API returns conflicts
**When** the `CompatibilityWarning` component renders
**Then** each conflict is displayed with: species pair names, severity badge (🔴 Rủi ro cao / 🟡 Cần chú ý / 🟢 Tương thích), and plain-language Vietnamese explanation

**Given** the compatibility result contains an INCOMPATIBLE pair
**When** the TankCanvas renders
**Then** the tank border is red — overriding the bioload color

**Given** the compatibility result has no INCOMPATIBLE pairs but has CAUTION pairs
**When** the TankCanvas renders
**Then** the tank border is yellow (worst of bioload status and compatibility status)

**Given** all pairs are COMPATIBLE and bioload is below 80%
**When** the TankCanvas renders
**Then** the tank border is green

**Given** the user removes a species that was causing a conflict
**When** the species is removed and the check re-runs
**Then** the conflict warning disappears and the border color updates accordingly

**Given** the compatibility API call fails (network error or 500)
**When** the error is caught
**Then** the warning section displays "Không thể kiểm tra tương thích — vui lòng thử lại" and the tank border does not change to green (NFR17)

**Given** only one species is in the simulator
**When** the compatibility check runs
**Then** no warnings are shown and the border color reflects only bioload status

---

## Epic 5: Admin & Content Management

Administrators can create, edit, delete, and publish species records; upload species images; manage compatibility exception rules; and review flagged species reports.

### Story 5.1: Admin Species Create & Edit

As an administrator,
I want to create new species records and edit existing ones with all required parameters,
So that the species database stays accurate and complete.

**Acceptance Criteria:**

**Given** an ADMIN user navigates to `/admin/species/new`
**When** the SpeciesFormPage loads
**Then** a form is displayed with fields for: common name, scientific name, ph_min, ph_max, temp_min, temp_max, max_size_cm, behavior_tag (dropdown), care_difficulty (dropdown), bioload_factor, and description

**Given** the admin submits a valid create form
**When** `POST /api/species` is called with an ADMIN JWT
**Then** a new species record is created with status DRAFT, HTTP 201 is returned, and the admin is redirected to the species manage page

**Given** the admin navigates to `/admin/species/:id/edit`
**When** the form loads
**Then** all existing species fields are pre-populated with current values

**Given** the admin submits a valid edit form
**When** `PUT /api/species/{id}` is called
**Then** the species record is updated and HTTP 200 is returned

**Given** the admin submits the form missing a required field (e.g., ph_min)
**When** `POST /api/species` or `PUT /api/species/{id}` is called
**Then** the API returns HTTP 400 with a field-level validation error message

**Given** a USER role JWT calls `POST /api/species`
**When** processed by Spring Security
**Then** the API returns HTTP 403 — RBAC enforcement at the server (NFR9)

---

### Story 5.2: Admin Species List, Delete & Approval Workflow

As an administrator,
I want to view all species including drafts, delete records, and control which species are visible to users,
So that I can curate the public species database.

**Acceptance Criteria:**

**Given** an ADMIN user navigates to `/admin/species`
**When** the SpeciesManagePage loads
**Then** a table lists all species (DRAFT and APPROVED), each row showing: common name, status badge, behavior tag, and action buttons (Edit / Delete / Publish or Unpublish)

**Given** an ADMIN JWT calls `GET /api/species`
**When** processed
**Then** the response includes both DRAFT and APPROVED species (unlike the public endpoint which returns APPROVED only)

**Given** the admin clicks Delete on a species
**When** `DELETE /api/species/{id}` is called
**Then** the species record is removed and disappears from the admin list immediately

**Given** the admin clicks Publish on a DRAFT species
**When** `PUT /api/species/{id}` is called with `{ "status": "APPROVED" }`
**Then** the species status changes to APPROVED and becomes visible to non-admin users

**Given** the admin clicks Unpublish on an APPROVED species
**When** `PUT /api/species/{id}` is called with `{ "status": "DRAFT" }`
**Then** the species status reverts to DRAFT and is hidden from non-admin users

**Given** `DELETE /api/species/{id}` is called with a USER role JWT
**When** processed
**Then** the API returns HTTP 403

---

### Story 5.3: Species Image Upload

As an administrator,
I want to upload and replace a species image,
So that every species has a representative photo in the encyclopedia.

**Acceptance Criteria:**

**Given** the admin is on the SpeciesFormPage for an existing species
**When** an image file is selected via the upload input
**Then** the selected filename is displayed and a preview is shown before submission

**Given** the admin submits a valid image (JPEG or PNG, ≤ 5MB)
**When** `PUT /api/species/{id}/image` is called with multipart form data
**Then** the file is saved to `uploads/species/{id}.{ext}`, `species.image_url` is updated, and HTTP 200 is returned

**Given** the admin uploads a file with an invalid MIME type (e.g., PDF, EXE)
**When** processed server-side
**Then** the API returns HTTP 400 with message "Chỉ chấp nhận file ảnh (JPEG, PNG)" — the file is not saved (NFR11)

**Given** the admin uploads a file exceeding 5MB
**When** processed server-side
**Then** the API returns HTTP 400 with message "Kích thước file tối đa là 5MB" — the file is not saved (NFR11)

**Given** a species image has been uploaded successfully
**When** the species detail page is viewed by any user
**Then** the image is displayed from `/uploads/species/{id}.{ext}` served by Spring's static resource handler

---

### Story 5.4: Compatibility Exception Management

As an administrator,
I want to add, edit, and remove verified compatibility exception pairs,
So that known biological incompatibilities are captured even when the Rule Engine cannot detect them from parameters alone.

**Acceptance Criteria:**

**Given** an ADMIN user views the compatibility exceptions section
**When** the page loads
**Then** a list of all existing exception pairs is displayed showing: species A name, species B name, level, and note

**Given** the admin submits a new exception pair (species A, species B, level, note)
**When** `POST /api/compatibility/exceptions` is called
**Then** the pair is saved with normalization applied (species_id_a = min(idA, idB)) and HTTP 201 is returned

**Given** the admin attempts to create a duplicate pair (same two species already have an exception)
**When** `POST /api/compatibility/exceptions` is called
**Then** the API returns HTTP 409 with message "Cặp loài này đã có exception"

**Given** the admin edits an existing exception (changes level or note)
**When** `PUT /api/compatibility/exceptions/{id}` is called
**Then** the exception is updated and the change immediately affects future compatibility checks

**Given** the admin deletes an exception pair
**When** `DELETE /api/compatibility/exceptions/{id}` is called
**Then** the exception is removed and future checks for that pair fall back to the Rule Engine

---

### Story 5.5: Review Flagged Species Reports

As an administrator,
I want to review species data quality flags submitted by users,
So that I can investigate reported inaccuracies and maintain database integrity.

**Acceptance Criteria:**

**Given** an ADMIN user navigates to the flags review section
**When** the page loads
**Then** a list of all PENDING flags is displayed showing: species name, flag reason, reporting user, and date submitted

**Given** `GET /api/species/flags?status=PENDING` is called with an ADMIN JWT
**When** processed
**Then** the response lists all PENDING flag records with species and reporter info

**Given** the admin reviews a flag and marks it as REVIEWED
**When** `PUT /api/species/flags/{id}` is called with `{ "status": "REVIEWED" }`
**Then** the flag status changes to REVIEWED and disappears from the PENDING list

**Given** the admin marks a flag as DISMISSED (report was incorrect)
**When** `PUT /api/species/flags/{id}` is called with `{ "status": "DISMISSED" }`
**Then** the flag status changes to DISMISSED and disappears from the PENDING list

**Given** a USER role JWT calls `GET /api/species/flags`
**When** processed
**Then** the API returns HTTP 403

---

## Epic 6: Personal Tanks & Water Change Reminders

> Added via Sprint Change Proposal 2026-06-24. **Top priority.** Depends on Epic 1 (auth), Epic 2 (species), Epic 3 (volume calc). Reminders use compute-on-read — no background scheduler is introduced.

### Story 6.1: Tank Persistence Schema

As the system, I need persistent tank storage so users can save tanks and attach water-change schedules.

**Acceptance Criteria:**

**Given** Flyway runs migration V5
**When** the schema is applied
**Then** a `tanks` table exists with: `id`, `user_id` (FK → users), `name`, `length_cm`, `width_cm`, `height_cm`, `volume_liters`, `water_change_interval_days`, `last_water_change_date`, `created_at`, `updated_at`

**Given** Flyway runs migration V6
**When** the schema is applied
**Then** a `tank_maintenance_log` table exists with: `id`, `tank_id` (FK → tanks), `event_type`, `event_date`, `note`

**Given** a tank row is deleted
**When** the delete is processed
**Then** its `tank_maintenance_log` rows are removed (cascade)

### Story 6.2: Tank CRUD API

As an authenticated user, I want to create, list, edit, and delete my saved tanks.

**Acceptance Criteria:**

**Given** an authenticated user calls `POST /api/tanks` with name + dimensions
**When** processed
**Then** a tank is created scoped to that user, with `volume_liters` computed from dimensions, returning HTTP 201 and the tank body

**Given** an authenticated user calls `GET /api/tanks`
**When** processed
**Then** only that user's tanks are returned

**Given** a user calls `PUT /api/tanks/{id}` or `DELETE /api/tanks/{id}` for a tank they do not own
**When** processed
**Then** the API returns HTTP 403 (ownership enforced server-side)

**Given** a user calls `PUT /api/tanks/{id}` with new dimensions
**When** processed
**Then** `volume_liters` is recomputed and persisted

### Story 6.3: Water Change Schedule & Next-Due Computation

As an authenticated user, I want to set a water-change interval so the system tracks when the next change is due.

**Acceptance Criteria:**

**Given** a user sets `water_change_interval_days` and `last_water_change_date` on a tank
**When** the tank is read
**Then** the response includes a computed `next_due_date = last_water_change_date + interval_days`

**Given** a tank has no interval configured
**When** the tank is read
**Then** `next_due_date` is null and no reminder is generated for it

**Given** `water_change_interval_days` ≤ 0 is submitted
**When** processed
**Then** the API returns HTTP 400 with a validation error

### Story 6.4: In-App Reminder API + Mark Water Change Done

As an authenticated user, I want an in-app reminder when a water change is due, and a way to clear it by logging the change.

**Acceptance Criteria:**

**Given** an authenticated user calls `GET /api/reminders`
**When** processed
**Then** the response lists tanks whose `next_due_date <= today`, each with a status of DUE (== today) or OVERDUE (< today), computed at request time (no scheduler)

**Given** a user calls `POST /api/tanks/{id}/water-change`
**When** processed
**Then** a `WATER_CHANGE` event is appended to `tank_maintenance_log`, `last_water_change_date` is set to today, and `next_due_date` is recomputed — clearing the reminder

**Given** a user marks a water change on a tank they do not own
**When** processed
**Then** the API returns HTTP 403

### Story 6.5: Frontend My Tanks List + Reminder Banner

As an authenticated user, I want a My Tanks page that surfaces due/overdue reminders.

**Acceptance Criteria:**

**Given** the user opens the My Tanks page
**When** it loads
**Then** their saved tanks are listed with name, volume, and a reminder banner: green (ok), yellow (due today), red (overdue)

**Given** a tank is overdue
**When** the user clicks "Mark water change done"
**Then** `POST /api/tanks/{id}/water-change` is called and the banner returns to green without a full page reload

**Given** the user is not authenticated
**When** they navigate to My Tanks
**Then** they are redirected to login (protected route)

### Story 6.6: Frontend Create/Edit Tank Form

As an authenticated user, I want to create and edit a tank, reusing the simulator's volume calculation.

**Acceptance Criteria:**

**Given** the user enters dimensions in the tank form
**When** values change
**Then** volume in liters is shown live, reusing the Epic 3 volume-calc logic

**Given** the user submits a valid tank with an interval
**When** saved
**Then** `POST`/`PUT /api/tanks` is called and the user returns to My Tanks with the tank present

**Given** required fields are missing or dimensions are out of bounds
**When** the user submits
**Then** inline validation errors are shown and no request is sent

---

## Epic 7: AI Fish Identification

> Added via Sprint Change Proposal 2026-06-24. **Top priority.** Depends on Epic 2 (species DB) and Epic 5 (image upload infra / AR10). Provider isolated behind `SpeciesRecognitionService`. **Scope: fish only.**

### Story 7.0: (Spike) Technical Research — Recognition Provider ✅ COMPLETE

As the team, we must choose a fish-recognition provider before building, because accuracy and cost are unproven.

**Outcome (2026-06-24):** Research complete — see `research/technical-ai-fish-species-identification-aquawiki-research-2026-06-24.md`. **Provider selected: Fishial.AI** (free, fish-specialized REST API). Feature scoped to fish only. Claude vision documented as optional paid future augmentation behind the same interface. Integration contract defined (image in → ranked `SpeciesMatch{speciesId, confidence}` list + `noMatch` flag).

**This story is DONE; it unblocks 7.1–7.4.**

### Story 7.1: SpeciesRecognitionService Interface + Fishial.AI Provider

As the system, I need a swappable recognition service so the provider can change without touching controllers or the frontend.

**Acceptance Criteria:**

**Given** the Fishial.AI provider chosen in Story 7.0
**When** implemented
**Then** a `SpeciesRecognitionService` interface exists with `identify(image, mimeType) → List<SpeciesMatch{speciesId, confidence}>` and a `FishialRecognitionService` implementation calling the Fishial REST API

**Given** the Fishial API key
**When** the app starts
**Then** it is read from environment config and never committed to source

**Given** Fishial returns species (by scientific name)
**When** mapping results
**Then** only candidates resolvable to an existing `species.id` are returned; Fishial's per-match score is adapted to the `confidence` (0–1) contract

**Given** Fishial returns no fish (e.g., a non-fish photo)
**When** mapping results
**Then** an empty list is returned so the endpoint can signal `noMatch`

### Story 7.2: Identification API Endpoint

As an authenticated user, I want to POST a photo and get ranked candidate species.

**Acceptance Criteria:**

**Given** an authenticated user calls `POST /api/identify` with a multipart image
**When** processed
**Then** the image passes AR10 validation (MIME = image, size within limit) and a ranked list of candidate species with confidence is returned

**Given** the provider returns no confident match
**When** processed
**Then** the API returns an empty candidate list with a no-match indicator (not an error)

**Given** an invalid or oversized file
**When** uploaded
**Then** the API returns HTTP 400 with a validation message

**Given** the provider is unreachable
**When** the call fails
**Then** the API returns an explicit error state (HTTP 502/503) — never a silent wrong result

### Story 7.3: Frontend Identify-a-Fish Upload Screen

As an authenticated user, I want to upload a fish photo from an Identify page.

**Acceptance Criteria:**

**Given** the user opens the Identify a Fish page
**When** they select/capture an image
**Then** a preview is shown and an Identify button triggers `POST /api/identify`

**Given** the request is in flight
**When** waiting
**Then** a loading state is shown

**Given** the user is not authenticated
**When** they navigate to Identify
**Then** they are redirected to login (protected route)

### Story 7.4: Frontend Result Screen + Species Detail Link

As an authenticated user, I want to see ranked matches and open the species detail.

**Acceptance Criteria:**

**Given** the API returns candidates
**When** the result renders
**Then** each candidate shows the species name, thumbnail, and a confidence indicator, ordered by confidence

**Given** the user taps a candidate
**When** clicked
**Then** they navigate to that species' detail page (FR51)

**Given** the API returns a no-match result
**When** rendered
**Then** a friendly "no confident match" message is shown with guidance to retry with a clearer photo
