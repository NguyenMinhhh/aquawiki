---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
releaseMode: phased
inputDocuments:
  - docs/aquawiki-functional-spec.md
workflowType: 'prd'
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 1
classification:
  projectType: web_app
  domain: aquarium_hobbyist_consumer
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - AquaWiki
**Date:** 2026-05-14

## Executive Summary

AquaWiki is a Vietnamese-language web platform for aquarium hobbyists that replaces fragmented Google searches and Facebook group advice with an integrated decision-support tool. The platform enables users to validate species compatibility, calculate tank bioload, and assess filtration requirements **before** purchasing fish or configuring a tank — shifting the point of intervention from after-the-mistake to before-the-decision.

**Target Users:**
- **Beginners** who lack the domain knowledge to evaluate whether fish species can coexist, and face costly mistakes (fish death, ammonia spikes) from uninformed purchases
- **Experienced hobbyists** who simulate new tank configurations before committing to purchases
- **Content administrators** who maintain the species and equipment database

**Problem Being Solved:** The Vietnamese aquarium hobbyist community has no integrated, Vietnamese-language tool for compatibility and tank planning. Users rely on scattered sources (Facebook groups, Google searches, English-language resources) that deliver information after the decision is made — after the fish are already home. AquaWiki intervenes at the point of decision.

**Core Differentiator:** Timing of intervention. AquaWiki catches incompatible combinations (aggressive vs. peaceful species, pH/temperature mismatches, insufficient filtration) before purchase, not after. It is a compatibility and planning engine with encyclopedic data behind it — not an encyclopedia with a search box.

**Core Insight:** The problem is not a lack of information — it is that information arrives too late. Every feature (Tank Simulator, Smart Compatibility Engine, real-time bioload calculation) serves one purpose: making the right decision possible at the moment it matters.

**Market Opportunity:** The Vietnamese aquarium hobbyist community is in rapid growth. No Vietnamese-language tool addresses this decision-support gap. Existing alternatives (AqAdvisor, Seriously Fish, FishBase) are English-only, fragmented, and lack the computational features AquaWiki provides.

## Project Classification

| Attribute | Value |
|---|---|
| **Project Type** | Web Application (React SPA + Spring Boot REST API) |
| **Domain** | Aquarium Hobbyist / Niche Consumer |
| **Complexity** | Medium — algorithmically non-trivial (Compatibility Engine, bioload calculation, real-time warnings); no regulatory requirements |
| **Project Context** | Greenfield — new product, no existing codebase |
| **UI Language** | Vietnamese |
| **Documentation Language** | English |
| **Technology Stack** | ReactJS, TailwindCSS, Java Spring Boot, Spring Security (JWT), MySQL 8 |

## Success Criteria

### User Success

- **Zero-friction onboarding:** A first-time user adds species to the Tank Simulator and receives a compatibility warning within 2 minutes, without reading documentation or a tutorial.
- **Return engagement:** Users return to simulate alternative configurations or share setups — indicating the tool solved a real planning need, not just curiosity.
- **Discoverable encyclopedia:** Species search and filter yields relevant results without requiring knowledge of scientific names.

### Business Success

- **Portfolio completeness:** All MVP core features are demonstrable end-to-end — no stubs, no placeholder data.
- **Code quality:** Architecture is clean and well-structured for CV presentation — separation of concerns, documented REST API, meaningful test coverage on the Compatibility Engine.
- **No monetization target:** Success is defined by technical and product completeness, not revenue or user growth.

### Technical Success

- **Compatibility Engine:** Group compatibility checks for 5–10 species return correct results in under 2 seconds.
- **Mobile responsiveness:** Core flows (species browse, tank simulation, compatibility check) are usable on a mobile browser without horizontal scrolling or broken layouts.
- **Auth security:** JWT tokens are properly validated; role-based access (USER vs ADMIN) is enforced at the API level.

### Measurable Outcomes

| Metric | Target |
|---|---|
| Time to first compatibility warning (new user) | < 2 minutes |
| Compatibility Engine response time (group of 5–10 species) | < 2 seconds |
| MVP feature completeness | 100% of defined MVP features demonstrable |
| Mobile usability | Core flows functional on 375px viewport |

