# Plan Review: Property House-Numbering System (Revision 4)

Reviewed: `context/PLAN.md` (Revision 4) against `Task.md`, `CLAUDE.md`, and the repository on 2026-11-12.
The previous review (Revision 1, F-01 … F-18) is superseded. All 18 of those findings are now resolved in the plan (see its Findings Map). This review uses new IDs, R-01 … R-12.

---

## 1. Overall Assessment

Revision 4 is a big improvement:

- **Database risk.** The plan is built on facts checked against the database:
  - production `properties` has 0 rows;
  - the existing drift is known and deliberately left alone;
  - `migrate dev` is banned on production;
  - the migration SQL is complete, reviewed and guarded, and stays unapplied behind explicit gates.
- **Single source of truth.** The plan names one owner for every concern: address formatting, writes, permissions, validation and the list endpoint.
- **Authorization.** It matches the user's permission rules and the existing helpers. The broken `assertDistrictAccess` is avoided.
- **Coverage.** Every Task.md requirement is covered, including the export and the full semi-automatic workflow.
- **Duplicate numbers.** They are prevented at two levels: server-side checks, plus a partial unique index declared in the schema (`partialIndexes` preview), so it doesn't show up as drift.
- **Structure.** 10 increments, each with "Done when" criteria, in a sensible order.

The remaining issues are narrower and mostly in how the map behaves during the semi-automatic workflow. The plan doesn't account for how the existing map clears selections when the user zooms out, and it uses a zoom value that no component provides. Beyond that there are a few data-integrity and authorization gaps in edge paths. **There are no Critical findings.** One High finding should be fixed before Increment 8 is implemented.

---

## 2. Requirements Coverage

| Task.md requirement | Plan | Status |
|---|---|---|
| §1 Property model, relations, indexes | Inc 1.3, SQL §1.4 | ✅ |
| §2 Import: EPSG:3857 → WGS84, centroid, district/mahalla lookup, upsert | Inc 2 | ✅ (R-05 edge case) |
| §3 Click → panel; cadastral no., mahalla, current street; street dropdown + number; save; colour change | Inc 6–7 | ✅ |
| §4.1 Select street from the map or sidebar | Inc 8.4 | ✅ (R-01: zoom clears the selection) |
| §4.2 Highlight unaddressed properties within the buffer **after the street is selected** | Inc 8.2 | ⚠️ R-08: §8.2 computes candidates only "while a session is active" |
| §4.3–4.5 Side choice, crosshair, sequential clicks, live numbers, counter | Inc 8 | ✅ |
| §4.6 Undo · §4.7 Batch save · §4.8 Switch side | Inc 8 | ✅ |
| §4 Configurable start number | Inc 8.4 | ✅ (odd/even parity enforced) |
| §5 newAddress format and storage | Inc 3.3 | ✅ (R-05: can go stale on re-import) |
| §5 / §8.9 Export with newAddress | Inc 9 | ✅ |
| §6 Grey / green / tooltip / candidate colour | Inc 6, 8 | ✅ (R-02: no zoom source for the layer) |
| §7 GET list, GET one, PATCH, POST batch-assign | Inc 4.3 | ✅ (R-04: suspended accounts) |
| §9 Buffer with turf | Inc 8.2 | ✅ (`buffer`, `booleanIntersects` and `toWgs84` are exported by the installed `@turf/turf`, verified) |

---

## 3. Findings

### R-01 — High — Increment 8 (8.2, 8.4) and Increment 6
**Issue:** `components/map/MapZoomManager.tsx` clears selections on `zoomend`:

| Zoom drops below | Store value cleared |
|---|---|
| 14 (`ZOOM_THRESHOLDS.STREET`) | `selectedStreet` |
| 12 | `selectedMahalla` |
| 9 | `selectedDistrict` |

The plan binds the numbering panel's street dropdown to `useMapFilterStore.selectedStreet`, and it builds the buffer from "the selected street geometry" without saying whether that means the store value or the session's `streetId`. It also fetches properties with `useProperties(selectedDistrict, selectedMahalla)`.

If a user zooms out to see a long street during a session:
- `selectedStreet` is cleared, so the dropdown empties and the candidates can disappear;
- `selectedMahalla` is cleared, so the query key changes, the data is refetched and the layer remounts;
- below zoom 9 the district is cleared and every property vanishes, while the store still holds assignments that are no longer visible.

**Why it matters:** This is the core semi-auto workflow (Task.md §4.5). Users will zoom while clicking along a street, and the map state will fall out of sync with the session.
**Correction:**
- Derive candidates and the street geometry from **`useNumberingSessionStore.streetId`**, not from `selectedStreet`, once the session starts.
- While `isActive`, make `MapZoomManager` skip its clearing. It can read `useNumberingSessionStore.getState().isActive`, the same way the handlers read the store.
- While `isActive`, keep the property query keyed to the session's district. See R-03.
- Add a "Done when" check: zooming out to 13 and back during a session keeps the candidates, the labels and the counter.

