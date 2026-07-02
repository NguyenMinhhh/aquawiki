---
story_key: 1-3-user-login-session
epic: 1
story: 3
status: review
created: 2026-05-15
completed: 2026-05-15
---

# Story 1.3: User Login & Session Management

**As a** registered user,
**I want** to log in with my email and password and stay logged in across page refreshes,
**So that** I can access my account without re-authenticating on every visit.

## Acceptance Criteria

**AC1 — Login API:**
**Given** a registered user submits valid credentials on the Login page
**When** `POST /api/auth/login` is called
**Then** the API returns HTTP 200 with `{ "token": "<jwt>", "user": { "id", "email", "displayName", "role" } }` and the JWT has a 24-hour expiry

**AC2 — Token Storage & AuthContext:**
**Given** a successful login response
**When** the frontend receives the token
**Then** the JWT is stored in `localStorage` under key `aquawiki_token`, and `AuthContext` is updated with user info (id, email, displayName, role)

**AC3 — Session Persistence:**
**Given** the user refreshes the browser
**When** the app initializes
**Then** the JWT is read from `localStorage`, validated (not expired), and `AuthContext` is restored — the user remains logged in

**AC4 — Invalid Credentials:**
**Given** a user submits incorrect credentials
**When** `POST /api/auth/login` is called
**Then** the API returns HTTP 401 with the standard error envelope and no token is stored

**AC5 — Logout:**
**Given** an authenticated user clicks Logout
**When** the logout action is triggered
**Then** the JWT is removed from `localStorage`, `AuthContext` is cleared, and the user is redirected to `/login`

## Tasks/Subtasks

- [x] **Task 1: JWT Service (backend)**
  - [x] 1.1 Create `JwtService` — generateToken(User): 24h expiry, validateToken(String), extractEmail(String)
  - [x] 1.2 Add `jwt.secret` and `jwt.expiration-ms` to `application-dev.properties`

- [x] **Task 2: JWT Filter + Security update**
  - [x] 2.1 Create `JwtAuthFilter extends OncePerRequestFilter` — extract Bearer token, validate, set SecurityContext
  - [x] 2.2 Create `UserDetailsServiceImpl implements UserDetailsService` — load user by email from UserRepository
  - [x] 2.3 Update `SecurityConfig` — add JwtAuthFilter before UsernamePasswordAuthenticationFilter, expose AuthenticationManager bean, DaoAuthenticationProvider

- [x] **Task 3: Login endpoint**
  - [x] 3.1 Create `LoginRequest` DTO (email, password)
  - [x] 3.2 Create `AuthResponse` DTO `{ token, user: { id, email, displayName, role } }`
  - [x] 3.3 Implement `AuthService.login()` — authenticate, generate JWT, return AuthResponse
  - [x] 3.4 Add `POST /api/auth/login` to `AuthController`

- [x] **Task 4: Backend tests**
  - [x] 4.1 `JwtServiceTest` — 5 tests: generate, validateValid, validateInvalid, extractEmail, expired token
  - [x] 4.2 `AuthServiceTest` — updated: valid login returns token, bad credentials throws 401
  - [x] 4.3 `AuthControllerTest` — added: login 200 with token+user, login 401 on bad credentials

- [x] **Task 5: AuthContext + LoginPage (frontend)**
  - [x] 5.1 Create `AuthContext` (id, email, displayName, role, login(), logout()) in `src/context/AuthContext.tsx`
  - [x] 5.2 `AuthProvider` — on mount decode JWT from localStorage, restore context if not expired
  - [x] 5.3 Wrap router in `AuthProvider` in `main.tsx`
  - [x] 5.4 Complete `LoginPage` form — call `POST /api/auth/login`, store token, update AuthContext, navigate to `/`
  - [x] 5.5 `logout()` — clears localStorage, clears context; `App.tsx` Logout button navigates to `/login`

## Dev Notes

### JWT Implementation (jjwt 0.12.6)

Uses `Jwts.builder().subject().claim().issuedAt().expiration().signWith(secretKey).compact()`.
Parse: `Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload()`.
Secret: 256-bit base64 stored in `application-dev.properties` as `jwt.secret`.

### Security Config