## Product Scope

### MVP — Minimum Viable Product

| Module | Features Included |
|---|---|
| **Auth** | Register (email + password), Login, Logout |
| **Species Encyclopedia** | Species list (grid), search, filter (group/size/pH/temp/difficulty), species detail page |
| **Tank Simulator** | Dimensions → volume, add species with quantity, real-time bioload %, compatibility warnings (red/yellow/green), 2D visualization |
| **Compatibility Engine** | Compatibility matrix data model, pair + group compatibility check API |
| **Admin** | Species CRUD (add/edit/delete), image upload |

**2D Visualization (MVP):** Rectangular canvas proportional to tank dimensions. Species shown as icons with quantity labels. Tank border color reflects overall warning status (green / yellow / red). No animation or drag-and-drop. Maximum 10 species icons displayed; overflow shown as "+N more."

### Growth Features (Post-MVP)

- Species bookmarks and personal favorites list
- Species comparison table (2–3 species side-by-side)
- Save and reload tank configurations (backend persistence)
- Species suggestion engine and detailed warning explanations
- Personal tank management dashboard (My Tanks, tank log/journal)
- Full admin panel (equipment management, user management, system statistics)
- Utility tools: unit converter (cm/inch, litre/gallon, °C/°F), global search, in-app notifications

### Vision (Future)

- Real-time threshold alerts when tank parameters are at risk
- Community sharing of tank configurations (public profiles, shareable links)
- Mobile application (iOS/Android)
- AI-assisted species recommendation

## User Journeys

### Journey 1: Minh — The Bewildered Beginner *(Primary User — Success Path)*

Minh, 22 tuổi, vừa mua bể cá đầu tiên sau khi xem video YouTube về cá cảnh. Hôm qua anh đến cửa hàng và mua 5 con cá dựa trên ngoại hình: 1 con Betta đỏ đẹp, 3 con Guppy vây dài, 2 con cá neon. Tối về thả vào bể, sáng dậy thấy 2 con Guppy đã chết và Betta đang cắn con còn lại.

Anh lên Facebook group hỏi, một thành viên gửi link AquaWiki.

Minh mở Tank Simulator. Không có hướng dẫn — anh tự nhập: 60cm × 30cm × 35cm. Hệ thống tính ngay: **63 lít**. Anh thêm cá từng loài: Betta × 1, Guppy × 3, Neon Tetra × 2.

Ngay lập tức bảng cảnh báo đỏ xuất hiện: **"Betta + Guppy: RỦI RO CAO — Betta có tính lãnh thổ với các loài cá có vây dài và màu sắc tương tự."** Anh nhìn màn hình và hiểu ra điều mình đã làm sai.

Anh xóa Guppy khỏi hồ mô phỏng. Cảnh báo chuyển xanh. Anh tìm kiếm loài thay thế — lọc theo "cá hiền, size nhỏ" — và thêm thử Corydoras. Xanh hoàn toàn. Bioload 45% — ổn.

Lần tới ra cửa hàng, Minh mở AquaWiki trước khi cầm cá lên hỏi giá. Không có con cá nào chết nữa.

**Capabilities revealed:** Tank Simulator input flow, compatibility warning display, species search + filter, bioload calculation, real-time warning update on species add/remove.

---

### Journey 2: Lan — The Deliberate Planner *(Primary User — Power User Path)*

Lan, 30 tuổi, chơi cá cảnh được 5 năm. Cô đang lên kế hoạch bể biotope 200L mới — Amazon region — và muốn tối ưu trước khi chi tiền.

Cô mở AquaWiki và tạo 3 cấu hình khác nhau trong một buổi tối:
- **Config A:** Cardinal Tetra × 20, Discus × 4 → Bioload 92% — quá tải. Cảnh báo vàng.
- **Config B:** Cardinal Tetra × 15, Apistogramma × 2, Corydoras × 6 → Bioload 68%, tất cả xanh.
- **Config C:** Altum Angelfish × 3, Cardinal Tetra × 12 → Xung đột nhiệt độ (Altum cần 29-32°C, Tetra tối ưu 24-26°C). Cảnh báo đỏ.

