# Data Export Feature — Code Analysis

Systematic technical comparison of three implementations across branches:
`feature-data-export-v1` · `feature-data-export-v2` · `feature-data-export-v3`

---

## Quick Reference

| Aspect | v1 | v2 | v3 |
|---|---|---|---|
| **Total Lines** | 220 | 746 | 1,547 |
| **Files Changed** | 2 | 4 | 9 |
| **Export Formats** | CSV | CSV, JSON, PDF | CSV, JSON, PDF |
| **UI Pattern** | Inline button | 2-step modal | 5-tab hub |
| **Filters** | None | Date range + categories | Baked into templates |
| **Scheduling** | No | No | Yes (localStorage) |
| **History** | No | No | Yes (50-record log) |
| **Sharing / QR** | No | No | Yes (simulated) |
| **Cloud Integrations** | No | No | Yes (mocked) |
| **Libraries Added** | 0 | jsPDF, jsPDF-autotable | + qrcode |
| **Error Handling** | Minimal | Good | Fair |
| **Security** | Fair | Good | Poor (weak tokens, mocks) |
| **Maintainability** | Excellent | Good | Fair |
| **Extensibility** | Low | Moderate | High |

---

## Version 1 — Simple CSV Button

**Branch:** `feature-data-export-v1`

### Files Created / Modified

| File | Status | Lines |
|---|---|---|
| `lib/export.ts` | Created | 27 |
| `app/page.tsx` | Modified | 193 |

**Total:** 220 lines across 2 files.

### Architecture Overview

Two-tier, flat architecture — no modal, no intermediate component.

```
app/page.tsx  →  lib/export.ts  →  Browser Blob API
```

`useExpenses()` provides the expenses array. The dashboard renders a conditional
"Export Data" button that calls `exportToCSV(expenses)` directly on click.

### Key Components and Responsibilities

**`lib/export.ts`**
- Single function `exportToCSV(expenses, filename?)`
- Transforms expense objects to CSV rows
- Escapes double-quotes: `e.description.replace(/"/g, '""')`
- Formats amounts: `e.amount.toFixed(2)`
- Creates Blob → anchor → programmatic click → revokeObjectURL

**`app/page.tsx` (changes)**
- Imports `exportToCSV`
- Adds conditional "Export Data" button to header (shown only when `expenses.length > 0`)
- Removes old bottom CSV banner

### Technical: How Export Works

```typescript
export function exportToCSV(expenses: Expense[], filename = "expenses"): void {
  // 1. Build CSV string
  const csvContent = [headers, ...rows].join("\n");
  // 2. Wrap in Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  // 3. Create temporary anchor and trigger click
  const url = URL.createObjectURL(blob);
  link.href = url; link.download = `${filename}.csv`;
  link.click();
  // 4. Clean up
  URL.revokeObjectURL(url);
}
```

Entirely synchronous. No loading state, no async operations.

### State Management

None specific to export. Reads `expenses` from `useExpenses()` hook.
No feedback state — download happens silently.

### Libraries / Dependencies

No new runtime or dev dependencies. Uses only native browser APIs.

### Error Handling

| Scenario | Handling |
|---|---|
| No expenses | Button hidden (conditional render) |
| Download fails silently | Not handled |
| Large dataset (memory) | Not handled |
| Invalid data | Not handled |

No try-catch. Assumes browser download always succeeds.

### Security Considerations

- Exports all data without any filtering — user cannot redact sensitive items
- No filename sanitization (auto-generated from date, safe)
- Blob API is XSS-safe (no `data:` URI injection risk)
- Client-side only — no data leaves the device

### Performance Implications

- O(n) string concatenation — could be slow for thousands of records
- No streaming or chunking
- Synchronous — blocks main thread briefly on large datasets
- No memoization needed (one-shot function)

### Extensibility

Adding a second format requires:
1. A new export function in `lib/export.ts`
2. A modal or menu to let the user choose

There is no template, filter, or format abstraction — everything is hardcoded.
**Effort to add JSON export:** ~30 min. **Effort to add date filtering:** 2–4 hrs (requires modal).

---

## Version 2 — Advanced Export Modal

**Branch:** `feature-data-export-v2`

### Files Created / Modified

