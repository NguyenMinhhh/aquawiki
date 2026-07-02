---
story_key: 4-4-real-time-compatibility-warnings
epic: 4
story: 4
status: done
created: 2026-05-15
completed:
---

# Story 4.4: Real-time Compatibility Warnings in Simulator

**As a** user,
**I want** to see compatibility warnings update in real time as I add or remove species,
**So that** I can immediately understand which species conflicts exist and why.

## Acceptance Criteria

**AC1 — Auto-check on species change:**
**Given** user thêm hoặc xóa species trong simulator
**When** species list thay đổi
**Then** `useCompatibility` hook gọi `POST /api/compatibility/check` với tất cả current species IDs (debounced 300ms)

**AC2 — CompatibilityWarning component:**
**Given** compatibility API trả về conflicts
**When** `CompatibilityWarning` component renders
**Then** mỗi conflict hiển thị: tên cặp species, severity badge (🔴 Rủi ro cao / 🟡 Cần chú ý / 🟢 Tương thích), và plain-language Vietnamese explanation

**AC3 — Tank border — INCOMPATIBLE overrides bioload:**
**Given** compatibility result chứa INCOMPATIBLE pair
**When** TankCanvas renders
**Then** tank border là đỏ — override bioload color

**AC4 — Tank border — CAUTION worst-of:**
**Given** không có INCOMPATIBLE nhưng có CAUTION pair
**When** TankCanvas renders
**Then** tank border là vàng (worst of bioload status và compatibility status)

**AC5 — All COMPATIBLE + bioload < 80% → green:**
**Given** tất cả pairs COMPATIBLE và bioload < 80%
**When** TankCanvas renders
**Then** tank border là xanh

**AC6 — Remove species clears warning:**
**Given** user xóa species đang gây conflict
**When** species bị remove và check re-run
**Then** conflict warning biến mất và border color update

**AC7 — API error → safe fallback:**
**Given** compatibility API call fails (network error hoặc 500)
**When** error được catch
**Then** warning section hiển thị "Không thể kiểm tra tương thích — vui lòng thử lại" và tank border KHÔNG đổi sang green

**AC8 — Single species → no warnings:**
**Given** chỉ có 1 species trong simulator
**When** compatibility check runs
**Then** không hiện warnings, border color phản ánh chỉ bioload status

## Tasks/Subtasks

- [ ] **Task 1: useCompatibility hook**
  - [ ] 1.1 Create `src/hooks/useCompatibility.ts` — nhận `speciesIds: number[]`, gọi POST /api/compatibility/check (debounced 300ms)
  - [ ] 1.2 State: `result: CompatibilityCheckResponse | null`, `loading: boolean`, `error: string | null`
  - [ ] 1.3 Khi `speciesIds.length < 2` → skip API call, set result = null
  - [ ] 1.4 API error → set error message "Không thể kiểm tra tương thích — vui lòng thử lại"

- [ ] **Task 2: Types**
  - [ ] 2.1 Add compatibility types to `src/types/compatibility.ts`:
    - `CompatibilityLevel = 'COMPATIBLE' | 'CAUTION' | 'INCOMPATIBLE'`
    - `SpeciesSummary: { id, commonName, scientificName }`
    - `PairResult: { speciesA, speciesB, level, reason, source }`
    - `CompatibilityCheckResponse: { groupResult, pairs }`

- [ ] **Task 3: CompatibilityWarning component**
  - [ ] 3.1 Create `src/components/CompatibilityWarning.tsx` — nhận `result`, `loading`, `error` props
  - [ ] 3.2 Loading state: skeleton hoặc "Đang kiểm tra..." text
  - [ ] 3.3 Error state: "Không thể kiểm tra tương thích — vui lòng thử lại" (warning style)
  - [ ] 3.4 Pairs list: mỗi pair hiện badge (🔴/🟡/🟢) + tên hai loài + reason text
  - [ ] 3.5 Empty (all COMPATIBLE): "✓ Tất cả loài tương thích với nhau" (success style)
  - [ ] 3.6 Single species (result null): không render gì