Lan chọn Config B. Cô screenshot bảng thông số và gửi vào group Discord của mình để hỏi ý kiến.

**Capabilities revealed:** Multiple simulation sessions, bioload percentage display, temperature conflict detection, shareable config view.

---

### Journey 3: Tuấn — The Content Admin *(Admin User Path)*

Tuấn là admin nội dung, được giao nhiệm vụ cập nhật database khi có loài nhập mới về thị trường Việt Nam.

Hôm nay anh cần thêm "Red Crystal Shrimp" — loài tép vừa xuất hiện nhiều ở các shop. Anh đăng nhập bằng tài khoản ADMIN, vào trang Quản lý Loài.

Anh điền form: tên thường "Tép Crystal Đỏ", tên khoa học *Caridina cantonensis*, pH 6.0–6.8, nhiệt độ 18–24°C, nhóm "tép", hành vi "hiền — không ăn cá", bioload factor 0.3. Anh upload ảnh từ máy tính.

Lưu. Ngay sau đó, Minh ở bể cá đang tìm "tép" trên AquaWiki — và Red Crystal Shrimp xuất hiện trong kết quả tìm kiếm.

Tuấn cũng vào Compatibility Matrix để thêm rule: Tép Crystal + cá ăn tạp/dữ = xung đột.

**Capabilities revealed:** Admin species CRUD, image upload, compatibility matrix management, role-based access control.

---

### Journey 4: Hùng — The Edge Case *(Error Recovery Path)*

Hùng nhập kích thước hồ: 600 × 300 × 350 (anh nhập mm thay vì cm). Hệ thống tính: **63.000 lít** — tương đương bể thủy cung. Anh thêm 5 con cá: bioload hiển thị 0.003% — con số vô nghĩa.

Hùng nhìn lại form, nhận ra lỗi. Anh sửa về 60 × 30 × 35 cm. Hệ thống tính lại ngay: **63 lít**, bioload cập nhật thực tế. Không cần reload trang, không mất dữ liệu loài đã chọn.

**Capabilities revealed:** Real-time recalculation on dimension change, input validation (min/max bounds), preservation of species selection state during recalculation.

---

### Journey Requirements Summary

| Capability Area | Revealed By |
|---|---|
| Tank dimension input + volume calculation | Journey 1, 4 |
| Species search, filter, add to simulation | Journey 1, 2 |
| Real-time bioload calculation | Journey 1, 2, 4 |
| Compatibility warning engine (pair + group) | Journey 1, 2 |
| Parameter conflict detection (temp, pH) | Journey 2 |
| Admin species CRUD + image upload | Journey 3 |
| Compatibility matrix management (admin) | Journey 3 |
| Role-based access (USER vs ADMIN) | Journey 3 |
| State preservation on input correction | Journey 4 |

## Domain-Specific Requirements

### Data Accuracy & Integrity

In the aquarium hobbyist domain, incorrect species data has direct consequences — wrong compatibility ratings lead to fish deaths and wasted money. Data quality is the primary domain risk.

**Data Sourcing Strategy:**
- Initial seed data manually curated from authoritative sources: Seriously Fish, FishBase, and Vietnamese aquarium community knowledge
- All new species entries require Admin review and approval before becoming visible to users — no auto-publish
- Users can flag species data as potentially incorrect via a report/flag mechanism; flagged entries are queued for Admin review
- No direct community editing of species data (wiki-style editing excluded to prevent vandalism)

**Compatibility Matrix Integrity:**
- Compatibility rules are admin-managed only — not user-editable
- Matrix changes apply immediately and affect all simulations on next load

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| Incorrect compatibility data misleads users | Admin-review gate + user flag mechanism |
| Seed data gaps for Vietnam-specific species | Community-sourced additions via admin-reviewed submissions |
| Admin account compromise | Strong password policy + JWT expiry for admin sessions |
| Bioload formula inaccuracy | Formula documented; edge cases (0 fish, 0 volume) handled with input validation |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Market Gap + Localization**
AquaWiki is the first integrated aquarium planning tool for the Vietnamese hobbyist community. Existing tools (AqAdvisor, Seriously Fish, FishBase) are English-only, fragmented, and lack computational features Vietnamese users need. This is market positioning innovation: capabilities that exist separately in the English-speaking world, unified and localized for a high-growth, underserved audience.

