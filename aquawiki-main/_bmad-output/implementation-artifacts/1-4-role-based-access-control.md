---
story_key: 1-4-role-based-access-control
epic: 1
story: 4
status: review
created: 2026-05-15
completed: 2026-05-15
---

# Story 1.4: Role-Based Access Control

**As the** system,
**I want** to enforce role-based access on all protected API endpoints and frontend routes,
**So that** only authorized users can access USER and ADMIN functionality.

## Acceptance Criteria

**AC1 — Unauthenticated 401:**
**Given** a request to any protected endpoint (e.g., `GET /api/users/me`) without a JWT token
**When** the request is processed by the JWT filter
**Then** the server returns HTTP 401 — the request never reaches the controller

**AC2 — ADMIN-only 403:**
**Given** a request to an ADMIN-only endpoint (e.g., `GET /api/admin/ping`) with a USER role JWT
**When** the request is processed
**Then** the server returns HTTP 403 — `@PreAuthorize("hasRole('ADMIN')")` blocks the request server-side

**AC3 — Frontend Admin Route Guard:**
**Given** a USER role JWT token in the frontend
**When** navigating to `/admin/*`
**Then** the user is redirected to `/` and the admin bundle is never loaded

**AC4 — Axios 401 Interceptor:**
**Given** the Axios interceptor receives a 401 response from any API call
**When** this occurs with any stored token
**Then** the token is cleared from `localStorage`, `AuthContext` is reset, and the user is redirected to `/login`

**AC5 — GET /api/users/me:**
**Given** `GET /api/users/me` is called with a valid JWT
**When** processed by the backend
**Then** the response returns the authenticated user's id, email, displayName, and role

## Tasks/Subtasks

- [x] **Task 1: Backend — @EnableMethodSecurity + /api/users/me**
  - [x] 1.1 Add `@EnableMethodSecurity` to `SecurityConfig`
  - [x] 1.2 Create `UserController` with `GET /api/users/me` — reads Authentication principal, returns UserDto
  - [x] 1.3 Create `AuthEntryPoint implements AuthenticationEntryPoint` — returns JSON 401 for unauthenticated requests; wired into SecurityConfig

- [x] **Task 2: Backend — ADMIN stub endpoint**
  - [x] 2.1 Create `AdminController` with `GET /api/admin/ping` annotated `@PreAuthorize("hasRole('ADMIN')")`
  - [x] 2.2 Add `@ExceptionHandler(AccessDeniedException)` in `GlobalExceptionHandler` → HTTP 403 with error envelope

- [x] **Task 3: Backend tests**
  - [x] 3.1 `UserControllerTest` — no token → 401 JSON, `@WithMockUser(USER)` → 200 with user info
  - [x] 3.2 `AdminControllerTest` — `@WithMockUser(USER)` → 403, `@WithMockUser(ADMIN)` → 200

- [x] **Task 4: Frontend — ProtectedRoute + AdminRoute**
  - [x] 4.1 Create `ProtectedRoute` — if no user redirect to `/login`; if `adminOnly` and role !== ADMIN redirect to `/`
  - [x] 4.2 Wrap `/` in `ProtectedRoute`; `/admin/*` in `ProtectedRoute adminOnly` with `React.lazy(AdminPage)` + `Suspense`
  - [x] 4.3 Verified: Vite emits `AdminPage-*.js` as separate chunk (0.47 kB) — admin bundle never loaded for non-admin

- [x] **Task 5: Frontend — Axios 401 interceptor**
  - [x] 5.1 `api.ts` exports `setAuthHandlers({ logout, navigate })` — response interceptor uses these on 401
  - [x] 5.2 `AuthInterceptorSetup` component (renders null) inside router — calls `setAuthHandlers` on mount via `useNavigate` + `useAuth`
  - [x] 5.3 `RootLayout` in `main.tsx` renders `<AuthInterceptorSetup />` + `<Outlet />` as the root element

## Dev Notes

### AuthEntryPoint

Standard Spring `AuthenticationEntryPoint` — called when unauthenticated request hits secured endpoint.
Returns JSON `{ "status": 401, "error": "UNAUTHORIZED", "message": "Authentication required" }`.
Wired via `.exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))` in SecurityConfig.

### @EnableMethodSecurity

Must be on SecurityConfig (or any `@Configuration` class). Enables `@PreAuthorize` processing.
`hasRole('ADMIN')` matches authority `ROLE_ADMIN` (Spring prepends `ROLE_` automatically).

### Test Pattern