### R-02 — Medium — Increment 6 (step 7)
**Issue:** Step 7 renders the layer when `zoom >= ZOOM_THRESHOLDS.PROPERTY`, but `UzbekistanMap` has no zoom value in React state. Zoom is only handled inside `MapZoomManager` (`useMapEvents` → `updateZoomClass`, which toggles CSS classes such as `.zoom-high`). The plan doesn't say where `zoom` comes from.
**Why it matters:** Whoever implements this has to invent a mechanism, and adding React zoom state would re-render the whole map component on every zoom.
**Correction:** Pick one option and state it in the plan:
- **(a)** Follow the existing CSS-class pattern: extend `updateZoomClass` with a class for zoom ≥ 15 and hide `.leaflet-propertiesPane-pane` below it.
- **(b)** Add `zoom` to `useMapFilterStore`, updated in `MapZoomManager`'s `zoomend`.

(a) is closer to existing code and doesn't cause re-renders.

### R-03 — Medium — Increments 6 and 8.2
**Issue:** Properties are loaded with the mahalla filter when a mahalla is selected. The schema says `Street` ↔ `Mahalla` is **many-to-many**, so one street can cross mahalla borders. Properties in the 50 m buffer that belong to a neighbouring mahalla aren't loaded, so they can never become candidates.
**Why it matters:** Task.md §4.2 asks for *all* unaddressed properties within the buffer, and the street dropdown is scoped to the district (Task.md §3.3).
**Correction:** During a numbering session, load properties **by district only** (`useProperties(sessionDistrictId)`). Keep the mahalla filter only for normal browsing and the export.

### R-04 — Medium — Increment 4.3 (write routes)
**Issue:** The Server Actions call `assertActive`, but the `PATCH /api/properties/:id` and `POST /api/properties/batch-assign` routes only check the session and `canWriteDistrict`. A suspended account (`isActive = false` or `status ≠ active`) with a live session could still write through the API. Existing routes don't check this either, which is probably how the plan inherited the gap. CLAUDE.md requires `assertActive` on every protected route. `assertActive` redirects, which suits pages but not JSON routes.
**Why it matters:** It is a hole in the write authorization for a feature that changes official addresses.
**Correction:** In both write routes, return 403 `ACCOUNT_SUSPENDED` when `!isAccountActive(user)`. Optionally do the same on the two GET routes. Add the case to the Increment 4 and Increment 10 permission matrix.

### R-05 — Medium — Increment 2 (step 7, `update` branch)
**Issue:** On re-import, the upsert's `update` branch overwrites `districtId` and `mahallaId` but deliberately keeps `houseNumber`, `streetId` and `newAddress`. If a numbered property's mahalla (or district) changes, the stored `newAddress` still names the old mahalla. With a district change, the property can also end up linked to a street in another district, which breaks the consistency rule from Increment 3.
**Why it matters:** `newAddress` is the denormalized value that gets exported (Task.md §5). Silent staleness defeats the point of storing it.
**Correction:** For properties that already have a `houseNumber`, don't change `districtId` or `mahallaId` on re-import. Count them as `skippedNumberedRelocation` and log them for manual review. Alternatively, recompute `newAddress` through `buildNewAddress` when the mahalla changes. That isn't possible across districts, so skip and log in that case.

### R-06 — Medium — Approval Gates (G3), all "Done when" criteria in Increments 2–10
**Issue:** With only a production database, nearly every acceptance criterion that needs data is blocked behind G3, which is still undecided. That includes the import, all write tests, the Increment 6 polygons and the Increment 7–9 flows. Increments 3–9 can only be checked with `tsc` and `lint`. The plan acknowledges this honestly, but as written no increment after Increment 1 can be fully completed.
**Why it matters:** The requirement that every increment be independently verifiable isn't met until G3 is resolved. Without a decision, implementation would pile up many unverified increments.
**Correction:** Make the G3 decision (dev database vs controlled production writes) an explicit entry condition for starting Increment 2, not an open item at the end. If option (b) is chosen, name the test street and spell out the cleanup SQL in the plan.

### R-07 — Low — Increment 2 (step 9, `--dry-run`)
**Issue:** The dry run is restricted to "only after G2, because it reads the new table shape". But matching and conversion only read `districts`, `regions` and `mahallas`, and the dry run writes nothing to `properties`.
**Why it matters:** The mahalla match results the user cares about (Q3) could be confirmed before any migration happens.
**Correction:** Allow `--dry-run` before G2, as long as the dry-run path never queries `properties`.

### R-08 — Low — Increment 8.2 vs 8.4 "Done when"
**Issue:** §8.2 computes candidates "while a session is active". But Task.md §4.2 and the plan's own "Done when" expect highlighting as soon as a street is chosen, before the side is picked. The *Select street* phase also shows "the number of candidates found".
**Correction:** Compute candidates whenever the numbering panel has a street, in the *Select street*, *Select side* and *Numbering* phases. Gate only click assignment and the crosshair on `isActive`.