**2. Prevention-First UX Paradigm**
Most aquarium resources follow an encyclopedia model — users look up information after deciding what to buy. AquaWiki inverts this: compatibility checking and bioload validation are the primary interaction. The system answers "can I do this?" before the user commits to "I will do this."

**3. Vertical Integration of Separated Tools**
Species database, bioload calculator, and compatibility checker — three tools that exist independently elsewhere — are unified into a single simulation workflow. Adding a species to the simulator automatically triggers compatibility and bioload recalculation without context switching.

### Competitive Landscape

| Competitor | Strength | Gap AquaWiki Fills |
|---|---|---|
| AqAdvisor | Bioload calculation | English-only, no species encyclopedia, no compatibility matrix |
| Seriously Fish | Deep species information | No simulation or compatibility tooling |
| FishBase | Comprehensive taxonomy | Scientific focus, not hobbyist decision-support |
| Facebook Groups | Local Vietnamese knowledge | No structured tool, inconsistent advice |

### Validation Approach

- **Prevention value:** Validated when users engage with compatibility warnings before finalizing a species selection (warning shown → species removed/changed)
- **Market fit:** Validated when returning users create multiple simulations — not one-time lookup behavior
- **Integration value:** Validated when users traverse encyclopedia → simulator within the same session

## Web Application Specific Requirements

### Platform Overview

AquaWiki is a Single-Page Application (SPA) with React Router client-side routing. The Spring Boot backend exposes a REST API consumed exclusively by the frontend. No SSR, pre-rendering, or SEO optimization is required for this portfolio scope.

### Browser Matrix

| Browser | Support Level |
|---|---|
| Chrome (latest 2 versions) | Full support |
| Firefox (latest 2 versions) | Full support |
| Edge (latest 2 versions) | Full support |
| Safari iOS (latest) | Basic — functional, not optimized |
| Internet Explorer | Not supported |

### Technical Architecture Decisions

- **State management:** React component state + Context API for auth state; no Redux at MVP scope
- **API communication:** Axios with interceptors for JWT token attachment and 401 handling
- **Styling:** TailwindCSS utility classes; no custom CSS framework
- **JWT storage:** localStorage for MVP scope (httpOnly cookie preferred for production hardening)
- **Image handling:** Static file serving or simple upload endpoint; no CDN at MVP scale
- **Routing:** React Router v6 with protected routes; redirect to login if no valid JWT
- **Admin routes:** Lazy-loaded; not bundled unless ADMIN role is detected
- **Tank Simulator state:** Session-only in MVP — not persisted to backend

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Problem-solving MVP — deliver the core prevention value (compatibility check + bioload calculation) end-to-end. The MVP is "useful" the moment a user runs a tank simulation and receives a meaningful warning.

**Constraints:** Solo developer. Backend API stability precedes frontend complexity. Compatibility Engine data model precedes visualization layer.

**Journeys Supported in MVP:**
- Journey 1 (Bewildered Beginner): Fully supported
- Journey 3 (Content Admin): Fully supported
- Journey 2 (Experienced Planner): Partially — multi-session simulation is manual; tank config save/load is Growth phase

### Implementation Risk Mitigation

**Technical Risks:**

| Risk | Likelihood | Mitigation |
|---|---|---|
| Compatibility Engine group-check complexity | Medium | Build and validate pair-check API first; extend to group check once pair logic is proven |
| 2D visualization edge cases (many species, long names) | Low | Cap at 10 species icons; show "+N more" for overflow |
| JWT misconfiguration | Low | Use Spring Security defaults; validate expiry and role claims on every protected route |

**Resource Risks (Solo Developer):**

| Risk | Mitigation |
|---|---|
| Underestimating Compatibility Engine time | Seed and validate compatibility matrix data before writing Engine logic |
| Frontend/backend integration friction | Define REST API contract (endpoint + response schema) before writing React components |
| Scope creep | All Growth features deferred explicitly; new ideas go to backlog, not MVP |

## Functional Requirements