`DaoAuthenticationProvider` wired with `UserDetailsServiceImpl` + `BCryptPasswordEncoder(10)`.
`AuthenticationManager` exposed as bean for injection into `AuthService`.
`JwtAuthFilter` added before `UsernamePasswordAuthenticationFilter`.

### Frontend JWT Decode

No library — split token on `.`, `atob()` middle segment, parse JSON. Expiry check: `payload.exp * 1000 > Date.now()`.

### From Story 1.2

- `AuthControllerTest` needs `@MockitoBean JwtService` and `@MockitoBean UserDetailsServiceImpl` in addition to security import, because `SecurityConfig` and `JwtAuthFilter` require these beans in web layer context.
- `authenticate()` on `AuthenticationManager` mock returns `Authentication` (not void) — use `when(...).thenReturn(mock(Authentication.class))` not `doNothing()`.

## Dev Agent Record

### Implementation Plan

1. JwtService + properties → 2. JwtAuthFilter + UserDetailsServiceImpl + SecurityConfig → 3. DTOs + AuthService.login() + AuthController → 4. Tests → 5. AuthContext + LoginPage + logout

### Debug Log

- `doNothing().when(authManager).authenticate()` failed — `authenticate()` returns `Authentication`, must use `when(...).thenReturn(mock(Authentication.class))`
- `AuthControllerTest` needed `@MockitoBean JwtService` + `@MockitoBean UserDetailsServiceImpl` because `SecurityConfig` is imported and `JwtAuthFilter` is a `@Component` requiring these
- `application-test.properties` missing `jwt.secret` — added so `@SpringBootTest` context loads correctly

### Completion Notes

✅ AC1: `POST /api/auth/login` returns `{ token, user: { id, email, displayName, role } }`, JWT expiry 24h — covered by `AuthControllerTest` + `AuthServiceTest`
✅ AC2: `LoginPage` calls login API, stores token in `localStorage['aquawiki_token']`, updates `AuthContext` — TypeScript build pass
✅ AC3: `AuthProvider.useEffect` on mount reads token from localStorage, validates expiry via `isTokenValid()`, restores `AuthContext.user`
✅ AC4: Bad credentials → `AuthenticationManager` throws `BadCredentialsException` → `AuthService` catches → `ResponseStatusException(401)` → `GlobalExceptionHandler` → HTTP 401 with error envelope — covered by tests
✅ AC5: `logout()` removes `aquawiki_token` from localStorage, sets user=null, App.tsx Logout button navigates to `/login`

**Tests: 16/16 pass** (5 JwtService, 4 AuthService, 6 AuthController, 1 context)

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/service/JwtService.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/UserDetailsServiceImpl.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/AuthService.java` (modified — added login())
- `aquawiki-backend/src/main/java/com/aquawiki/config/JwtAuthFilter.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/config/SecurityConfig.java` (modified — added filter, AuthProvider, AuthManager)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/LoginRequest.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/dto/AuthResponse.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/controller/AuthController.java` (modified — added /login)
- `aquawiki-backend/src/main/resources/application-dev.properties` (modified — added jwt.secret, jwt.expiration-ms)
- `aquawiki-backend/src/test/java/com/aquawiki/service/JwtServiceTest.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/service/AuthServiceTest.java` (modified — added login tests)
- `aquawiki-backend/src/test/java/com/aquawiki/controller/AuthControllerTest.java` (modified — added login tests, JwtService/UserDetailsServiceImpl mocks)
- `aquawiki-backend/src/test/resources/application-test.properties` (modified — added jwt.secret, jwt.expiration-ms)

**Frontend:**
- `aquawiki-frontend/src/context/AuthContext.tsx` (new)
- `aquawiki-frontend/src/main.tsx` (modified — AuthProvider wrap)
- `aquawiki-frontend/src/pages/LoginPage.tsx` (modified — full login form with AuthContext)
- `aquawiki-frontend/src/App.tsx` (modified — user display + logout button)

## Change Log

- 2026-05-15: Story 1.3 implemented — JWT login & session management complete
  - Backend: JwtService (jjwt 0.12.6), JwtAuthFilter, UserDetailsServiceImpl, login endpoint
  - Frontend: AuthContext with persist-on-refresh, LoginPage, logout flow
  - Tests: 16/16 pass
