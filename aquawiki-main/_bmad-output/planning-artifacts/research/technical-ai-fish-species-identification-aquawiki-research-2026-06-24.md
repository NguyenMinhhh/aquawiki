---
stepsCompleted: [1, 2, 3, 4, 5, 6]
lastStep: 6
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-24.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: 'research'
research_type: 'technical'
research_topic: 'AI Fish Species Identification from Photo (AquaWiki Story 7.0)'
research_goals: 'Select a recognition provider (external vision API vs self-hosted classification model vs third-party fish-ID API) by accuracy, cost/image, latency, Vietnamese aquarium species coverage, and integration fit with Spring Boot 3.5.14 / Java 21 / MySQL 8; define the integration contract for the SpeciesRecognitionService abstraction.'
user_name: 'NguyenMinhhh'
date: '2026-06-24'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-06-24
**Author:** NguyenMinhhh
**Research Type:** technical

---

## Research Overview

This report evaluates three approaches for AquaWiki's photo-based fish identification feature (Story 7.0): an **external vision LLM API**, a **self-hosted classification model**, and a **dedicated fish-ID API (Fishial.AI)**. Each was assessed against accuracy, cost per image, latency, Vietnamese ornamental-species coverage, and integration fit with the fixed Spring Boot 3.5.14 / Java 21 / MySQL 8 / local-filesystem stack.

> **FINAL DECISION (owner, 2026-06-24): Fishial.AI is the PRIMARY provider — zero cost — and the feature is scoped to FISH identification only** (shrimp/snails/plants are out of scope). The external vision LLM (Claude) is retained as an optional future augmentation behind the same `SpeciesRecognitionService` interface, to be enabled only if paid accuracy/coverage is needed later.

The catalog spans fish + shrimp + snails + plants (PRD FR7), but the owner has scoped the AI feature to **fish only**, which removes the non-fish coverage constraint and makes the **free, purpose-built Fishial.AI API** the best fit: no per-image cost, REST integration, fish-specialized accuracy. The full comparison and the concrete integration contract are in the Research Synthesis section below.

---

## Technical Research Scope Confirmation

**Research Topic:** AI Fish Species Identification from Photo (AquaWiki Story 7.0)
**Research Goals:** Select a recognition provider (external vision API vs self-hosted classification model vs third-party fish-ID API) and define the integration contract for the `SpeciesRecognitionService` abstraction.

**Technical Research Scope:**

- Architecture Analysis — vision-API vs self-hosted-model vs third-party-API design patterns
- Implementation Approaches — image upload, inference, candidate mapping to AquaWiki species DB
- Technology Stack — vision models/APIs, Java/Spring integration libraries
- Integration Patterns — REST/multipart contract, confidence scoring, error handling
- Performance Considerations — latency, cost per image, accuracy on curated species set

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-06-24

---

<!-- Content will be appended sequentially through research workflow steps -->

## Technology Stack Analysis

The "technology landscape" for fish-photo identification maps to **three candidate approaches**, each a distinct stack. Findings below are from current (2025–2026) web sources with confidence levels noted.

### Approach 1 — External Vision LLM API (Claude / GPT-4o / Gemini)

A general-purpose multimodal LLM receives the user's photo **plus the AquaWiki species list** (names + distinguishing traits) in the prompt, and returns the best-matching species as structured output.