`@WebMvcTest` tests require explicit import of all config classes that `SecurityConfig` depends on:
`@Import({SecurityConfig.class, GlobalExceptionHandler.class, JwtAuthFilter.class, AuthEntryPoint.class})`
Plus `@MockitoBean` for `JwtService` and `UserDetailsServiceImpl`.
`@WithMockUser(roles = "USER")` sets security context directly, bypassing JWT filter.

### Axios 401 Interceptor Pattern

`AuthProvider` is outside `RouterProvider` → cannot call `useNavigate()` directly.
Solution: `AuthInterceptorSetup` component inside the router calls `setAuthHandlers` with `useNavigate` and `logout`.
`RootLayout` wraps all routes and renders `AuthInterceptorSetup` + `Outlet`.

### Admin Lazy Loading

`React.lazy(() => import('./pages/AdminPage'))` — Vite code-splits into `AdminPage-*.js`.
`ProtectedRoute adminOnly` redirects to `/` BEFORE rendering the `Suspense`/lazy boundary → chunk never fetched.

## Dev Agent Record

### Implementation Plan

1. AuthEntryPoint + @EnableMethodSecurity + UserController → 2. AdminController + AccessDenied handler → 3. Tests → 4. ProtectedRoute + lazy admin → 5. Axios interceptor + AuthInterceptorSetup

### Debug Log

- `jwt()` from `SecurityMockMvcRequestPostProcessors` requires `spring-security-oauth2-resource-server` — not in pom. Switched to `@WithMockUser` which works without OAuth2 dependency
- `AuthControllerTest` missing `JwtAuthFilter.class` and `AuthEntryPoint.class` in `@Import` after SecurityConfig was updated to require these beans — added to all controller test imports
- `AuthProvider` outside router means `useNavigate()` unavailable there → solved with `AuthInterceptorSetup` component inside router that calls `setAuthHandlers`

### Completion Notes

✅ AC1: No JWT → `AuthEntryPoint.commence()` → JSON `{"status":401}` — covered by `UserControllerTest.getMe_withoutToken_returns401()`
✅ AC2: USER role → `@PreAuthorize("hasRole('ADMIN')")` throws `AccessDeniedException` → `GlobalExceptionHandler` → JSON `{"status":403}` — covered by `AdminControllerTest.adminPing_withUserRole_returns403()`
✅ AC3: `/admin/*` route uses `React.lazy(AdminPage)` in separate chunk; `ProtectedRoute adminOnly` redirects before Suspense triggers load — verified in build output: `AdminPage-*.js` = 0.47 kB chunk
✅ AC4: `api.ts` response interceptor on 401: `localStorage.removeItem(TOKEN_KEY)`, `_handlers.logout()`, `_handlers.navigate('/login')`
✅ AC5: `GET /api/users/me` with valid auth → `{ id, email, displayName, role }` — covered by `UserControllerTest.getMe_withValidUser_returnsUserInfo()`

**Tests: 20/20 pass** (1 context, 2 UserController, 6 AuthController, 2 AdminController, 4 AuthService, 5 JwtService)

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/config/AuthEntryPoint.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/config/SecurityConfig.java` (modified — @EnableMethodSecurity, AuthEntryPoint wired)
- `aquawiki-backend/src/main/java/com/aquawiki/config/GlobalExceptionHandler.java` (modified — AccessDeniedException handler)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/UserController.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/AdminController.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/UserDto.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/UserControllerTest.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/AdminControllerTest.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/AuthControllerTest.java` (modified — added JwtAuthFilter, AuthEntryPoint imports)

**Frontend:**
- `aquawiki-frontend/src/components/ProtectedRoute.tsx` (new)
- `aquawiki-frontend/src/components/AuthInterceptorSetup.tsx` (new)
- `aquawiki-frontend/src/pages/AdminPage.tsx` (new)
- `aquawiki-frontend/src/services/api.ts` (modified — setAuthHandlers, response interceptor)
- `aquawiki-frontend/src/main.tsx` (modified — RootLayout, lazy AdminPage, ProtectedRoute wrapping)

## Change Log

- 2026-05-15: Story 1.4 implemented — RBAC complete
  - Backend: AuthEntryPoint (JSON 401), @EnableMethodSecurity, UserController (/me), AdminController (@PreAuthorize), AccessDeniedException → 403
  - Frontend: ProtectedRoute (auth + admin guard), React.lazy AdminPage, Axios 401 interceptor via AuthInterceptorSetup
  - Tests: 20/20 pass