| File | Status | Lines |
|---|---|---|
| `lib/export.ts` | Modified | 118 |
| `components/ExportModal.tsx` | Created | 429 |
| `app/page.tsx` | Modified | 199 |
| `package.json` | Modified | — |

**Total:** 746 lines across 4 files.

### Architecture Overview

Three-tier separation of concerns:

```
app/page.tsx           →  ExportModal (UI + filtering)
ExportModal            →  lib/export.ts (format functions)
lib/export.ts          →  Browser APIs / jsPDF
```

The modal owns all export state. The dashboard is only responsible for
`showExport: boolean` and passing the `expenses` array down.

### Key Components and Responsibilities

**`lib/export.ts`**
- `triggerDownload(blob, filename)` — extracted shared download utility
- `exportToCSV(expenses, filename?)` — CSV with custom filename support
- `exportToJSON(expenses, filename?)` — pretty-printed JSON
- `exportToPDF(expenses, filename?)` — async, uses dynamic imports

**`components/ExportModal.tsx`**
- Format selector (CSV / JSON / PDF cards with descriptions)
- Custom filename input with sanitization
- Date range pickers (`dateFrom`, `dateTo`)
- Category multi-select using `Set<Category>` for O(1) toggle
- Data preview table (first 8 rows + "+N more" indicator)
- Summary bar (record count, total, format)
- Loading state with spinner during export
- "Downloaded!" success confirmation
- Escape key and backdrop click to close

**`app/page.tsx` (changes)**
- Adds `showExport: boolean` state
- Renders "Export Data" button in header
- Mounts `<ExportModal>` when `showExport` is true

### Technical: How Export Works

**CSV / JSON** — synchronous:
```typescript
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  // ... anchor click ...
  URL.revokeObjectURL(url);
}

export function exportToJSON(expenses, filename) {
  const data = expenses.map(e => ({ date, category, description, amount }));
  triggerDownload(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${filename}.json`);
}
```

**PDF** — async with dynamic imports to keep initial bundle small:
```typescript
export async function exportToPDF(expenses, filename) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  // Styled header, summary box, auto-table with alternating rows, totals footer
  doc.save(`${filename}.pdf`);
}
```

PDF output includes:
- Indigo branded header (RGB 79, 70, 229)
- Summary box: record count, total, date range
- Auto-table with alternating row colors
- Right-aligned amount column
- Totals footer row

**Filtering** — computed via `useMemo`:
```typescript
const filtered = useMemo(() => expenses.filter(e => {
  if (dateFrom && e.date < dateFrom) return false;
  if (dateTo && e.date > dateTo) return false;
  if (!selectedCategories.has(e.category)) return false;
  return true;
}), [expenses, dateFrom, dateTo, selectedCategories]);
```

### State Management

All export state lives inside `ExportModal`:

| State | Type | Purpose |
|---|---|---|
| `step` | `"configure" \| "preview"` | 2-step workflow |
| `format` | `ExportFormat` | Selected format |
| `filename` | `string` | Custom filename |
| `dateFrom` / `dateTo` | `string` | Date range |
| `selectedCategories` | `Set<Category>` | Category filter |
| `isExporting` | `boolean` | Loading guard |
| `exported` | `boolean` | Success feedback |

Parent only holds `showExport: boolean`.

### Libraries / Dependencies

| Package | Version | Purpose |
|---|---|---|
| `jspdf` | ^4.2.0 | PDF document generation |
| `jspdf-autotable` | ^5.0.7 | Table layout in PDF |
| `@types/jspdf` | ^1.3.3 | TypeScript types (dev) |

Both jsPDF libraries are dynamically imported — they only load when the user
requests a PDF export, keeping the initial page load unaffected.

### Error Handling

| Scenario | Handling |
|---|---|
| No matching records | Export button disabled, "No data" message |
| Empty filename | Falls back to `"expenses"` |
| Invalid filename chars | Regex strips: `/[^a-zA-Z0-9_-]/g` |
| Export in progress | Button disabled, loading spinner |
| PDF async failure | try/finally ensures loading state resets |
| Future date selected | `max` attribute on date inputs |

Try/finally pattern ensures `isExporting` always resets:
```typescript
setIsExporting(true);
try { /* export */ } finally { setIsExporting(false); }
```

### Security Considerations

- **Filename sanitization** prevents path traversal in auto-generated names
- **Category filtering** lets users exclude sensitive data before exporting
- **Date limiting** prevents accidentally exporting all-time data
- **Dynamic imports** reduce attack surface in initial bundle
- **Weak point:** no real access control — any local user can export all data

### Performance Implications

- `useMemo` prevents re-filtering on every render
- Dynamic imports defer jsPDF loading (~500KB) until needed
- 400ms artificial delay added for UX (not a performance issue)
- Preview limited to 8 rows to keep DOM lightweight
- For very large datasets (10k+ records), PDF generation may take several seconds

### Extensibility

**Easy:**
- Add new format: create export function + add entry to `FORMAT_META` constant (~20 min)
- Add new filter: add state + filter condition in `useMemo` (~30 min)

**Hard:**
- Cloud destinations: modal would need conditional UI branches
- Export scheduling: would require separate persistent store
- History tracking: would need to be grafted onto each export call

---

## Version 3 — Cloud Export Hub

**Branch:** `feature-data-export-v3`

### Files Created / Modified

| File | Status | Lines |
|---|---|---|
| `lib/cloudExport.ts` | Created | 254 |
| `lib/export.ts` | Modified | 81 |
| `components/ExportHub/index.tsx` | Created | 122 |
| `components/ExportHub/TemplatesTab.tsx` | Created | 133 |
| `components/ExportHub/IntegrationsTab.tsx` | Created | 234 |
| `components/ExportHub/ScheduleTab.tsx` | Created | 221 |
| `components/ExportHub/HistoryTab.tsx` | Created | 97 |
| `components/ExportHub/ShareTab.tsx` | Created | 208 |
| `app/page.tsx` | Modified | 197 |
| `package.json` | Modified | — |

**Total:** 1,547 lines across 9 files.

### Architecture Overview

Hub-and-spoke architecture with a persistent sidebar for navigation:

```
app/page.tsx
└── ExportHub (container, sidebar nav)
    ├── TemplatesTab     → lib/export.ts → Browser APIs / jsPDF
    ├── IntegrationsTab  → lib/cloudExport.ts (storage) + mock delays
    ├── ScheduleTab      → lib/cloudExport.ts (storage)
    ├── HistoryTab       → lib/cloudExport.ts (storage)
    └── ShareTab         → qrcode library