- [ ] **Task 4: TankCanvas border logic update**
  - [ ] 4.1 Thêm prop `compatibilityColor: 'success' | 'warning' | 'danger' | null` vào TankCanvas
  - [ ] 4.2 Border color priority: compatibilityColor nếu có (INCOMPATIBLE → danger override), else bioloadColor
  - [ ] 4.3 Worst-of logic: `danger` > `warning` > `success`

- [ ] **Task 5: SimulatorPage integration**
  - [ ] 5.1 Call `useCompatibility(tankItems.map(i => i.species.id))` trong SimulatorPage
  - [ ] 5.2 Derive `compatibilityColor` từ `result.groupResult`
  - [ ] 5.3 Pass `compatibilityColor` vào TankCanvas (override bioloadColor khi worse)
  - [ ] 5.4 Render `CompatibilityWarning` trong right panel, phía trên bioload section

## Dev Notes

### useCompatibility debounce
```ts
useEffect(() => {
  if (speciesIds.length < 2) { setResult(null); return; }
  const timer = setTimeout(async () => {
    setLoading(true);
    try {
      const res = await api.post<CompatibilityCheckResponse>(
        '/api/compatibility/check', { speciesIds });
      setResult(res.data);
      setError(null);
    } catch {
      setError('Không thể kiểm tra tương thích — vui lòng thử lại');
    } finally { setLoading(false); }
  }, 300);
  return () => clearTimeout(timer);
}, [JSON.stringify(speciesIds)]);
```

### Border color override logic (SimulatorPage)
```ts
function mergeColors(
  compat: 'success' | 'warning' | 'danger' | null,
  bioload: 'success' | 'warning' | 'danger' | null
): 'success' | 'warning' | 'danger' | null {
  const rank = { danger: 2, warning: 1, success: 0 };
  const a = compat !== null ? rank[compat] : -1;
  const b = bioload !== null ? rank[bioload] : -1;
  if (a === -1 && b === -1) return null;
  const winner = a >= b ? compat : bioload;
  return winner;
}
```

### Severity badge colors
- INCOMPATIBLE → `bg-danger-light text-danger` + "🔴 Rủi ro cao"
- CAUTION → `bg-warning-light text-warning` + "🟡 Cần chú ý"
- COMPATIBLE → `bg-success-light text-success` + "🟢 Tương thích"

### Source display
`source === 'EXCEPTION'` → thêm badge "Đã xác minh" (trusted data)
`source === 'RULE_ENGINE'` → không thêm gì (auto-computed)

### CompatibilityWarning placement
Render trong right panel của SimulatorPage, phía TRÊN section "Chỉ số Bioload". Nếu `result === null && !loading && !error` → render null (single species or not checked yet).

### TankCanvas prop change
Thêm `compatibilityColor` prop mới. Border color logic:
```
if (compatibilityColor) → dùng compatibilityColor
else if (bioloadColor) → dùng bioloadColor
else → dùng border color mặc định
```
SimulatorPage pass `mergeColors(compatibilityColor, bioloadColor)` là `effectiveBorderColor` vào TankCanvas dưới tên `bioloadColor` (hoặc rename prop thành `borderColor`).

## Dev Agent Record

### Debug Log

### Completion Notes

## File List

**Frontend:**
- `aquawiki-frontend/src/types/compatibility.ts` (new)
- `aquawiki-frontend/src/hooks/useCompatibility.ts` (new)
- `aquawiki-frontend/src/components/CompatibilityWarning.tsx` (new)
- `aquawiki-frontend/src/components/TankCanvas.tsx` (modified — thêm compatibilityColor prop, border priority logic)
- `aquawiki-frontend/src/pages/SimulatorPage.tsx` (modified — useCompatibility integration, CompatibilityWarning render)

## Change Log

- 2026-05-15: Story 4.4 created