### R-09 — Low — Increment 4.2 (types)
**Issue:** `assignHouseNumberAction` returns `ActionResult<null>` but also returns `data.numbers` when there is a duplicate. `ActionResult<T>` has a single `data?: T`.
**Correction:** Type both actions so the duplicate case fits, for example `ActionResult<{ numbers: string[] } | null>`, or return `numbers` through `message` only.

### R-10 — Low — Increments 3.2–3.3 (house number normalization)
**Issue:** Normalization only trims and upper-cases, so `"05"` and `"5"` count as different numbers and get past both the server check and the unique index. A semi-auto batch always produces `"5"`, so a manually entered `"05"` would quietly coexist with it.
**Why it matters:** It is a small hole in the duplicate-prevention rule (Q5).
**Correction:** Either strip leading zeros in the Zod transform, or reject them with `regex(/^[1-9]\d*[A-Z]?(\/\d+)?$/i)` or a similar pattern. Pick whichever matches local house-numbering practice. This is a clarification for the user, not a new feature.

### R-11 — Low — Increment 4 "Done when" (read checks)
**Issue:** The GET list and detail 403 checks are listed as "allowed" read-only checks. The detail check needs an existing property id, so it depends on the G3 import.
**Correction:** Move the detail-route checks under G3, or note that they depend on the import.

### R-12 — Low — Increment 1.3 (preview flag and client version)
**Issue:** The CLI is `prisma@7.4.2` but the runtime is `@prisma/client@7.3.0`. The `partialIndexes` preview flag was only validated with the 7.4.2 CLI. Generation output and type-checking with the new flag haven't been checked yet. They are listed in "Done when", but the version mismatch isn't mentioned.
**Correction:** In Increment 1 "Done when", require `npx prisma generate` followed by `npx tsc --noEmit` with the flag enabled. Note the version skew. Aligning `@prisma/client` with the CLI would be a dependency change and needs approval.

---

## 4. Missing or Unclear Requirements

- **Map behaviour during a numbering session** when the user zooms out or the map clears selections. Not specified (R-01).
- **Where the property layer's zoom gate comes from.** Not specified (R-02).
- **Accepted house number format:** leading zeros, letter suffixes, slashes (R-10). Task.md shows "1", "2A" and "14" only.
- **Stale `newAddress` when a street is later renamed or its type changes.** Task.md says the address is computed "on every save", so recomputing on street edits isn't required. The plan should at least state that this is accepted as-is, so nobody mistakes it for an oversight. This is a clarification, not a new requirement.

---

## 5. Architectural Concerns

1. **Two sources for "the street being numbered".** `useMapFilterStore.selectedStreet` and `useNumberingSessionStore.streetId` can disagree. Once a session starts, the session should be the only source (R-01).
2. **Zoom handling.** The existing code drives zoom-dependent behaviour through CSS classes in `MapZoomManager`. The plan should reuse that rather than add a second mechanism (R-02).
3. **Route vs action auth.** The write routes leave out the account-status check that the actions have. One shared guard, or an explicit `isAccountActive` check in each route, would keep the two in step (R-04).

The rest of the architecture is consistent with the repository:
- layering: `server/data` → routes/actions → `services` → `hooks`;
- store placement;
- `'use client'` boundaries;
- the Zod schema location;
- the shared write-permission helper, which has 4 call sites.

---

## 6. Testing Gaps

| Gap | Recommendation |
|---|---|
| Zooming during a session | Zoom to 13 and back mid-session: candidates, labels and counter survive (R-01). |
| Street crossing a mahalla border | Buffer candidates in the neighbouring mahalla are highlighted and assignable (R-03). |
| Suspended account | `PATCH` and `batch-assign` return 403 for an inactive user who still has a session (R-04). |
| Re-import of numbered properties | `newAddress` isn't left stale, and relocated numbered rows are skipped and logged (R-05). |
| Leading-zero numbers | `"05"` is rejected or normalized, consistently with the duplicate check (R-10). |
| `prisma generate` with the preview flag | Generation plus `tsc` pass with `@prisma/client@7.3.0` (R-12). |
| Data-dependent checks | Blocked until G3 is decided (R-06). |

The existing checklist (Increment 10) covers the rest: the migration consistency checks, the role matrix, the duplicate paths including two tabs saving at once, export accuracy, performance and regressions.

---

## 7. Final Recommendation

**Needs Revision (minor).**

There are no Critical findings, and the database safety approach, the requirements coverage and the architecture are sound. Before implementation goes past Increment 7:
- fix **R-01** (session state vs zoom-based clearing);
- fix **R-02** through **R-05** (zoom source, district-wide loading during a session, suspended-account check on write routes, stale address on re-import);
- record the **G3** decision (R-06).

These are small additions to Increments 2, 4, 6 and 8, and they don't change the overall structure. R-07 to R-12 are small clarifications that can go in during the same revision. Increment 1's preparation work (committing the deletions, the schema change, reviewing the SQL) can start now, because it doesn't depend on any of these findings.