lib/cloudExport.ts
├── Type definitions (ExportTemplate, ScheduledExport, …)
├── Preset templates (6 configs)
├── Styling constants (TAG_COLORS, FORMAT_BADGES)
└── localStorage helpers (load/save/add functions)
```

Each tab is a fully independent component. They share data only through
`lib/cloudExport.ts` storage helpers (reading/writing localStorage).

### Key Components and Responsibilities

**`lib/cloudExport.ts`**
- All type definitions: `ExportTemplate`, `ScheduledExport`, `ExportHistoryRecord`, `IntegrationStatus`
- 6 pre-configured templates with date ranges and category presets
- Styling constants shared across tabs
- localStorage wrappers with SSR safety and parse error fallbacks
- Utilities: `timeAgo()`, `getNextRun()`, `getDateRangeForTemplate()`

**`ExportHub/index.tsx`** — Container
- Mounts the dark sidebar with 5 nav buttons
- Tracks `tab: Tab` and `connectedCount` (refreshed on tab change)
- Handles Escape key + body scroll lock
- Routes to the appropriate tab component

**`TemplatesTab.tsx`**
- Renders 6 template cards in a responsive grid
- Computes filtered expense count per template (`getFiltered()`)
- Manages per-card loading/success state
- Calls `exportToCSV/JSON/PDF` and records to history on completion

**`IntegrationsTab.tsx`**
- Renders 5 integration cards (2 active, 3 coming soon)
- Simulates OAuth connect (1.8s delay → sets connected state)
- Simulates sync (1.2s delay → triggers CSV download + logs history)
- Persists connection state to localStorage
- "Coming Soon" integrations render as disabled

**`ScheduleTab.tsx`**
- Create/delete/toggle recurring export schedules
- `getNextRun(frequency, time)` calculates next execution datetime
- Persists to `export-hub-schedules` in localStorage
- Toggle switch enables/disables without deletion

**`HistoryTab.tsx`**
- Reads `export-hub-history` from localStorage on mount
- Renders timestamped records with status dot, format badge, destination icon
- `timeAgo()` converts ISO timestamps to human-readable relative times
- Capped at 50 records (oldest trimmed on write)

**`ShareTab.tsx`**
- Generates 18-char random token (`Math.random().toString(36)` × 2)
- Constructs share URL: `https://expenseai.io/share/{token}`
- Dynamic import of `qrcode` → `QRCode.toDataURL()` → renders `<img>`
- Expiry selector, three permission toggles, quick share buttons
- Snapshot summary panel showing record count, total, permissions