> All FRs define the complete capability set. MVP subset is defined in Product Scope. Non-MVP FRs are Growth or Vision phase.

### User Account Management

- **FR1:** Unregistered visitors can create an account using an email address and password
- **FR2:** Registered users can authenticate using email and password and receive a session token
- **FR3:** Authenticated users can terminate their current session
- **FR4:** Authenticated users can request a password reset link via their registered email address
- **FR5:** Authenticated users can update their profile information (display name, avatar image, password)
- **FR6:** The system assigns one of two roles to each user (USER or ADMIN) and enforces role-appropriate access throughout the application

### Species Encyclopedia

- **FR7:** Visitors can browse a paginated list of aquatic species spanning fish, shrimp, snails, and aquatic plants
- **FR8:** Visitors can search species by common name, scientific name, or keyword
- **FR9:** Visitors can filter the species list by behavioral category (aggressive/peaceful), body size, pH range, temperature range, and care difficulty level
- **FR10:** Visitors can view a full species detail page including representative image, scientific name, natural habitat parameters (pH, temperature, hardness), feeding behavior, adult size, and social behavior traits
- **FR11:** Authenticated users can bookmark species to a personal favorites list for quick retrieval
- **FR12:** Authenticated users can select 2–3 species to view a side-by-side parameter comparison table

### Tank Simulation

- **FR13:** Users can input tank dimensions (length × width × height in cm) and the system calculates and displays total volume in liters
- **FR14:** Users can add aquatic species to a simulated tank with a specified quantity
- **FR15:** Users can remove species from the simulated tank
- **FR16:** The system recalculates bioload percentage in real time whenever species, quantities, or tank dimensions change — without losing the current species selection state
- **FR17:** The system displays a 2D visual representation of the simulated tank showing species presence and quantity, with an overall status indicator (green / yellow / red) based on compatibility and bioload state
- **FR18:** Authenticated users can save a named tank simulation configuration for later retrieval
- **FR19:** Authenticated users can load a previously saved tank simulation configuration into the simulator

### Compatibility & Warning Engine

- **FR20:** The system evaluates compatibility between every pair of species in the current simulation and identifies conflicts
- **FR21:** The system evaluates compatibility across all species in the simulation simultaneously and returns a consolidated conflict list
- **FR22:** The system displays compatibility warnings in real time as species are added to or removed from the simulation
- **FR23:** Compatibility warnings are categorized by severity: red (critical — likely injury or death), yellow (caution — manageable with care), green (compatible)
- **FR24:** The system detects and flags parameter conflicts between species, including temperature range incompatibility and pH range incompatibility
- **FR25:** Each compatibility warning includes a brief plain-language explanation of the conflict reason
- **FR26:** The system suggests species compatible with the current tank composition based on existing species parameters

### Content Administration

- **FR27:** Administrators can create new species records, including all habitat parameters, behavioral traits, care difficulty rating, and species categorization
- **FR28:** Administrators can edit existing species records
- **FR29:** Administrators can delete species records
- **FR30:** Administrators can upload and replace the representative image for a species
- **FR31:** New species records require administrator review and approval before becoming visible to non-admin users
- **FR32:** Administrators can manage compatibility matrix entries — adding, editing, and removing species pair compatibility rules
- **FR33:** Administrators can manage aquarium equipment records (filters, lighting units, heaters) including performance specifications
- **FR34:** Administrators can view the user account list and deactivate or reactivate individual accounts
- **FR35:** Administrators can view system-wide statistics including total user count, most-viewed species, and total tank simulations created

### Data Quality & Reporting

- **FR36:** Authenticated users can flag a species record as potentially inaccurate, which creates a review task for administrators
- **FR37:** Administrators can review flagged species records, assess reported inaccuracies, and update or dismiss the flag

### Personal Tank Management

- **FR38:** Authenticated users can create named tank records with dimensions, a description, and a linked species composition
- **FR39:** Authenticated users can view all their saved tank records from a personal dashboard showing key health indicators (bioload, compatibility status)
- **FR40:** Authenticated users can edit the parameters and species composition of a saved tank record
- **FR41:** Authenticated users can delete a saved tank record
- **FR42:** Authenticated users can log tank maintenance and care events (water change, new species addition, illness treatment) on a per-tank chronological timeline

