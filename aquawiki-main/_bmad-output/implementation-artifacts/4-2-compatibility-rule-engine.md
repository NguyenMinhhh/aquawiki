---
story_key: 4-2-compatibility-rule-engine
epic: 4
story: 2
status: done
created: 2026-05-15
completed:
---

# Story 4.2: Compatibility Rule Engine

**As a** developer,
**I want** a Rule Engine service that computes compatibility from species parameters,
**So that** species pairs without verified exceptions are automatically evaluated without manual data entry.

## Acceptance Criteria

**AC1 — pH overlap → COMPATIBLE:**
**Given** hai species với pH range overlap
**When** `CompatibilityRuleEngine.evaluate(a, b)` được gọi
**Then** pH rule trả về COMPATIBLE cho parameter đó

**AC2 — Temperature conflict → INCOMPATIBLE:**
**Given** hai species với temperature ranges không overlap
**When** evaluated
**Then** engine trả về INCOMPATIBLE với reason:
`"Xung đột nhiệt độ: [Species A] cần [X–Y]°C, [Species B] cần [P–Q]°C"`

**AC3 — Both AGGRESSIVE → CAUTION:**
**Given** cả hai species có behaviorTag = AGGRESSIVE
**When** evaluated
**Then** engine trả về CAUTION với reason:
`"Cả hai loài có tính hung hăng — có thể xảy ra xung đột lãnh thổ"`

**AC4 — Predator size rule → INCOMPATIBLE:**
**Given** species A có behaviorTag = AGGRESSIVE và maxSizeCm của B < maxSizeCm của A × 0.3
**When** evaluated
**Then** engine trả về INCOMPATIBLE với reason:
`"Nguy cơ bị ăn: [Species A] có thể coi [Species B] là con mồi"`

**AC5 — All rules pass → COMPATIBLE:**
**Given** hai species pass tất cả rule checks (pH, temp, behavior, size ok)
**When** evaluated
**Then** engine trả về COMPATIBLE

**AC6 — Pure computation, no DB calls:**
**Given** engine là pure service với no database calls
**When** evaluated với hai Species objects đầy đủ
**Then** hoàn thành trong < 10ms — tất cả inputs từ caller, không có lazy loading

## Tasks/Subtasks

- [ ] **Task 1: RuleResult + CompatibilityRuleEngine**
  - [ ] 1.1 Create `RuleResult` record: `level`, `reason` (String)
  - [ ] 1.2 Create `CompatibilityRuleEngine` @Service — pure computation, no @Autowired dependencies
  - [ ] 1.3 Implement `evaluate(Species a, Species b): RuleResult` — runs all rules, returns worst result

- [ ] **Task 2: Rules implementation**
  - [ ] 2.1 pH overlap rule: `a.phMin <= b.phMax && a.phMax >= b.phMin` → COMPATIBLE, else INCOMPATIBLE + reason
  - [ ] 2.2 Temperature overlap rule: `a.tempMin <= b.tempMax && a.tempMax >= b.tempMin` → COMPATIBLE, else INCOMPATIBLE + reason tiếng Việt
  - [ ] 2.3 Behavior rule: both AGGRESSIVE → CAUTION + reason
  - [ ] 2.4 Predator size rule: A is AGGRESSIVE && B.maxSizeCm < A.maxSizeCm × 0.3 → INCOMPATIBLE + reason (check cả chiều ngược: B is AGGRESSIVE && A.maxSizeCm < B.maxSizeCm × 0.3)
  - [ ] 2.5 Worst-result aggregation: nếu có bất kỳ INCOMPATIBLE → return INCOMPATIBLE; nếu có CAUTION → return CAUTION; else COMPATIBLE

- [ ] **Task 3: Unit tests**
  - [ ] 3.1 `CompatibilityRuleEngineTest` — test từng AC riêng lẻ: pH conflict, temp conflict, both aggressive, predator rule, all-clear
  - [ ] 3.2 Test edge cases: same species, A AGGRESSIVE B tiny size, pH partial overlap

## Dev Notes

### Rule evaluation order
Chạy tất cả rules và collect results. Worst-case aggregation:
```java
CompatibilityLevel worst = COMPATIBLE;
List<String> reasons = new ArrayList<>();
for (RuleResult r : results) {
    if (r.level().ordinal() > worst.ordinal()) worst = r.level();
    if (r.level() != COMPATIBLE) reasons.add(r.reason());
}
return new RuleResult(worst, String.join("; ", reasons));
```
Enum ordinal: COMPATIBLE=0, CAUTION=1, INCOMPATIBLE=2

### Pure service design
```java
@Service
public class CompatibilityRuleEngine {
    public RuleResult evaluate(Species a, Species b) { ... }
}
```
Không có @Autowired, không có DB calls — hoàn toàn deterministic và testable.

### Temperature overlap check
```java
boolean tempOverlap = a.getTempMin() <= b.getTempMax() && a.getTempMax() >= b.getTempMin();
if (!tempOverlap) {
    return new RuleResult(INCOMPATIBLE,
        String.format("Xung đột nhiệt độ: %s cần %.0f–%.0f°C, %s cần %.0f–%.0f°C",
            a.getCommonName(), a.getTempMin(), a.getTempMax(),
            b.getCommonName(), b.getTempMin(), b.getTempMax()));
}
```

### Predator rule symmetry
Check cả hai chiều: A ăn B, hoặc B ăn A.

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Backend:**
- `aquawiki-backend/src/main/java/com/aquawiki/service/RuleResult.java` (new)
- `aquawiki-backend/src/main/java/com/aquawiki/service/CompatibilityRuleEngine.java` (new)
- `aquawiki-backend/src/test/java/com/aquawiki/service/CompatibilityRuleEngineTest.java` (new)

## Change Log

- 2026-05-15: Story 4.2 created