### Technical: How Export Works

**Templates flow:**
```typescript
// 1. Filter by template's date range and category preset
const filtered = expenses.filter(e => {
  const { from, to } = getDateRangeForTemplate(template);
  if (from && e.date < from) return false;
  if (to && e.date > to) return false;
  if (template.categories !== "all" && !template.categories.includes(e.category)) return false;
  return true;
});

// 2. 600ms delay for UX feedback
await new Promise(r => setTimeout(r, 600));

// 3. Export in template's format
if (template.format === "csv") exportToCSV(filtered, filename);
else if (template.format === "json") exportToJSON(filtered, filename);
else await exportToPDF(filtered, filename);

// 4. Record to history
addHistoryRecord({ templateName, destination: "Download", format, recordCount, status: "success", filename });
```

**QR code generation:**
```typescript
useEffect(() => {
  import("qrcode").then(QRCode => {
    QRCode.default.toDataURL(shareUrl, {
      width: 180, margin: 2,
      color: { dark: "#312e81", light: "#ffffff" }
    }).then(setQrCode);
  });
}, [shareUrl]);
```

**Schedule next-run calculation:**
```typescript
export function getNextRun(frequency: Frequency, time: string): string {
  const next = new Date(); // set to today at chosen time
  next.setHours(h, m, 0, 0);
  if (next <= now) {  // if time has passed today
    if (frequency === "daily")   next.setDate(next.getDate() + 1);
    else if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}
```

### State Management

Each tab manages its own state independently:

**Per-tab state summary:**

| Tab | Key State |
|---|---|
| ExportHub | `tab`, `connectedCount` |
| TemplatesTab | `exporting: string\|null`, `exported: string\|null` |
| IntegrationsTab | `integrations: Record<id, Status>`, `connecting`, `syncing` |
| ScheduleTab | `schedules[]`, `showForm`, `form` |
| HistoryTab | `history[]` (loaded once) |
| ShareTab | `token`, `expiry`, toggles, `qrCode`, `copied` |

**Persistence via localStorage** (not React state):
- `export-hub-history` — array of ExportHistoryRecord
- `export-hub-integrations` — map of IntegrationId → IntegrationStatus
- `export-hub-schedules` — array of ScheduledExport

### Libraries / Dependencies

| Package | Version | Purpose |
|---|---|---|
| `jspdf` | ^4.2.0 | PDF generation (from v2) |
| `jspdf-autotable` | ^5.0.7 | PDF tables (from v2) |
| `qrcode` | ^1.5.4 | QR code image generation |
| `@types/qrcode` | ^1.5.6 | TypeScript types (dev) |

All three libraries use dynamic imports and only load on demand.

### Error Handling

| Scenario | Handling |
|---|---|
| localStorage unavailable (SSR) | `typeof window === "undefined"` guard |
| Corrupt localStorage data | try/catch returns empty fallback |
| Empty template results | Button disabled, "No data for this period" |
| Export async failure | try/finally resets loading state |
| QR code loading | Placeholder skeleton while generating |
| Integration already syncing | Button disabled during `syncing` state |
| Schedule time in the past | `getNextRun()` adds frequency offset |

### Security Considerations

> **Note:** Most features in v3 are simulated. Several real-world security issues
> would need to be resolved before deploying any of the "cloud" features.

| Issue | Severity | Details |
|---|---|---|
| Weak token generation | **High** | `Math.random()` is not cryptographically secure. Use `crypto.getRandomValues()` instead. |
| Share links not enforced | **High** | Token validation is frontend-only. No server validates access. |
| Password protect toggle | **High** | UI implies protection that is not implemented — no password collected or checked. |
| localStorage XSS exposure | **Medium** | Any injected script can read integration states and schedules. |
| Mock integrations | **Medium** | UI implies real Google Sheets / Dropbox sync — data does not actually leave the device. |
| Client-side exports | **Low** | No server transmission; no injection vectors in the export path. |