### Utility & Discovery

- **FR43:** Users can convert aquarium measurements between metric and imperial units (cm/inch, litre/gallon, °C/°F)
- **FR44:** Users can search across species, equipment records, and personal tank records from a single global search interface
- **FR45:** Authenticated users receive in-app notifications when a saved tank's bioload or compatibility parameters exceed defined safe thresholds

### Prioritized Features — 2026-06-24 Course Correction

> Added via Sprint Change Proposal (`sprint-change-proposal-2026-06-24.md`). These two capabilities are now **top priority active scope**. The remaining Growth/Vision FRs (FR11, FR12, FR18, FR19, FR26, FR33, FR34, FR35, FR43, FR44, and the non-minimal parts of FR38–FR42, FR45) are **deferred indefinitely** per owner decision — not deleted.

**Personal Tanks & Water Change Reminders (in-app):**

- **FR46:** Authenticated users can create, view, edit, and delete a saved tank record (name, dimensions/volume, optional species composition). *(Minimal persistence subset of FR38/FR39, promoted from Growth — required to anchor a water-change schedule.)*
- **FR47:** Authenticated users can configure a water-change schedule for a saved tank (interval in days + last-change date); the system computes the next-due date.
- **FR48:** The system surfaces an in-app reminder when a tank's water change is due or overdue. *(In-app channel only; concretizes FR45 for the water-change case.)*
- **FR49:** Authenticated users can mark a water change as completed, which logs the event on the tank timeline and resets the next-due date. *(Subset of FR42.)*

**AI Species Identification:**

- **FR50:** Authenticated users can upload a **fish** photo and receive a ranked list of candidate **fish** species from the AquaWiki database, each with a confidence indicator, with graceful handling of no-match / low-confidence results. *(Promoted from Vision. Provider decided via Technical Research 2026-06-24: **Fishial.AI** — free, fish-specialized. Scope is **fish only**; shrimp/snails/plants are excluded. Claude vision kept as optional paid future augmentation behind the same `SpeciesRecognitionService` interface.)*
- **FR51:** Users can navigate from an AI identification result to the corresponding species detail page.

## Non-Functional Requirements

### Performance

| Metric | Target | Rationale |
|---|---|---|
| First Contentful Paint (4G) | < 3 seconds | Fast initial render required for zero-friction onboarding |
| Time to Interactive — Tank Simulator page | < 4 seconds | Delay breaks the 2-minute onboarding success target |
| Compatibility Engine API response (5–10 species) | < 2 seconds | Real-time warning feedback depends on this |
| Lighthouse Performance Score | ≥ 75 | Portfolio quality baseline |
| Species list API response (with filters) | < 1 second | High-frequency user action |

### Security

| Requirement | Specification |
|---|---|
| Password storage | BCrypt, minimum cost factor 10 |
| Session token | JWT, stateless, 24-hour expiry |
| Token transmission | HTTPS only |
| Role enforcement | ADMIN role validated server-side on every protected endpoint; frontend role check alone is insufficient |
| Input validation | Server-side validation on all inputs; SQL injection and XSS sanitized at API boundary |
| Image upload | MIME type validation (images only); maximum file size enforced server-side |

### Accessibility

| Requirement | Specification |
|---|---|
| Text contrast ratio | ≥ 4.5:1 for body text; ≥ 3:1 for large text (≥ 18pt or 14pt bold) |
| Keyboard navigation | Primary flows (species search, species add to simulator, login/register) operable without mouse |
| Form labels | All inputs have associated visible labels or aria-label attributes |
| Error communication | Error states communicated via text, not color alone |

### Reliability

| Requirement | Specification |
|---|---|
| Data integrity | No corruption on concurrent read/write to species or compatibility matrix tables |
| Graceful degradation | Compatibility Engine failure displays an error state — never silently shows incorrect results |
| Input boundary handling | Tank Simulator handles edge cases without crash: 0 species, 0 volume, overflow beyond 10 icons shown as "+N more" |
| Mobile layout | Core flows functional on 375px viewport without horizontal scrolling |
