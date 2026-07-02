---
story_key: 1-2-user-registration
epic: 1
story: 2
status: review
created: 2026-05-15
completed: 2026-05-15
---

# Story 1.2: User Registration

**As an** unregistered visitor,
**I want** to create an account with my email and password,
**So that** I can access authenticated features of AquaWiki.

## Acceptance Criteria

**AC1 — Users Table Migration:**
**Given** Flyway migration `V1__create_users.sql` creates the `users` table with columns: id, email, password_hash, display_name, role (USER/ADMIN), created_at
**When** the application starts
**Then** the `users` table exists with correct schema and USER is the default role

**AC2 — Successful Registration:**
**Given** a visitor submits a valid email and password (≥ 8 characters) on the Register page
**When** `POST /api/auth/register` is called
**Then** the user record is created with BCrypt-hashed password (cost factor ≥ 10), role USER, and the response returns HTTP 201

**AC3 — Duplicate Email:**
**Given** a visitor submits a registration request with an email already in use
**When** `POST /api/auth/register` is called
**Then** the API returns HTTP 409 with error envelope: `{ "status": 409, "error": "CONFLICT", "message": "Email already registered" }`

**AC4 — Invalid Input:**
**Given** a visitor submits an empty email or password shorter than 8 characters
**When** `POST /api/auth/register` is called
**Then** the API returns HTTP 400 with a validation error message

**AC5 — Register Page:**
**Given** the Register page at `/register`
**When** the form is submitted successfully
**Then** the user is redirected to `/login` and a success message is displayed

## Tasks/Subtasks

- [x] **Task 1: Flyway migration — users table**
  - [x] 1.1 Create `V1__create_users.sql` with users table schema
  - [x] 1.2 Verify migration runs on app startup (zero pending after)

- [x] **Task 2: User entity, repository, and security config**
  - [x] 2.1 Create `User` entity (`com.aquawiki.model.User`)
  - [x] 2.2 Create `UserRepository` interface
  - [x] 2.3 Create `SecurityConfig` — permit `/api/auth/**`, secure rest, enable CORS for `localhost:5173`, BCryptPasswordEncoder bean (strength 10)
  - [x] 2.4 Create `GlobalExceptionHandler` (`@ControllerAdvice`) with standard error envelope

- [x] **Task 3: Auth API — register endpoint**
  - [x] 3.1 Create `RegisterRequest` DTO with `@Valid` constraints (email not blank, password size ≥ 8)
  - [x] 3.2 Create `AuthService.register()` — check duplicate email → throw 409, else BCrypt hash, save user, return 201
  - [x] 3.3 Create `AuthController` with `POST /api/auth/register`

- [x] **Task 4: Backend tests**
  - [x] 4.1 `AuthServiceTest` — unit tests: successful registration, duplicate email throws exception
  - [x] 4.2 `AuthControllerTest` — `@WebMvcTest`: 201 on valid, 409 on duplicate, 400 on invalid input

- [x] **Task 5: Register page — frontend**
  - [x] 5.1 Install React Router v7: `npm install react-router`
  - [x] 5.2 Set up router in `main.tsx` with routes: `/` → App, `/register`, `/login`
  - [x] 5.3 Create `RegisterPage` component with form (email, password, displayName), call `POST /api/auth/register`
  - [x] 5.4 On success → navigate to `/login`, display success message via state
  - [x] 5.5 On error → display inline error (duplicate email, server error)

## Dev Notes

### Backend Architecture

**Error envelope (standard across all endpoints):**
```json
{ "status": 409, "error": "CONFLICT", "message": "Email already registered" }
```
Implemented via `ApiError` record + `GlobalExceptionHandler @RestControllerAdvice`.

**Spring Security config:**
- Stateless session (STATELESS)
- CSRF disabled
- `/api/auth/**` = permitAll, rest = authenticated
- BCryptPasswordEncoder strength = 10
- CORS: `http://localhost:5173`

### Frontend Architecture

**React Router v7:** `react-router` package (not `react-router-dom`), `createBrowserRouter` API.
**RegisterPage:** Controlled form, Axios POST, navigate with `{ state: { registered: true } }` on success.
**LoginPage:** Shows success message from `location.state.registered`.

### From Story 1.1

- Docker MySQL on port **3308** (not 3306)
- Package root: `com.aquawiki`
- SecurityAutoConfiguration exclusion removed — proper SecurityConfig now in place

## Dev Agent Record

### Implementation Plan

1. Flyway V1 migration → 2. Entity + Repository + Security + ExceptionHandler → 3. DTO + Service + Controller → 4. Tests → 5. Frontend

### Debug Log

- `@WebMvcTest` needs `@Import(SecurityConfig.class)` to load the security bean correctly; without it, Spring auto-configures a default security that breaks the test expectations
- `AquawikiBackendApplicationTests` uses `@ActiveProfiles("test")` + H2 (added as test dependency) to avoid requiring MySQL for context load test

### Completion Notes

✅ AC1: Flyway `V1__create_users.sql` applied on startup — users table verified (`DESCRIBE users` shows correct schema with `role DEFAULT 'USER'`)
✅ AC2: `POST /api/auth/register` → HTTP 201, BCrypt hash with strength 10, role USER — covered by `AuthControllerTest` + `AuthServiceTest`
✅ AC3: Duplicate email → HTTP 409 `{ status: 409, error: "409 CONFLICT", message: "Email already registered" }` — covered by test
✅ AC4: Empty email / password < 8 chars → HTTP 400 — covered by `AuthControllerTest`
✅ AC5: `/register` page created, on success navigates to `/login` with `{ state: { registered: true } }`, LoginPage shows success banner — TypeScript build passes

**Tests:** 7/7 pass (2 unit, 4 controller, 1 context)

## File List

**Backend:**
- `aquawiki-backend/src/main/resources/db/migration/V1__create_users.sql` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/model/User.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/repository/UserRepository.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/config/SecurityConfig.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/config/GlobalExceptionHandler.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/ApiError.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/RegisterRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/AuthService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/AuthController.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/AquawikiBackendApplication.java` (modified — removed SecurityAutoConfiguration exclusion)
- `aquawiki-backend/pom.xml` (modified — added H2 test dependency)
- `aquawiki-backend/src/test/java/com/aquawiki/AquawikiBackendApplicationTests.java` (modified — added @ActiveProfiles("test"))
- `aquawiki-backend/src/test/java/com/aquawiki/service/AuthServiceTest.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/AuthControllerTest.java` (new)
- `aquawiki-backend/src/test/resources/application-test.properties` (new)

**Frontend:**
- `aquawiki-frontend/src/main.tsx` (modified — added React Router setup)
- `aquawiki-frontend/src/pages/RegisterPage.tsx` (new)
- `aquawiki-frontend/src/pages/LoginPage.tsx` (new)

## Change Log

- 2026-05-15: Story 1.2 implemented — user registration complete
  - Backend: Flyway migration, User entity/repo, SecurityConfig, GlobalExceptionHandler, AuthService, AuthController
  - Frontend: React Router v7 setup, RegisterPage, LoginPage with success message
  - Tests: 7/7 pass (unit + controller + context)