- **Pricing (token-based, per 1M tokens, 2026):** GPT-4o input ≈ $2.50 / output $10; Claude Sonnet 4.6 ≈ $3 / $15; Gemini 2.5 Pro ≈ $1.25 / $10; Gemini 2.0 Flash is the budget leader at ≈ $0.10/M input. _(Confidence: High — multiple pricing aggregators agree.)_
- **Cost per image:** Images are tokenized; a 1024×1024 image ≈ 1,000–2,000+ tokens. Practical per-call cost lands roughly **$0.01–0.04 for a GPT-4V-class API**, lower for Flash-tier models. A self-hosted LLaVA-7B comparison was ~$0.003/image. _(Confidence: Medium — varies with image size, prompt length, model tier.)_
- **VN species coverage:** No fixed species list — the LLM reasons against whatever candidate list we inject from our DB, so coverage = our DB. Strong fit for a curated, localized catalog. _(Confidence: Medium — depends on model's latent fish knowledge + prompt quality.)_
- **Integration:** Spring AI's `spring-ai-starter-model-anthropic` natively supports image input via the `Media` class (PNG/JPEG/GIF/WebP, byte arrays or HTTPS URLs) — directly compatible with our local-filesystem uploads. _Source: [Spring AI Anthropic reference](https://docs.spring.io/spring-ai/reference/api/chat/anthropic-chat.html)._
- _Sources: [LLM API Pricing 2026 — cloudidr](https://www.cloudidr.com/llm-pricing), [AI API Pricing Comparison — IntuitionLabs](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude), [Best LLM for Vision — DeployBase](https://deploybase.ai/articles/best-llm-for-vision-multimodal-api-comparison), [Claude Vision docs](https://docs.claude.com/en/docs/build-with-claude/vision)._

### Approach 2 — Self-Hosted Classification Model (EfficientNet / ViT / iNaturalist-pretrained)

Fine-tune a CNN/transformer on labeled fish images for our species set, then serve inference ourselves.

- **Accuracy benchmarks:** ViT-B/16 (ImageNet-1K pretrained) reached **71.3% top-1** on iNaturalist 2017; EfficientNetV2 achieves SOTA-efficient species ID; InternImage-H fine-tuned on iNat2018 hit **92.6%** (large-scale pretraining + 100 epochs). High accuracy is achievable **but requires substantial labeled data and training compute**. _(Confidence: High — peer-reviewed/arXiv sources.)_
- **Cost:** No per-image API fee, but needs GPU for training and (ideally) inference hosting — outside the current Spring Boot + MySQL + local-filesystem stack. _(Confidence: High.)_
- **VN species coverage:** Excellent *if* we have training images for VN aquarium species — which is the bottleneck (need a labeled image set per species). _(Confidence: High on the dependency.)_
- **Integration:** No native Java path; typically a separate Python (PyTorch/TF) inference service called over HTTP — adds a new runtime/service to operate. _(Confidence: High.)_
- _Sources: [Fishnet Open Images Database (arXiv)](https://arxiv.org/pdf/2106.09178), [iNaturalist Dataset (arXiv)](https://arxiv.org/pdf/1707.06642), [InternImage (arXiv)](https://arxiv.org/pdf/2211.05778), [Input-image size & fish classification — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1574954125005758)._

### Approach 3 — Dedicated Fish-ID API (Fishial.AI)

A purpose-built fish recognition SaaS — and notably **open-source models on GitHub**.

- **Coverage:** Fishial Recognition model **v10 identifies 865 fish species**; project goal is the largest open-source labeled fish image library. _(Confidence: High — official docs.)_
- **Output shape:** Segmentation + classification — returns JSON of detected fish with **polygons (bounding regions)** and species labels, can detect multiple fish in one photo. _(Confidence: High.)_
- **Access model:** Offers both a **REST SaaS API** and **GitHub-published AI models** (self-hostable). Specific pricing/free-tier and auth details were not exposed on the API overview page — needs direct confirmation via their Getting Started / OpenAPI spec. _(Confidence: Low on pricing — not published on the overview.)_
- **VN species coverage risk:** 865 species is broad but skewed toward angling/fisheries species; **coverage of niche Vietnamese ornamental species (Betta variants, local shrimp/snails, plants) is uncertain** and must be checked against our catalog. Plants/shrimp/snails likely **not** covered (it's a *fish* model). _(Confidence: Medium-High on the gap.)_
- _Sources: [Fishial.AI](https://www.fishial.ai/), [Fishial API docs](https://docs.fishial.ai/api), [Fishial species list](https://docs.fishial.ai/api/specieslist), [fishial/fish-identification (GitHub)](https://github.com/fishial/fish-identification)._

### Cross-Technology Analysis

| Dimension | 1. Vision LLM API | 2. Self-hosted model | 3. Fishial API/model |
|---|---|---|---|
| Time-to-first-result | **Fastest** (days) | Slowest (weeks, needs data+training) | Medium (API) / Slow (self-host) |
| Accuracy ceiling | Medium-High (prompt-dependent) | **Highest** (with data) | High for covered species |
| Cost model | Per-image API fee | Upfront GPU + ops | API fee or self-host ops |
| VN ornamental + non-fish (shrimp/snail/plant) coverage | **Flexible** (our DB drives it) | Flexible (if we have images) | **Weak** (fish-only, 865 sp.) |
| Java/Spring fit | **Native** (Spring AI `Media`) | Poor (separate Py service) | REST OK / self-host poor |
| New infra introduced | None (HTTP + API key) | GPU + Python service | None (API) / GPU (self-host) |

**Quality Assessment:** High confidence on the *integration fit* and *accuracy benchmark* dimensions; **Low confidence on Fishial pricing/VN-species coverage** (gap to close in implementation research). AquaWiki's catalog spans fish **+ shrimp, snails, plants** (PRD FR7) — a fish-only model (Approach 3) cannot cover the full catalog, an important constraint.

---

## Integration Patterns Analysis

This section defines how the chosen provider plugs into the AquaWiki Spring Boot backend behind the `SpeciesRecognitionService` abstraction (Story 7.1).

### API Design Pattern — Internal Endpoint

- **Pattern:** Single REST endpoint `POST /api/identify`, `multipart/form-data` (one image part), JWT-protected (authenticated users only, per FR50). Mirrors the existing image-upload pattern (AR10) and AquaWiki's standard API response envelope. _(Confidence: High — consistent with current architecture.)_
- **Response:** Ranked candidate list (DTO), each `{ speciesId, commonName, scientificName, confidence }`, plus a `noMatch` flag for graceful low-confidence handling (FR50). Candidates resolvable to an existing `species.id` only. _(Confidence: High.)_

### Provider Communication Protocol

- **Approach 1 (Vision LLM via Spring AI):** In-process HTTPS call through `spring-ai-starter-model-anthropic`. Image attached via `Media(MimeTypeUtils.IMAGE_JPEG, bytes)`; no separate service. _Source: [Spring AI Anthropic reference](https://docs.spring.io/spring-ai/reference/api/chat/anthropic-chat.html)._
- **Approach 3 (Fishial REST):** Outbound HTTPS to Fishial API with API-key auth; returns JSON with species + polygons. Requires a network egress + key. _Source: [Fishial API docs](https://docs.fishial.ai/api)._
- **Approach 2 (self-host):** Internal HTTP to a separate Python inference service — a new protocol boundary and deployment unit. _(Confidence: High.)_

### Data Format & The Confidence Contract (critical finding)

- **Claude Structured Outputs are GA (2026)** on Opus 4.8 / Sonnet 4.6 / Haiku 4.5 etc. Two modes: `output_format` (JSON mode) and **strict tool use** (`strict: true` + `tool_choice` forcing one tool) — guarantees schema-valid, parseable output, no prose. _Source: [Claude Structured Outputs docs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs)._
- **⚠️ Key constraint:** With strict schemas, a `confidence` field is **only produced if it is explicitly declared in the schema** — asking for it in the prompt alone yields nothing. So the candidate schema MUST declare `confidence` (e.g. `number` 0–1) per item. _Source: [Snippets Ltd — Structured Outputs validation](https://snippets.ltd/blog/structured-outputs-with-claude-json-schemas-validation-retry-loops), [claudeapi.com JSON Schema guide 2026](https://claudeapi.com/en/blog/dev-guides/claude-structured-outputs-json-schema-guide-2026/)._
- **Implication for the abstraction:** `SpeciesRecognitionService.identify(image) → List<SpeciesMatch{speciesId, confidence}>` maps cleanly to a forced-tool JSON schema where the model selects from the injected candidate species IDs and emits a confidence per pick.

### System Interoperability — Candidate Injection

- For the Vision-LLM approach, the backend injects the AquaWiki species shortlist (id + common/scientific name + key visual traits) into the request so the model **classifies within our catalog** rather than the open world. This is the mechanism that gives our curated/VN catalog full coverage (incl. shrimp/snail/plant) without a fish-only model's limits. _(Confidence: Medium — depends on prompt size; large catalogs may need a coarse pre-filter.)_

### Integration Security Patterns

- **Auth to provider:** API key in environment config / secrets (never committed) — matches Sprint Change Proposal AR. _(Confidence: High.)_
- **Endpoint auth:** Reuse existing JWT filter + RBAC; identify is authenticated-only. _(Confidence: High.)_
- **Input validation:** Reuse AR10 MIME + size validation before any provider call. _(Confidence: High.)_
- **Resilience:** Provider failure surfaces an explicit error state (HTTP 502/503), never a silent wrong result — consistent with NFR17's error-propagation contract. _(Confidence: High.)_

---

## Research Synthesis — Provider Recommendation & Integration Contract

# Picking AquaWiki's Eyes: A Technical Decision for Photo-Based Fish Identification

## Executive Summary

AquaWiki's planned "snap-a-photo, name-the-fish" feature (Story 7.0) sits at the intersection of a fast-moving field — multimodal AI — and a hard product constraint: the catalog is **curated, Vietnamese-localized, and not fish-only** (it includes shrimp, snails, and aquatic plants per FR7). That single fact reshapes the decision. General fish-ID models are trained on *fish*, in the open world, skewed toward angling species; AquaWiki needs identification *within its own catalog*, including non-fish.

Three approaches were researched against current (2025–2026) sources. A **self-hosted classification model** can reach the highest accuracy (ViT/EfficientNet 71–92% on iNaturalist) but demands labeled images per species, GPU training, and a separate Python service — too heavy for a solo-developer portfolio project on a fixed Spring/MySQL stack. A **dedicated fish-ID API (Fishial.AI)** is genuinely attractive — a free REST API, 640–865 species, open-source models — but it is **fish-only** and its coverage of niche VN ornamentals is unverified, so it cannot serve the full catalog alone. An **external vision LLM (Claude via Spring AI)** classifies against *whatever candidate list we inject from our DB*, covering the entire catalog including non-fish, integrates natively into Spring Boot via the `Media` API, and — with Structured Outputs now GA — returns a guaranteed JSON candidate list with confidence scores.

**Recommendation (updated per owner decision):** Adopt the **free Fishial.AI API** as the **primary** provider behind the `SpeciesRecognitionService` interface. The feature is scoped to **fish identification only**, which removes the non-fish coverage constraint that would otherwise favor an LLM. This costs **nothing per image**, integrates over REST, and is fish-specialized. The external vision LLM (Claude) remains a documented, swappable **future augmentation** — enabled only if paid accuracy/coverage becomes worthwhile.

**Key Technical Findings:**

- AquaWiki's catalog includes non-fish (shrimp/snail/plant) → **fish-only models structurally cannot cover it**; catalog-driven LLM classification can.
- Claude **Structured Outputs are GA (2026)**; the `confidence` field is **only emitted if declared in the schema** (not via prompt) — a concrete contract requirement.
- Spring AI's `spring-ai-starter-model-anthropic` supports image input natively (`Media`, JPEG/PNG/WebP) → **zero new runtime** vs a self-hosted Python service.
- Vision-LLM cost ≈ **$0.01–0.04/image** (lower on Flash-tier models); Fishial API is **free**; self-host has upfront GPU + ops cost.

**Technical Recommendations:**

1. Implement `SpeciesRecognitionService` with a **Fishial.AI provider as the default** (free REST API).
2. Map Fishial's returned species to AquaWiki `species.id`; surface only catalog-resolvable matches; verify Fishial's confidence/score field for the contract.
3. Reuse AR10 image validation and JWT/RBAC; Fishial API key via environment config.
4. Keep a **Claude-vision provider as a documented future augmentation** behind the same interface — no lock-in, enable only if paid coverage/accuracy is needed.
5. De-risk by checking Fishial's species list against AquaWiki's top fish and running a small labeled eval before committing UX copy about reliability.

## Table of Contents

1. Introduction & Methodology
2. Technical Landscape — Three Approaches
3. Comparison Matrix
4. Strategic Recommendation
5. Integration Contract (the Story 7.0 deliverable)
6. Implementation Roadmap (maps to Stories 7.1–7.4)
7. Risk Assessment
8. Source Documentation

## 1. Introduction & Methodology

**Original Technical Goals:** Select a recognition provider and define the integration contract for `SpeciesRecognitionService`.

**Methodology:** Current web research (2025–2026) across LLM pricing aggregators, vendor docs (Claude, Spring AI, Fishial.AI), and peer-reviewed/arXiv accuracy benchmarks. Multi-source validation; confidence levels noted per claim. Anchored to AquaWiki's fixed stack and PRD constraints (FR7, FR50, FR51, NFR11, NFR17, AR10).

## 2. Technical Landscape — Three Approaches

See **Technology Stack Analysis** and **Integration Patterns Analysis** sections above for full detail. Summary:

- **Approach 1 — Vision LLM API (Claude/GPT-4o/Gemini):** catalog-driven, native Java integration, structured-output confidence, per-image fee.
- **Approach 2 — Self-hosted model (ViT/EfficientNet):** highest accuracy ceiling, but needs data + GPU + separate service. Poor fit for solo/fixed-stack scope.
- **Approach 3 — Fishial.AI:** free REST API + open-source models, 640–865 species, fish-only, VN ornamental coverage unverified, returns species + polygons.

## 3. Comparison Matrix

| Criterion | 1. Vision LLM (Claude) | 2. Self-hosted model | 3. Fishial.AI |
|---|---|---|---|
| Accuracy (curated set) | Medium-High (prompt-driven) | **Highest** (with data) | High for covered fish |
| Cost / image | ~$0.01–0.04 | Upfront GPU + ops; ~$0 marginal | **Free** |
| Latency | Network call (seconds) | Fast once hosted | Network call |
| **Full-catalog coverage (incl. shrimp/snail/plant)** | **Yes** | Yes (if images exist) | **No (fish-only)** |
| VN ornamental coverage | Catalog-driven (good) | Data-dependent | **Unverified** |
| Java/Spring fit | **Native (Spring AI)** | Poor (separate Py svc) | REST OK |
| New infra | None | GPU + Python service | None |
| Time-to-ship | **Fastest** | Slowest | Medium |
| Confidence output | **Schema-guaranteed (GA)** | Model softmax | API-provided |

## 4. Strategic Recommendation

> **Owner decision (2026-06-24): feature scoped to FISH only; Fishial.AI is the primary provider.**

**Primary: Fishial.AI (FREE).** With the feature scoped to fish identification, the non-fish coverage constraint disappears and Fishial — a purpose-built, fish-specialized, **zero-cost** REST API (plus open-source models) — becomes the best fit. No per-image cost, no new GPU/Python infra for the SaaS API path, fish-focused accuracy. Integrates via a standard outbound REST call behind `SpeciesRecognitionService`.

**Future augmentation (optional, paid): External Vision LLM (Claude via Spring AI).** Kept as a documented, swappable provider behind the same interface. Enable later only if the product needs broader coverage (e.g., non-fish) or higher accuracy than Fishial delivers on VN ornamentals. No lock-in.

**Rejected for now: Self-hosted model.** Best accuracy ceiling but disproportionate cost (labeled data + GPU + a separate Python runtime) for a portfolio-scope, solo-developer project. Note: Fishial *also* publishes open-source models on GitHub, so if self-hosting is ever wanted, Fishial's models are the natural starting point.

**Open item to confirm during 7.1:** Fishial's exact response schema — confirm it returns a usable per-match **score/confidence** and how species names map to AquaWiki's catalog (by scientific name).

## 5. Integration Contract — `SpeciesRecognitionService` (Story 7.0 Deliverable)

**Interface (Java):**

```java
public interface SpeciesRecognitionService {
    // image = validated bytes (AR10); candidates = DB-derived shortlist to classify within
    List<SpeciesMatch> identify(byte[] image, String mimeType, List<SpeciesCandidate> candidates);
}

public record SpeciesCandidate(Long speciesId, String commonName, String scientificName, String visualTraits) {}

public record SpeciesMatch(Long speciesId, String commonName, String scientificName, double confidence) {}
```

**REST endpoint:** `POST /api/identify`
- Auth: JWT required (authenticated users only — FR50)
- Body: `multipart/form-data`, single image part
- Validation: MIME = image/*, size ≤ configured max (reuse AR10 / NFR11)

**Response (success):**
```json
{
  "noMatch": false,
  "candidates": [
    { "speciesId": 42, "commonName": "Betta", "scientificName": "Betta splendens", "confidence": 0.91 },
    { "speciesId": 18, "commonName": "Guppy", "scientificName": "Poecilia reticulata", "confidence": 0.06 }
  ]
}
```
- `candidates` ordered by `confidence` descending; only IDs resolvable in the species DB are returned.
- `noMatch: true` with empty `candidates` when no confident match (graceful handling — FR50). Frontend (Story 7.4) shows a "no confident match" message.
- Each candidate links to its species detail page (FR51).

**Provider-side requirements (Fishial.AI primary impl):**
- Send the validated image to Fishial's REST endpoint with API-key auth (free Developers API).
- Map Fishial's returned species (by scientific name) to AquaWiki `species.id`; drop matches not present in the catalog.
- Use Fishial's per-match score as `confidence`; if absent/normalized differently, adapt in the provider layer so the `SpeciesMatch.confidence` contract (0–1) holds.
- Fishial returns fish only — non-fish photos yield `noMatch: true`.
- API key from environment config; never committed.

**Provider-side requirements (Claude future-augmentation impl, if enabled):**
- Use **strict tool use / structured outputs**; declare `confidence` (number 0–1) **in the schema** (it is not emitted otherwise).
- Inject the candidate shortlist (id + names + visual traits) so the model classifies *within the catalog*. For large catalogs, pre-filter the shortlist before the call.

**Error contract:** Provider unreachable/failure → HTTP 502/503 explicit error state; **never a silent wrong result** (NFR17).

## 6. Implementation Roadmap (maps to Epic 7 stories)

- **7.1** — `SpeciesRecognitionService` interface + **Fishial.AI provider** (REST client, API key, map species by scientific name → `species.id`, adapt score → confidence). Confirm Fishial response schema here.
- **7.2** — `POST /api/identify` endpoint: AR10 validation → candidate shortlist build → provider call → ranked DTO + no-match handling + error states.
- **7.3** — Frontend upload screen (preview + Identify, loading state, protected route).
- **7.4** — Result screen: ranked candidates with confidence indicator + link to species detail (FR51); friendly no-match message.
- **Pre-commit eval (recommended):** assemble a small labeled image set of AquaWiki's top ~20 species; measure top-1/top-3 accuracy before finalizing UX reliability claims.

## 7. Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM accuracy lower than expected on niche VN species | Medium | Inject rich visual traits in candidates; eval set; Fishial augmentation for fish |
| Per-image cost grows with usage | Low-Med | Start cheaper model tier; cache by image hash; rate-limit per user |
| Large catalog → oversized prompt | Medium | Pre-filter candidate shortlist by group/coarse classifier |
| Provider outage | Low | Explicit error state (NFR17); Fishial fallback via same interface |
| Non-fish (plant/shrimp) accuracy weak | Medium | LLM still attempts (fish-only APIs can't); flag low confidence as no-match |

## 8. Source Documentation

**Pricing:** [cloudidr LLM Pricing 2026](https://www.cloudidr.com/llm-pricing) · [IntuitionLabs AI API Pricing](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude) · [DeployBase Best LLM for Vision](https://deploybase.ai/articles/best-llm-for-vision-multimodal-api-comparison)
**Claude vision & structured outputs:** [Claude Vision docs](https://docs.claude.com/en/docs/build-with-claude/vision) · [Claude Structured Outputs docs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs) · [Snippets Ltd — schemas/validation](https://snippets.ltd/blog/structured-outputs-with-claude-json-schemas-validation-retry-loops) · [claudeapi.com JSON Schema guide 2026](https://claudeapi.com/en/blog/dev-guides/claude-structured-outputs-json-schema-guide-2026/)
**Spring AI integration:** [Spring AI Anthropic reference](https://docs.spring.io/spring-ai/reference/api/chat/anthropic-chat.html) · [Baeldung Spring AI Claude](https://www.baeldung.com/spring-ai-anthropics-claude-models)
**Fishial.AI:** [Fishial.AI](https://www.fishial.ai/) · [Developers API (free)](https://docs.fishial.ai/faqs/developers%20api) · [API docs](https://docs.fishial.ai/api) · [GitHub models](https://github.com/fishial/fish-identification)
**Self-host accuracy benchmarks:** [Fishnet Open Images (arXiv)](https://arxiv.org/pdf/2106.09178) · [iNaturalist Dataset (arXiv)](https://arxiv.org/pdf/1707.06642) · [InternImage (arXiv)](https://arxiv.org/pdf/2211.05778) · [Input-image size & fish classification (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S1574954125005758)

**Search queries used:** multimodal LLM vision API pricing 2026; fish species identification API fishial.ai; fine-tune fish classification EfficientNet/ViT/iNaturalist; Spring Boot Claude vision base64; Claude structured output JSON confidence 2026; Fishial.ai API pricing free tier.

---

**Technical Research Completion Date:** 2026-06-24
**Source Verification:** All technical facts cited with current (2025–2026) sources
**Technical Confidence Level:** High on integration fit, cost, and the catalog-coverage constraint; Medium on real-world VN-species accuracy (recommend pre-commit eval set)

_Selected provider: **Fishial.AI (free, fish-only)** as primary behind `SpeciesRecognitionService`; **Claude vision** kept as an optional paid future augmentation. Feature scoped to fish identification. Ready to hand off to Story 7.1._