### Performance Implications

- 7 components lazy-rendered only when their tab is active
- `qrcode` library (~50KB) dynamically imported — no bundle impact
- jsPDF dynamically imported only on PDF export
- localStorage reads on tab switch (fast, synchronous)
- No memoization in TemplatesTab — `getFiltered()` recalculates on every render;
  could be optimized with `useMemo` for large datasets
- Mock delays (600ms, 1.2s, 1.8s) add perceived latency — intentional UX choice

### Extensibility

**Data-driven — very easy to extend via constants:**

| Extension | Effort |
|---|---|
| Add a new template | Edit `EXPORT_TEMPLATES` array (~2 min) |
| Add a new date range | Add case to `getDateRangeForTemplate()` (~5 min) |
| Add a new frequency | Add to `FREQUENCY_LABELS` (~1 min) |
| Add a new tab | Create component + add to `NAV` array (~1–2 hrs) |
| Real OAuth integration | Replace mock delays with actual OAuth + API calls (~1–2 days per integration) |
| Real scheduling backend | Requires cron service + API endpoints (~3–5 days) |
| Real share endpoints | Requires server-side token validation + data serving (~1–2 days) |

**Technical debt to address before production:**
1. Replace `Math.random()` tokens with `crypto.getRandomValues()`
2. Add backend API for share link validation
3. Implement real OAuth flows for integrations
4. Move localStorage to a custom hook (`useExportHistory`, `useSchedules`)
5. Add `useMemo` to `TemplatesTab` for filtered data
6. Implement the password-protect toggle or remove the UI

---

## Technical Deep Dive: Cross-Version Comparison

### File Generation Approach

All three versions use the same Blob-based download mechanism:
```
Blob → URL.createObjectURL → <a download> click → revokeObjectURL
```

The difference is what goes *into* the Blob:
- **v1/v2/v3 CSV**: String-joined rows, `text/csv`
- **v2/v3 JSON**: `JSON.stringify(data, null, 2)`, `application/json`
- **v2/v3 PDF**: jsPDF `.output("blob")`, `application/pdf`

### User Interaction Flow

```
v1:  Click button → download starts
v2:  Click button → modal opens → configure (format/filters/filename) → preview → export
v3:  Click button → hub opens → pick tab → pick template/connect/schedule/share
```

### Filtering Approach

| Version | Mechanism |
|---|---|
| v1 | None — always exports all expenses |
| v2 | Runtime: `useMemo` over `expenses[]` with user-selected date/category |
| v3 | Template-baked: date range and category preset stored in `EXPORT_TEMPLATES` config |

v2's approach gives more flexibility. v3's approach gives better defaults but less
ad-hoc control.

### State Management Comparison

| Version | Pattern |
|---|---|
| v1 | Stateless export — no state needed |
| v2 | Local component state in `ExportModal` |
| v3 | Local component state per tab + localStorage for persistence |

### Data Flow

```
v1:  useExpenses() → exportToCSV() → file
v2:  useExpenses() → ExportModal (filter/preview) → exportTo*() → file
v3:  useExpenses() → TemplatesTab (template config filter) → exportTo*() → file
                   → IntegrationsTab → localStorage → mock sync
                   → ScheduleTab → localStorage
                   → HistoryTab → localStorage (read)
                   → ShareTab → qrcode lib → QR image
```

---

## Recommendation

### For a production expense tracker, the recommended path is:

**Adopt v2's architecture as the foundation** — it has the best balance of
features, code quality, and security. Then selectively port specific v3 patterns:

1. **Take from v2**: Multi-format export (CSV/JSON/PDF), date range + category
   filtering, filename control, 2-step preview modal, dynamic imports for PDF

2. **Take from v3**: Template presets system (`EXPORT_TEMPLATES`), history
   tracking (`addHistoryRecord`), `timeAgo` utility, component-per-feature
   file organization

3. **Defer from v3**: Cloud integrations (until backend exists), scheduling
   (until cron service exists), share links (until server-side validation exists)

4. **Fix before shipping**: Replace `Math.random()` with `crypto.getRandomValues()`,
   remove or implement the password-protect toggle, add proper error feedback to v1

---

*Analysis performed on 2026-03-07. All line counts based on git diff against `main`.*
