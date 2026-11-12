# Implementation Plan: Property House-Numbering System (Revision 5)

> Source requirements: `Task.md`. Conventions: `CLAUDE.md`. Reviews: `context/PLAN_REVIEW.md`. Revision 1 findings are F-01 … F-18 (all resolved); Revision 4 findings are R-01 … R-12 (all resolved here, see the Findings Map).
> Revision 4 added the user's decisions A1–A4: the `.env` database is **production** and the only database available; drift option (a); a partial unique index for house numbers.
> Revision 5 resolves R-01 … R-12 and records that the user gave **conditional authorization** for gate G2 (dropping and recreating only `properties`) at the start of Increment 1.

---

## 0. Context and Ground Rules

### 0.1 Repository facts

- **The old Property feature was deleted from the working tree but not committed.** 22 files are deleted, along with edits that remove the `Property` model from `prisma/schema.prisma`. The old versions are still in `HEAD`.
- `--z-map-pane-properties: 475` already exists in `app/globals.css:53`.
- `@turf/turf` v7 includes `toWgs84`, `centroid`, `buffer` and `booleanIntersects`, and `xlsx` is installed. **No new dependencies are needed.**
- `useMapFilters()` already loads the selected district's streets with geometry. Clicking a street already calls `setSelectedStreet(id)`.
- The one-off scripts in `prisma/seed/` create their own `PrismaClient` with `PrismaPg` and match districts by `District.code`.
- Do not use `assertDistrictAccess` in `lib/auth/authorization.ts`, because it doesn't `await` the async `canAccessDistrict`. Fixing it is outside this feature's scope; new code calls `await canAccessDistrict(...)`.
- **`npm run build` runs `prisma migrate deploy`.** Any migration file that is committed and deployed is therefore **executed on production**. Adding a file under `prisma/migrations/` is treated as equivalent to running it (see §0.5).
- **Prisma 7.4.2 supports partial unique indexes natively**, behind the `partialIndexes` preview flag:
  `@@unique([streetId, houseNumber], map: "...", where: raw("\"isActive\" = true"))`.
  This was checked by validating a scratch copy of the schema (`prisma validate`) and running `prisma migrate diff --from-empty`, which emits `CREATE UNIQUE INDEX … WHERE ("isActive" = true)`. No database was involved. Because Prisma knows about the index, it doesn't show up as drift.

### 0.2 Database environment and inspection findings

| Fact | Detail |
|---|---|
| Environment in `.env` | **Production** (Railway `sakura.proxy.rlwy.net`, database `railway`). Confirmed by the user (A4). |
| Other databases | **None.** No development database exists or is configured. This plan doesn't assume one, and doesn't claim to have checked more than one environment. |
| How it was inspected | Read-only only: `BEGIN READ ONLY … ROLLBACK`, `prisma migrate status`, and `prisma migrate diff --from-config-datasource` (which only prints SQL). |

**Production `properties` table (Q1):** **0 rows**, and no other table references it. Legacy shape: `newCadNumber`, `newHouseNumber`, `oldHouseNumber`, `oldStreetName`, `oldMahallaName`, `type`, `isNew`, with FKs to `mahallas(code)` / `streets(code)`, `ON DELETE CASCADE`.

**Existing production drift. It predates this feature and is left unchanged (A2, option a):**

| Drift item | Detail |
|---|---|
| FK `streets_uzKadCode_fkey` missing | Created by migration `20260610044117_add_uzkad_streets`, absent in production. 1,401 streets have orphan `uzKadCode` values. |
| FK `uzkad_streets_districtId_fkey` missing | Same migration, absent in production. |
| Column `streets.uzkadupdatedat` (lowercase) present | Not in any migration. Contains 0 non-null values. |

`prisma migrate status` reports "up to date" because it only compares migration history. `prisma migrate dev` would detect the drift and offer to **reset the database**.

**Mahalla matching (Q3), `Yangiobod.geojson`, 365 features:**

| GeoJSON key | Result |
|---|---|
| `soato_dist = 1724231` | `District.code` → Sirdaryo tumani: 365/365 |
| `mahalla_co = "1724231017"` (120 features) | `oneId` 0 · `geoCode` 0 · **`Mahalla.code` 120/120** |
| `mahalla_co = "e174227b-…"` UUID (245 features) | Matches no column in `mahallas`. In-district name fallback: `"Yangiobod"` ↔ `"Yangiobod MFY"` after stripping the `MFY` suffix. Exactly one candidate. |
| Totals | `oneId` 0%, `geoCode` 0%, `code` 32.9%. With the name fallback: 365/365, none ambiguous. |

No feature lacks `cadastral_` or `sp_id`, and neither has duplicates. All geometries are `Polygon`.

**Read-only diff of production against the planned schema** (`prisma migrate diff --from-config-datasource --to-schema <scratch copy of the Rev-4 schema>`): the output contains only changes to `properties` plus **exactly** the three drift items above, and nothing else. That confirms the hand-written migration in §1.4 makes production match `schema.prisma`, apart from the known drift.

### 0.3 Single source of truth

| Concern | The only place it lives |
|---|---|
| `newAddress` formatting | `buildNewAddress()` in `server/data/properties.ts` |
| Validation, consistency, duplicate check and write | `assignPropertyAddresses()` in `server/data/properties.ts` |
| Duplicate-number backstop | Partial unique index `properties_streetId_houseNumber_active_key`, declared in `schema.prisma` and created by the §1.4 migration |
| Write permission | `canWriteDistrict()` in `lib/auth/authorization.ts` |
| Input validation | `lib/schemas/property-schema.ts` |
| Property list (map and export) | `GET /api/properties` → `getProperties()` |
| Numbering session state | `store/useNumberingSessionStore.ts` |

The UI writes through Server Actions only. The `PATCH` and `batch-assign` routes (Task.md §7) are thin wrappers around the same function. `/api/map/properties` is not created.

### 0.4 Decisions

| Topic | Decision | Source |
|---|---|---|
| Environment | The `.env` database is production and the only one. No dev database is assumed. If one becomes available, inspect it (§1.2) before applying anything there. | A4 |
| Migration | Prepared and shown for review (§1.4). **Not applied.** Applying requires explicit approval **and** a fresh production backup. | A1 |
| Existing drift | Left unchanged: orphan `uzKadCode` values untouched, FKs not re-added, stray column kept. Never `migrate dev` on production. Any fix is a separate task with its own approval. | A2 |
| Duplicate house numbers | Server-side checks (existing records + batch) **plus** a partial unique index on `(streetId, houseNumber) WHERE "isActive" = true`. Unique-constraint violations are turned into the same duplicate-number error. Soft-deleted properties don't reserve numbers. | Q5, A3 |
| Write permission | `district_user` → own district; `region_user` → own region; `admin` (and `superadmin`) → all; **`superuser` read-only**. Enforced on the server. | Q2 |
| Mahalla matching | `Mahalla.code` first, then a normalized name within the district, accepted only with exactly one candidate. Otherwise `null` and reported. | Q3 |
| Export button | In the map's numbering panel. `newAddress` plus the property and address details. | Q4 |
| Property zoom | `ZOOM_THRESHOLDS.PROPERTY = 15`. Performance checked in the browser. | User |
| Import script | `scripts/import-properties.ts` | User / Task.md |
| House number format (R-10) — **confirmed by the user** | The value must match **`^[1-9]\d*(?:[A-Z]|\/\d+)?$`** exactly. Accepted: `1`, `25`, `2A`, `12/1`. Rejected: `05`, `0`, `2a` (lowercase suffix), `2AB`, `12/`, empty. Message: "Uy raqami noto'g'ri formatda (masalan: 1, 2A, 12/1)". | User decision |
| House number normalization | **No silent conversion.** The only normalization is trimming surrounding whitespace, the same on frontend and backend. There is **no upper-casing** (lowercase suffixes are rejected, not converted) and **no zero-stripping** (`05` is rejected, never turned into `5`). Every accepted value is canonical, so the server duplicate check and the partial unique index compare exactly what was typed. | User decision |
| Stale `newAddress` after a street is renamed or its type changes | **Accepted as-is.** Task.md §5 computes the address "on every save" of a property, and recomputing on street edits isn't a Task requirement. Re-saving the property refreshes it. | Review §4 |

### 0.5 Database safety rules (apply to every increment)

1. **Approval to review or prepare SQL is not approval to execute it.** Each database-changing step below has its own gate, and only an explicit "approved, execute" from the user for that specific step opens it.
2. **Never run, without explicit approval for that step:** `prisma migrate deploy`, `prisma migrate dev`, `prisma migrate reset`, `prisma migrate resolve`, `prisma db push`, `prisma db execute`, `npm run build` (it runs `migrate deploy`), any data-writing script (including `scripts/import-properties.ts`), or any SQL other than `SELECT` inside `BEGIN READ ONLY`.
3. **Never run `prisma migrate dev` against production, even with approval for other steps.** It detects the existing drift and offers a reset.
4. **Don't create `prisma/migrations/<…>_rebuild_properties_table/` or commit it until gate G2 is approved.** A committed migration runs on the next production build. The prepared SQL lives in this document (§1.4) until then.
5. **Allowed without approval:** `prisma validate`, `prisma generate`, `prisma migrate diff --from-empty …`, `prisma migrate diff --from-config-datasource … --script` (prints SQL only), `prisma migrate status`, and `SELECT` inside `BEGIN READ ONLY`.
6. **No dev database means every write test is a production write** (gate G3).

---

## Increment 1 — Prerequisites, Schema and Migration (F-01, F-17, A1–A4)

> **Status: DONE (2026-11-12).** Migration `20261112130658_rebuild_properties_table` was applied to production with `prisma migrate deploy` at 13:10:14Z, under the user's conditional G2 authorization.
> - Backup: `C:\Users\j.turdimatov\manzillar-db-backups\prod_before_properties_20261112T130835Z.dump` (113,923,109 bytes, pg_dump 18.6, custom format). Verified with `pg_restore --list`; the per-table row counts in the dump match the live counts.
> - Checks: 0 rows immediately before applying.
> - After applying:
>   - `migrate status` reports up to date;
>   - the live diff shows only the three A2 drift items;
>   - the columns, indexes and constraints of every other table are identical to the pre-migration snapshot;
>   - row counts are unchanged except `_prisma_migrations` (5 → 6, Prisma's own bookkeeping row).
> - Not done: committing the migration folder and the 22 deletions. That is the user's decision.

**Goal:** Prepare the schema change and the reviewed migration SQL. Apply it **only** after gate G2.

### 1.1 Settle the uncommitted deletions (F-17)
The user commits the 22 deletions and related edits as their own commit before any new Property code is written.

### 1.2 Environment gate
- **Production:** inspected read-only, 0 rows in `properties` (§0.2). The check is repeated just before applying (§1.6, step 3).
- **Development:** none exists. If one is set up later, run these read-only checks before applying the migration there:
  ```sql
  BEGIN READ ONLY;
  SELECT count(*) FROM properties;
  SELECT conrelid::regclass FROM pg_constraint WHERE confrelid = 'properties'::regclass;
  ROLLBACK;
  ```
  Also run `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` against it and report the results. If it has rows, stop: take a backup and get a data migration plan approved first.

### 1.3 Schema change (code only; no database contact)
In `prisma/schema.prisma`:
- Add `previewFeatures = ["partialIndexes"]` to `generator client`.
- Add the `Property` model exactly as in Task.md §1, plus the partial unique index:
  ```prisma
  @@unique([streetId, houseNumber], map: "properties_streetId_houseNumber_active_key", where: raw("\"isActive\" = true"))
  ```
- Add the back-relation `properties Property[]` on `District`, `Mahalla` and `Street`.
- Run `npx prisma validate` and `npx prisma generate`. Neither touches the database.

A scratch copy of exactly this schema has already passed `prisma validate`. The SQL in §1.4 was generated from it.

**Deployment constraint:** feature code that uses `prisma.property` with the new fields must **not be deployed to production** before G2 has been executed. Until then, the production table still has the legacy shape.

### 1.4 Prepared migration SQL — FOR REVIEW ONLY, NOT APPLIED

Target path, created only after G2 is approved: `prisma/migrations/<YYYYMMDDHHMMSS>_rebuild_properties_table/migration.sql`.

The statements come from `prisma migrate diff --from-empty` on the Rev-4 schema. The drift items are deliberately left out, and a guard against existing rows is added.

```sql
-- Migration: rebuild_properties_table
-- Replaces the EMPTY legacy "properties" table with the Task.md §1 shape.
-- Deliberately does NOT touch pre-existing production drift (A2):
--   streets.uzkadupdatedat, streets_uzKadCode_fkey, uzkad_streets_districtId_fkey.

-- Safety guard: abort before any change if the legacy table contains rows.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "properties") THEN
    RAISE EXCEPTION 'Aborting rebuild_properties_table: "properties" is not empty. Back up and migrate data first.';
  END IF;
END $$;

-- DropTable (legacy, empty; its indexes and FKs are dropped with it; no other table references it)
DROP TABLE "properties";

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cadNumber" TEXT,
    "spId" TEXT,
    "spUid" TEXT,
    "propertyKind" TEXT,
    "geometry" JSONB NOT NULL,
    "center" JSONB,
    "houseNumber" TEXT,
    "newAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "districtId" TEXT NOT NULL,
    "mahallaId" TEXT,
    "streetId" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_cadNumber_key" ON "properties"("cadNumber");

-- CreateIndex
CREATE UNIQUE INDEX "properties_spId_key" ON "properties"("spId");

-- CreateIndex
CREATE INDEX "properties_districtId_idx" ON "properties"("districtId");

-- CreateIndex
CREATE INDEX "properties_mahallaId_idx" ON "properties"("mahallaId");

-- CreateIndex
CREATE INDEX "properties_streetId_idx" ON "properties"("streetId");

-- CreateIndex (A3: active properties only; soft-deleted rows do not reserve numbers)
CREATE UNIQUE INDEX "properties_streetId_houseNumber_active_key" ON "properties"("streetId", "houseNumber") WHERE ("isActive" = true);

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "mahallas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "streets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

**Review notes:**
- **NULL handling in the index:** rows with `houseNumber IS NULL` or `streetId IS NULL` never collide, because PostgreSQL treats NULLs as distinct. Unnumbered properties are unaffected.
- **Drop and recreate vs `ALTER`:** the read-only live diff produced an `ALTER`-based version. It has the same end state, but drop and recreate is used because the table is empty, and it gives the canonical column order with no partial alterations.
- **If a statement fails after the `DROP`:** the table was empty, so no data can be lost. Recovery is to fix the SQL and mark the migration with `prisma migrate resolve`, which needs its own approval.

### 1.5 Consistency checks (after G2 only)
- `npx prisma migrate status` reports all migrations applied.
- `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` prints **only** the three A2 drift items: nothing about `properties`, and in particular no `DROP INDEX` for the partial index.
- `SELECT indexdef FROM pg_indexes WHERE indexname = 'properties_streetId_houseNumber_active_key';` includes `WHERE ("isActive" = true)`.

### 1.6 Execution procedure (gate G2, explicit approval required)
1. The user approves executing the §1.4 SQL on production, after reviewing it.
2. **Fresh production backup**, taken immediately before applying:
   ```bash
   pg_dump --format=custom --no-owner --file=<backup-dir>/prod_before_properties_<timestamp>.dump "$DATABASE_URL"
   pg_restore --list <backup-dir>/prod_before_properties_<timestamp>.dump > /dev/null   # verifies the archive is readable
   ```
   Record the file name, size and timestamp. Store it outside the repository.
3. Re-run the read-only check `SELECT count(*) FROM properties;` and confirm it is 0.
4. Create the migration folder with the reviewed SQL, **unchanged**.
5. `npx prisma migrate deploy`. **Never `migrate dev`.**
6. Run the §1.5 consistency checks and report the results.
7. Commit the migration folder.

**Version note (R-12):** the CLI is `prisma@7.4.2` and the runtime is `@prisma/client@7.3.0`. That mismatch predates this feature, because `postinstall` already generates the client with the 7.4.2 CLI. The user decided to keep the current versions. `npx prisma generate` followed by `npx tsc --noEmit`, with `partialIndexes` enabled, is part of Done when.

**Done when:**
- *Preparation:*
  - schema change written;
  - `npx prisma validate` passes;
  - `npx prisma generate` passes with the preview flag (R-12);
  - `npx tsc --noEmit` shows no new errors (the 2 existing errors in `components/reports/ReportsTable.tsx` are unrelated);
  - the §1.4 SQL has been shown to the user.
  - The 22 deletions are left uncommitted until the user decides to commit them; the agent doesn't commit unless asked.
- *Execution (G2):*
  - backup taken with a `pg_dump` whose major version matches the server (18) and verified with `pg_restore --list`;
  - 0 rows confirmed just before applying;
  - `migrate deploy` succeeded;
  - all §1.5 checks pass;
  - catalog and row-count snapshots of every other table are identical before and after.
  - Committing the migration folder is the user's decision.

---

## Increment 2 — GeoJSON Import Script (F-09, F-10, Q3)

> **Status: DONE (2026-11-12).** The user authorized importing into **production** (no development database exists). This replaces the G3 dev-database precondition for this import only; write tests remain forbidden on production.
> - Script: `scripts/import-properties.ts`. Unit tests: `scripts/import-properties.test.ts` (17 tests, `npx tsx --test scripts/import-properties.test.ts`, mocked database rows, no database access).
> - Fresh backup before writing: `C:\Users\j.turdimatov\manzillar-db-backups\prod_before_property_import_20261112T133401Z.dump` (SHA-256 `6be17234dd2249cd774711f32505398d04ab6a415b3390b6e422d481e88a723f`, verified with `pg_restore --list` and per-table row counts).
> - **Dry run** (`properties` not accessed): processed 365, unmatchedDistrict 0, noKey 0, mahallaByCode 120, mahallaByName 245, mahallaAmbiguous 0, mahallaUnmatched 0.
> - **Import** at 13:35:18Z UTC (`--confirm-target=sakura.proxy.rlwy.net:45369/railway --expect-create=365`), one transaction: created 365, updated 0, unchanged 0, skippedNumberedRelocation 0, failed 0.
> - **Verified read-only:**
>   - `properties` = 365 rows, with 365 distinct `cadNumber` and 365 distinct `spId`;
>   - all rows in Sirdaryo tumani / Yangiobod MFY;
>   - `houseNumber`, `streetId` and `newAddress` null everywhere, every row active;
>   - Polygon geometry in WGS84 degrees, centres at lng 68.656–68.682, lat 40.667–40.679.
>   - Every other table has identical structure and row counts.
> - **Idempotency** (`--dry-run --compare`): 365 unchanged, 0 to create, 0 to update, 0 conflicts. The first compare reported 359 rows as changed. The cause: stored JSON coordinates lose the 17th significant digit on the way into PostgreSQL (≤ 7.1e-15°, about a nanometre). The comparison now uses a 1e-9° tolerance (~0.1 mm), covered by tests. The data was not rewritten.
>
> **Deviations from the written steps below, all stricter than planned:**
> - **Production guard:** instead of a hard-coded `--allow-production` host check, every write run must pass `--confirm-target=<host:port/db>` matching the actual `DATABASE_URL` target. `--expect-create=<n>` aborts unless the plan is exactly n creates.
> - **No partial imports:** any unmatched district, missing key, ambiguous or unmatched mahalla, duplicate identifier in the file, or key conflict with existing rows aborts **before any write**. Rows aren't imported with `mahallaId = null`.
> - **Unchanged rows are skipped:** they aren't rewritten, so a real re-run writes nothing.
> - **Comparison mode:** `--dry-run --compare` previews creates and updates by reading `properties`. Plain `--dry-run` never accesses it.

**File:** `scripts/import-properties.ts` (new). No new dependencies. Writing the script is code-only.

**Entry condition (R-06):** the **G3 decision** (a dev database, or controlled production writes with a named test scope and cleanup SQL) must be recorded in this plan **before the real import runs**. The `--dry-run` can run without it (R-07). A real run writes to production, needs gate G3, and can't happen before G2.

1. Load `dotenv`. Create the Prisma client the way `prisma/seed/migrate-properties.ts` does.
2. Read the path from `process.argv[2]`, defaulting to `./Yangiobod.geojson`. Fail fast unless `crs.properties.name === 'EPSG:3857'`.
3. Preload districts, regions and **active** mahallas (`id, code, name, uzKadName, districtId`).
4. **District match:** `District.code === soato_dist`. Fallback: `normalize(district_n)` among districts of the region with `code === soato_regi`. If still unmatched, skip and count as `unmatchedDistrict`.
5. **Mahalla match:**
   - a. `Mahalla.code === mahalla_co` within the district → `mahallaByCode`.
   - b. Otherwise, exactly one in-district match on `normalizeMahalla(name | uzKadName) === normalizeMahalla(mahalla_na)` → `mahallaByName`.
   - Two or more matches → `null`, counted as `mahallaAmbiguous` and logged.
   - None → `null`, counted as `mahallaUnmatched`.
   - `normalizeMahalla` = NFC, unify apostrophes, trim, lowercase, strip a trailing `" mfy"`.
6. Convert with `toWgs84(feature)`, then `centroid(...)`.
7. **Upsert:**
   - Key: `cadNumber`, or `spId` when there is no cadastral number. A feature with neither is counted as `noKey`.
   - `update` sets only `geometry, center, spUid, propertyKind, districtId, mahallaId`. It **never** touches `houseNumber`, `streetId`, `newAddress` or **`isActive`**, so the import never reactivates a soft-deleted property (A3).
   - **Numbered properties aren't relocated (R-05):** if an existing row has a `houseNumber` **and** its matched `districtId` or `mahallaId` differs from the stored value, update only `geometry, center, spUid, propertyKind`. Keep the stored district and mahalla, count the row as `skippedNumberedRelocation`, and log its cadastral number with the old and new values for manual review. This keeps `newAddress` and the street–district consistency rule valid.
8. Print progress every 100 features, then a summary of all the counters.
9. Add a `--dry-run` flag that does the matching and conversion and prints the counters, but writes nothing. **The dry-run path never queries `properties`**: it only reads `districts`, `regions` and `mahallas`. That makes it allowed **before G2 and before G3** (R-07), so it can confirm the Q3 matching early.

**Done when:**
- `--dry-run` reports `mahallaByCode = 120`, `mahallaByName = 245`, `mahallaAmbiguous = 0`, `mahallaUnmatched = 0`, `unmatchedDistrict = 0`, `noKey = 0`.
- *After G3:* a re-run with an unchanged file reports `skippedNumberedRelocation = 0`.
- *After G3:* the first run gives `created = 365`; the second gives `created = 0`, `updated = 365`, and the row count doesn't change; centres fall inside Sirdaryo tumani, in degrees.
- `npx tsc --noEmit` passes.

---

## Increment 3 — Server Data Layer, Schemas and Types (F-07, F-08, F-11, Q5, A3)

> **Status: DONE (2026-11-12).**
> - Files: `types/property.ts`, `lib/schemas/property-schema.ts`, `server/data/properties.ts` (plus barrel exports).
> - Tests: `lib/schemas/property-schema.test.ts`, `server/data/properties.test.ts`, run with `npm test` (`tsx --test`, no database; the data-layer tests use an in-memory fake Prisma client that enforces the partial unique index and rolls back on errors).
>
> **Testing policy (user decision, 2026-11-12):** automated E2E tests are **not** required and won't be written. A missing development database no longer blocks any increment. Unit tests and mocked database tests cover the business logic; the **user tests manually**. Production write tests by the agent are still forbidden. This supersedes the "run under gate G3" clauses in this and later increments.
>
> **Decisions made during implementation:**
> - **`MFY` suffix:** every active production mahalla name already ends with " MFY" (9,445) or " mfy" (7). `buildNewAddress` strips a trailing `MFY` (any case) before appending " MFY", so the address reads "Yangiobod MFY", never "Yangiobod MFY MFY".
> - **Street type (O4, user decision 2026-11-12):** the address uses the possessive form, as in Task.md's example. `buildNewAddress` lowercases the first letter and appends `si` when the type ends with `ko'cha` (any apostrophe variant). Production types `Ko'cha`, `Tor ko'cha`, `Berk ko'cha` and `Shoh ko'cha` become "ko'chasi", "tor ko'chasi", "berk ko'chasi" and "shoh ko'chasi", so the address reads "Shiroq-3 **berk ko'chasi**, 1-uy". A type already ending in `ko'chasi` is left as is.
> - **Two-phase write:** the partial unique index isn't deferrable, so `assignPropertyAddresses` first clears `houseNumber` on the targeted rows, then writes the new values, all in the same transaction. That allows swapping numbers within a batch, as the plan intended.
> - **Defensive check:** `INVALID_HOUSE_NUMBER` was added to the result union for the data-layer `HOUSE_NUMBER_REGEX` check (planned in 3.2, missing from the union in 3.3).
> - **P2002 detection:** `@prisma/adapter-pg` reports violated **columns**, not the index name (`meta.driverAdapterError.cause.constraint.fields = ['"streetId"', '"houseNumber"']`, read from the adapter source). `isHouseNumberConflict` matches on those columns, on `meta.target`, or on the index name.
> - **Testability:** `assignPropertyAddresses(streetId, items, db = prisma)` takes an optional client so the mocked tests can inject a fake. Production callers use the default.
> - **ESLint repaired:**
>   - `eslint-config-next` `^0.2.4` (an old, unrelated Babel-era release) → `16.1.6`, matching `next`.
>   - `eslint` `^10.0.0` → `^9.39.5`: the bundled `eslint-plugin-react` 7.37.5 supports ESLint only up to `^9.7`, and crashed on ESLint 10's removed `context.getFilename()`.
>   - Other versions unchanged (Prisma CLI 7.4.2, Client 7.3.0, Next 16.1.6), apart from four transitive patch/minor bumps.
>   - Baseline findings in existing code: 117 (40 errors, 77 warnings). New files: 0.

### 3.1 `types/property.ts` + export from `types/index.ts`
- `PropertyListItem`:
  ```ts
  { id, cadNumber, propertyKind, houseNumber, newAddress, streetId, mahallaId, geometry,
    mahalla: { name } | null, street: { name, type } | null }
  ```
- `PropertyDetail`:
  ```ts
  { id, cadNumber, houseNumber, newAddress, streetId, districtId,
    mahalla: { id, name } | null, street: { id, name, type } | null }
  ```
- No `NumberingSession` type here.

### 3.2 `lib/schemas/property-schema.ts` + export from `lib/schemas/index.ts`
- `propertyAssignSchema`:
  ```ts
  { streetId min 1 "Ko'cha tanlanishi kerak",
    houseNumber trim min 1 "Uy raqami kiritilishi kerak" max 10
                → regex HOUSE_NUMBER_REGEX "Uy raqami noto'g'ri formatda (masalan: 1, 2A, 12/1)" }
  ```
- **One regex, one schema, used everywhere:**
  - `HOUSE_NUMBER_REGEX = /^[1-9]\d*(?:[A-Z]|\/\d+)?$/` is exported from `lib/schemas/property-schema.ts` together with the schemas. It is used by:
    - the **frontend** form (`PropertyPanel` via `zodResolver(propertyAssignSchema)`);
    - the **backend** Server Action and `PATCH` route (`propertyAssignSchema.safeParse`);
    - the **data layer**, as a defensive `HOUSE_NUMBER_REGEX.test` on every item in `assignPropertyAddresses` before writing. This covers the batch path, which builds `String(n)` from positive integers and so always matches `^[1-9]\d*$`.
  - **No transform**, apart from `.trim()`. "2a" and "05" fail validation with the message above.
- **Database:** stored values are only written through `assignPropertyAddresses`, so the partial unique index always compares canonical strings. A database `CHECK` constraint enforcing the same regex would need a **new production migration**, which hasn't been authorized. It isn't part of this plan, and it would be a separate approved task if wanted.
- `batchAssignSchema`:
  ```ts
  { streetId, assignments: [{ propertyId, houseNumber: int > 0 }] min 1 max 1000 }
  ```
  with the refinements "Takroriy bino" and "Takroriy uy raqami".

### 3.3 `server/data/properties.ts` + export from `server/data/index.ts`
- `buildNewAddress({...})`: the only formatter.
- `getProperties({ districtId, mahallaId?, streetId? })`: `isActive: true`, lean `select`.
- `getPropertyById(id)` → `PropertyDetail | null`
- `getStreetDistrictId(streetId)` → `string | null`. Active streets only.
- `assignPropertyAddresses(streetId, items: { propertyId; houseNumber: string }[])` returns one of:
  ```ts
  | { ok: true; count }
  | { ok: false; error: 'STREET_NOT_FOUND' | 'PROPERTY_NOT_FOUND' | 'DISTRICT_MISMATCH' | 'MAHALLA_MISSING' }
  | { ok: false; error: 'DUPLICATE_HOUSE_NUMBER'; numbers: string[] }
  ```
  It runs inside `prisma.$transaction(async (tx) => …)`, at the default isolation level:
  1. Load the street with the district and region names.
  2. Load all target properties with **one** `findMany`.
  3. Reject if a property is missing, if the district doesn't match the street's, or if the mahalla is missing.
  4. **Batch check:** reject if a `houseNumber` appears twice in `items`.
  5. **Existing-record check:**
     ```ts
     tx.property.findMany({
       where: { streetId, isActive: true, houseNumber: { in }, id: { notIn: itemIds } },
     })
     ```
     If anything comes back, return `DUPLICATE_HOUSE_NUMBER` with the conflicting numbers. The rows being written are excluded, so re-saving a property with its own number, or swapping numbers within a batch, is allowed.
  6. Update each property with `{ houseNumber, streetId, newAddress }`.
  - **Database backstop (A3):** catch `Prisma.PrismaClientKnownRequestError` with `code === 'P2002'` where the violated constraint is `properties_streetId_houseNumber_active_key`. Check both `meta.target` and the driver-adapter shape, `meta.driverAdapterError.cause.constraint`, because `@prisma/adapter-pg` reports it there. Return `{ ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: [] }`, so the caller shows the same message. This covers two sessions passing step 5 at the same moment. Serializable isolation isn't needed, because the index guarantees the outcome.
- **Reactivation (A3):** this feature has no code path that sets `isActive = true`. The import never touches `isActive` (Increment 2), and Task.md has no deactivate or reactivate UI, so no unused helper is added (CLAUDE.md). **Rule for any future reactivation path:** it must run step 5 for the property's `(streetId, houseNumber)` before writing, and map `P2002` the same way. Even without that, the partial index makes the reactivation fail instead of creating a duplicate.

**Done when:**
- `tsc` and `lint` pass.
- `buildNewAddress` returns exactly `Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 1-uy`. This is a pure function, checked with a throwaway `tsx` call (no database).
- The database-backed checks (duplicate pre-check, P2002 mapping, district mismatch, re-save of the same number) are **run under gate G3**. There is no dev database.

---

## Increment 4 — Authorization, Server Actions and API Routes (F-02, F-03, Q2)

> **Status: DONE (2026-11-12).**
> - `canWriteDistrict` in `lib/auth/authorization.ts`.
> - `assignErrorMessage` / `assignErrorStatus` in `server/data/properties.ts`, the shared error mapping used by both actions and both write routes.
> - `app/actions/property-action.ts`: `assignHouseNumberAction`, `batchAssignHouseNumbersAction`, both returning `ActionResult<{ count } | { numbers }>`.
> - Routes: `app/api/properties/route.ts`, `app/api/properties/[id]/route.ts` (GET, PATCH), `app/api/properties/batch-assign/route.ts`.
> - Order of checks: session → account active → superuser (writes) → Zod → street's district → `canWriteDistrict` → `assignPropertyAddresses`.
> - Status codes: duplicate number → 409 with `numbers`; street or property not found → 404; mismatch, missing mahalla or invalid number → 400.
>
> **Verified:**
> - `tsc`: no new errors. ESLint: changed files clean, repo total unchanged (117).
> - Existing tests still pass.
> - `next build` registers the three routes.
> - Local `next start`: all four endpoints return 401 without a session.
>
> No new tests were written (user decision: keep it simple, manual testing).

### 4.1 `canWriteDistrict` in `lib/auth/authorization.ts`
```ts
export async function canWriteDistrict(user: SessionUser, districtId: string): Promise<boolean> {
  if (isSuperuser(user)) return false;
  if (!hasMinRole(user, UserRole.district_user)) return false;
  return canAccessDistrict(user, districtId);
}
```

### 4.2 `app/actions/property-action.ts` + export in `app/actions/index.ts`
Return types (R-09):
- `assignHouseNumberAction(propertyId, data): Promise<ActionResult<{ numbers: string[] } | null>>`
- `batchAssignHouseNumbersAction(input): Promise<ActionResult<{ count: number } | { numbers: string[] }>>`

`numbers` is filled in only on `DUPLICATE_HOUSE_NUMBER`. `ActionResult` itself stays unchanged.

Both actions follow these steps:
1. Session, then `assertActive`.
2. Superuser → `SUPERUSER_DENIED_MESSAGE`.
3. Zod.
4. `getStreetDistrictId`.
5. `await canWriteDistrict`, otherwise `FORBIDDEN`.
6. `assignPropertyAddresses`.

Error messages:
- `PROPERTY_NOT_FOUND` → "Bino topilmadi"
- `STREET_NOT_FOUND` → "Ko'cha topilmadi"
- `DISTRICT_MISMATCH` → "Bino va ko'cha bir tumanda emas"
- `MAHALLA_MISSING` → "Binoning mahallasi aniqlanmagan"
- `DUPLICATE_HOUSE_NUMBER` → "Bu ko'chada {numbers} uy raqami allaqachon mavjud". When `numbers` is empty (the index path): "Bu ko'chada ushbu uy raqami allaqachon mavjud". `data.numbers` is returned too.

### 4.3 API routes
401 without a session, 403 on access failure, 500 on unexpected errors.

**Account status (R-04):** right after the session check, all four routes return **403 `{ success: false, error: 'ACCOUNT_SUSPENDED' }`** when `!isAccountActive(session.user)`. `assertActive` redirects, which suits pages and actions but not JSON routes. This puts the routes on the same footing as the actions, which call `assertActive`.

| Route | Behaviour |
|---|---|
| `GET /api/properties?districtId=&mahallaId=&streetId=` | `districtId` required. `canAccessDistrict`. `getProperties`. |
| `GET /api/properties/:id` | 404 if not found. 403 unless `canAccessDistrict(property.districtId)`. |
| `PATCH /api/properties/:id` | `propertyAssignSchema` + `canWriteDistrict`. `DUPLICATE_HOUSE_NUMBER` → **409** with `numbers`. |
| `POST /api/properties/batch-assign` | Same as PATCH, with `batchAssignSchema`. |

**Done when:**
- `tsc` and `lint` pass.
- Read-only checks that need no data (allowed now): 401 without a session; `GET /api/properties?districtId=<other district>` returns 403; a suspended account gets 403 `ACCOUNT_SUSPENDED` on the list route.
- Under **G3** (R-11): the detail-route checks, which need an imported property id; the write role matrix; superuser denial; suspended-account denial on PATCH and batch; district mismatch; 409; atomic batch.

---

## Increment 5 — Client Data Layer (F-03, F-12)

> **Status: DONE (2026-11-12).**
> - `ApiRoutes.PROPERTIES`.
> - `services/properties.ts`: `fetchProperties(districtId, mahallaId?)`, `fetchPropertyById(id)`.
> - `hooks/useProperties.ts`:
>   - `useProperties(districtId, mahallaId?)` → `{ properties, isLoadingProperties, dataUpdatedAt }`, key `['properties', districtId, mahallaId ?? '']`, `staleTime: Infinity`;
>   - `usePropertyById(id)` → `{ property, isLoadingProperty }`, key `['property', id]`.
> - Barrel exports added.
> - No write callers: writes go through the Server Actions.
> - Checks: `tsc` no new errors; ESLint clean on changed files (repo total unchanged at 117); existing tests pass; `next build` passes.

- `ApiRoutes.PROPERTIES = '/properties'`.
- `services/properties.ts`: `fetchProperties(districtId, mahallaId?)` and `fetchPropertyById(id)`. No write callers.
- `hooks/useProperties.ts`:
  - `useProperties(districtId, mahallaId?)`: key `['properties', districtId, mahallaId ?? '']`, `staleTime: Infinity`. Returns `dataUpdatedAt`.
  - `usePropertyById(id)`: key `['property', id]`.
- **Invalidation after a write:** `['properties', districtId]` and `['property', id]`.

**Done when:** `tsc` and `lint` pass, and the list request carries the lean payload. Read-only; needs G2 for the table to exist in the new shape.

---

## Increment 6 — Map Property Layer (F-11, F-12, F-16)

> **Status: DONE (2026-11-12).**
> - Store: `showProperties` with its setter.
> - Constants: `ZOOM_THRESHOLDS.PROPERTY = 15`; styles `property` (grey), `propertyDone` (green), `highlight.property` (blue).
> - Map: `propertiesPane`; "Binolar" toggle (`Building2`).
> - `useMapFeatures.propertyFeatures` with `{ id, houseNumber, cadNumber, done }`.
> - `useMapHandlers.onEachProperty`: tooltip shows the house number, or the cadastral number if none; hover highlight; clicks stopped from reaching the map.
> - `UzbekistanMap` loads `useProperties(selectedDistrict, selectedMahalla)` and renders the layer, keyed by `dataUpdatedAt` so it repaints after writes.
> - Zoom gate: `MapZoomManager` toggles `zoom-properties` on the map container; `globals.css` hides `.leaflet-propertiesPane-pane` without it.
> - **Deferred to Increment 8:** `propertyCandidate` and `NUMBERING_BUFFER_METERS`, which only semi-auto mode uses (avoids unused exports).
> - Checks: `tsc` no new errors; ESLint repo total unchanged at 117 (the findings in `MapZoomManager.tsx` and `useMapFeatures.ts` are pre-existing); tests pass; `next build` passes. The visual and performance checks are the user's manual test.

1. **`useMapFilterStore`:** `showProperties` (default `true`) and its setter.
2. **`lib/constants/map.ts`:** `ZOOM_THRESHOLDS.PROPERTY = 15`, `NUMBERING_BUFFER_METERS = 50`, and the styles `property` (grey), `propertyDone` (green), `propertyCandidate` (amber) and `highlight.property` (blue).
3. **`MapPanes.tsx`:** `propertiesPane`. The CSS variable already exists.
4. **`MapLayersControl.tsx`:** "Binolar" toggle.
5. **`useMapFeatures`:** `propertyFeatures` with `{ id, houseNumber, cadNumber, done }`.
6. **`useMapHandlers.onEachProperty`:** tooltip, hover, `stopPropagation` on click.
7. **`UzbekistanMap`:** render the layer when `showProperties && selectedDistrict`, with key `` `properties-${district}-${mahalla}-${dataUpdatedAt}` ``.
8. **Zoom gate (R-02), using the existing CSS-class pattern:** `MapZoomManager.updateZoomClass` already toggles zoom classes such as `.zoom-high` on `zoomend`. Extend it to toggle a `zoom-properties` class when `zoom >= ZOOM_THRESHOLDS.PROPERTY`. In `app/globals.css`, hide the pane unless that class is present: `.leaflet-container:not(.zoom-properties) .leaflet-propertiesPane-pane { display: none; }`. `updateZoomClass` adds its classes to `map.getContainer()`, which is the `.leaflet-container` element, so the selector matches. It already runs on mount and on `zoomend`. This adds no React zoom state and no re-render on zoom.

**Done when:**
- 365 grey polygons appear at zoom 15 or more (after G2 + G3 import) and are hidden below it.
- The toggle and tooltip work.
- **Performance check** recorded: no long tasks over ~200 ms while panning and zooming.
- No regressions.
- `tsc` and `lint` pass.

---

## Increment 7 — Manual Numbering Panel (Task.md §3; F-13, Q5)

> **Status: DONE (2026-11-12).**
> - `store/usePropertySheetStore.ts`.
> - Clicking a building calls `openSheet(id)` (in `useMapHandlers.onEachProperty`).
> - `components/map/PropertyPanel.tsx`:
>   - read-only cadastral number, mahalla, current street and current address (or "Manzil berilmagan");
>   - form with `react-hook-form` + `zodResolver(propertyAssignSchema)`, prefilled with `reset` from the saved values;
>   - submits `assignHouseNumberAction`. On success: toast, invalidate `['properties', districtId]` and `['property', id]`, close. A duplicate or invalid number becomes a field error; other errors become a toast.
> - `components/map/StreetSearchSelect.tsx`: a searchable street picker.
>   - Why: Sirdaryo tumani has 1,100 streets (up to 4,505 in a district) and names repeat (941 distinct), so a plain select is unusable.
>   - Shows "Name (type)", matches regardless of apostrophe variant, lists at most 50 matches. It will be reused by the Increment 8 panel.
> - Streets come from `useStreets(districtId)`, the same cache as the map's street layer, so no extra request.
> - **Placement:** top-right, 320 px wide, drawn over the statistics card while open. Height capped at `calc(50% - 6rem)` with internal scrolling, so it never covers the zoom controls at the right-middle.
> - The sheet closes when the map unmounts.
> - Checks: `tsc` no new errors; ESLint clean on changed files (repo total unchanged at 117); tests pass; `next build` passes. Functional checks are the user's manual test.

1. **`store/usePropertySheetStore.ts`.**
2. **`onEachProperty` click:** `openSheet(id)`.
3. **`PropertyPanel.tsx`:**
   - read-only cadastral number, mahalla, current street and current `newAddress`;
   - `react-hook-form` + `propertyAssignSchema`, with `reset` to the current values;
   - `assignHouseNumberAction`: on success, toast, invalidate and close; on `DUPLICATE_HOUSE_NUMBER`, show a field error on `houseNumber`;
   - right-hand column; check it doesn't overlap the existing controls.

**Done when:**
- The panel shows the current data.
- Saving "Shiroq-3" / "1" turns the polygon green without a reload and stores the exact `newAddress`.
- Reopening the panel shows the saved values prefilled.
- A duplicate number shows the field error and writes nothing.
- A superuser is denied.
- Saving is a production write, done under **G3**.
- `tsc` and `lint` pass.

---

## Increment 8 — Semi-Automatic Numbering (Task.md §4, §6, §9; F-05, F-06, Q5)

> **Status: DONE (2026-11-12).**
>
> **`store/useNumberingSessionStore.ts`** holds the panel and the session in one place: `isPanelOpen`, `streetId`, `side`, `startInput`, `isActive`, `currentNumber`, `assignments`.
> - Actions: `openPanel` (closes the sheet), `setStreet` (ignored while active), `setSide`, `startSession` (validates parity, closes the sheet), `assignNext` (does nothing for an already assigned building), `undoLast`, `cancelSession`, `switchSide`, `endSession`.
> - One store means the map, the click handler, `MapZoomManager` and the panel all read the same session street (R-01).
>
> **Candidates** (`useMapFeatures`):
> - `turf.buffer(street, NUMBERING_BUFFER_METERS = 50 m)` intersected with unaddressed buildings, minus those already assigned.
> - Computed as soon as the panel has a street (R-08). The buffer is memoized per street and the intersection per data load.
> - Features carry `candidate` and `assignedNumber`; `getPropertyStyle` in `lib/constants/map.ts` gives grey, green, amber (candidate) or orange (assigned).
>
> **Map behaviour:**
> - Candidates pulse (CSS class added on the SVG path).
> - Assigned buildings show permanent number labels; the layer key includes the street, `isActive` and the assignment count.
> - During a session, clicks assign only candidates; other clicks show the toast "Bu bino tanlangan ko'cha yaqinida emas"; the sheet never opens.
> - Street clicks are locked during a session. `MapZoomManager` skips zoom-based clearing during a session, and empty-map clicks no longer reset the selection (R-01).
> - Crosshair cursor while numbering.
> - While the panel has a street, buildings load district-wide (R-03).
>
> **`components/map/NumberingModePanel.tsx`:**
> - **Idle:** "Raqamlash" button at the bottom-right, shown once a district is selected.
> - **Setup:** "Select street" and "Select side" merged into one view: street picker (`StreetSearchSelect`, synced with map street clicks), candidate count, side buttons, start number with the odd/even check. "Boshlash" stays disabled without a street, with an invalid start number, or with 0 candidates.
> - **Numbering:** "Belgilandi: N ta | Keyingi raqam: M", assigned number chips, "Orqaga qaytish", "Saqlash", "Bekor qilish" (discards and returns to setup), and X to close.
> - **Saving:** on success: toast, invalidate, `switchSide()`, and a "Tugatish" button appears. On a duplicate, the session is kept and the conflicting chips turn red (all of them when the database index reported the conflict).
>
> **Deferred to Increment 9:** the "Excel" button.
>
> Checks: `tsc` no new errors; ESLint repo total unchanged at 117; tests pass; `next build` passes. Functional checks are the user's manual test.

### 8.1 `store/useNumberingSessionStore.ts`
- `startSession` also closes the sheet.
- `assignNext` does nothing if the property is already assigned.
- `undoLast` removes the last assignment and steps back by 2.
- `switchSide` keeps the street, flips the side, resets the start number and clears the assignments.
- `endSession` resets everything.

### 8.1a The numbering street has one source (R-01)
- The panel keeps a **numbering street** (`numberingStreetId`, local panel state, initialized from `selectedStreet` when the user picks a street in the dropdown or on the map). `startSession(numberingStreetId, …)` copies it into the session store.
- **After `startSession`, everything reads `useNumberingSessionStore.streetId`**: the buffer, the candidates, labels, the save call and `switchSide`. `selectedStreet` is never used again until `endSession()`.
- **`MapZoomManager` (edit):** `handleZoomBasedClearing` returns early when `useNumberingSessionStore.getState().isActive`. Zooming out during a session therefore doesn't clear the street, mahalla or district.

### 8.2 Candidates
- `candidates = buffer(street, 50 m) ∩ properties that are not done and not in assignments`.
- Computed **whenever the panel has a numbering street**: in the *Select street*, *Select side* and *Numbering* phases (R-08). Candidates are highlighted, and the *Select street* phase shows how many were found, as soon as a street is chosen (Task.md §4.2). Only the crosshair cursor and click assignment depend on `isActive`.
- **Data scope during numbering (R-03):** while the panel has a numbering street, properties are loaded by **district only**, with `useProperties(numberingDistrictId)` and no mahalla filter. A street can cross mahalla borders (Street ↔ Mahalla is many-to-many). Outside numbering, the layer keeps the mahalla filter.

### 8.3 Map while a session is active
- Candidates pulse amber.
- Assigned properties get permanent number tooltips; the layer key includes `isActive` and `assignments.length`.
- Only candidates are clickable; other clicks show the toast "Bu bino tanlangan ko'cha yaqinida emas".
- Crosshair cursor.
- Street clicks are locked.
- The sheet never opens.

### 8.4 `NumberingModePanel.tsx`
- **Idle:** "Raqamlash" and "Excel".
- **Select street:** dropdown synced with `selectedStreet`, so clicking a street on the map fills it.
- **Select side:** buttons and a start number input, odd for the left side and even for the right.
- **Numbering:**
  - counter "Belgilandi: N ta | Keyingi raqam: M";
  - Undo;
  - Saqlash → `batchAssignHouseNumbersAction`:
    - on success: toast, invalidate, `switchSide()`;
    - on `DUPLICATE_HOUSE_NUMBER`: keep the session, show the message, and mark the conflicting assignments in red (all of them when `numbers` is empty);
  - Bekor qilish.
- **"Tugatish"** after a save.

**Done when:**
- Choosing a street highlights the candidates and shows their count **before** a side is picked (R-08). The crosshair cursor appears once numbering starts.
- **Zoom resilience (R-01):** during a session, zooming out to 13, then 8, and back keeps the street, district, candidates, number labels and counter unchanged.
- **Mahalla border (R-03):** for a street that crosses into a neighbouring mahalla, buffer properties on both sides of the border are candidates and can be assigned.
- Three clicks show 1, 3 and 5, and the counter reads "Belgilandi: 3 ta | Keyingi raqam: 7".
- Repeat and non-candidate clicks are ignored.
- Undo works.
- The start-number parity check works.
- Under **G3**:
  - the batch save is atomic;
  - the panel switches side after saving;
  - a duplicate against an existing number is rejected and the session is kept.
- `tsc` and `lint` pass.

---

## Increment 9 — Excel Export (Task.md §5, §8 Step 9; F-04, Q4)

- **`hooks/useExportProperties.ts`:** mirrors `useExportStreets`.
  - Columns: Kadastr raqami, Mulk turi, Mahalla, Ko'cha (name + type with the first letter lowercased), Uy raqami, Yangi manzil.
  - Sheet "Binolar".
- **Button:** "Excel" in the idle numbering panel. Scope is the selected district, narrowed to the mahalla when one is selected.

**Done when:**
- One row per active property.
- "Yangi manzil" matches the database exactly.
- A `district_user` can only export their own district.
- `tsc` and `lint` pass.
- Read-only.

---

## Increment 10 — End-to-End Verification (F-15)

| Area | Check |
|---|---|
| Build | `npx tsc --noEmit`, `npm run lint` and `npx next build` (**not** `npm run build`, which runs `migrate deploy`). |
| Migration | §1.5 checks: only the three A2 drift items remain, and the partial index is present with its `WHERE`. |
| Import | `--dry-run` counters; after G3, real counters and an idempotent re-run. |
| Permissions | Read checks are free. The write matrix (district_user / region_user / admin / superuser / **suspended account** × own / other scope) runs under G3. |
| Map session | Zooming during a session (R-01), a street crossing a mahalla border (R-03), highlighting as soon as a street is chosen (R-08). |
| House number format | `1`, `25`, `2A`, `12/1` accepted; `05`, `0`, `2a`, `2AB`, `12/` rejected, with the same message from the form, the action and the PATCH route. No value is silently changed (R-10). |
| Re-import | `skippedNumberedRelocation` logged; no stale `newAddress` (R-05). |
| Duplicates | Manual, batch vs existing, within the batch, re-save of the same property, and two tabs saving at once (the index path must return the same message). Under G3. |
| Manual / semi-auto / export | Increments 7–9 "Done when" items. |
| Performance | Zoom-15 result recorded. |
| Regression | Existing layers, street export and dashboard. |
| Conventions | No unused exports, no `NumberingSession` in `types/`, no write service callers, no `/api/map/properties`, Uzbek UI, no new dependencies. |
| Cleanup | All G3 test writes cleaned up as agreed under G3 (see Approval Gates). |

**Done when:** every row is checked and recorded, and every failure is either fixed or accepted by the user.

---

## Dependency Order

```
1 Schema + prepared SQL ──[G2 execute]──► 2 Import (dry-run ─[G3]─► run) ─► 3 Server data ─► 4 Auth/actions/routes ─► 5 Client data
                                                                                                      │
                                                    6 Map layer ◄─────────────────────────────────────┘
                                                        │
                                             7 Manual ─► 8 Semi-auto ─► 9 Export ─► 10 Verification
```

Increments 3–9 can be **coded** before G2 (`tsc`, `lint` and `next build` don't touch the database). They can't be **run or deployed** against production until G2 is executed.

---

## Findings Map

| ID | Resolution | Where |
|---|---|---|
| F-01 | Production inspected read-only (0 rows). Migration prepared in full and shown for review; not applied; guard against existing rows; fresh backup required; never `migrate dev`. | §0.2, §0.5, Inc 1 |
| F-02 | `canWriteDistrict` (Q2 matrix); district consistency; detail access check | Inc 3–4 |
| F-03 | Actions are the only UI write path; routes are thin wrappers; one list endpoint | §0.3, Inc 4–5 |
| F-04 | Excel export in the numbering panel | Inc 9 |
| F-05 | Buffer candidates, pulse, crosshair, click gating | Inc 8 |
| F-06 | Duplicate-click guard, live labels, parity check, side switch, street from the map, locks | Inc 8 |
| F-07 | Single `buildNewAddress`; `MAHALLA_MISSING` | Inc 3 |
| F-08 | Zod batch schema, single `findMany`, transaction | Inc 3 |
| F-09 | Matching rules based on the actual data; ambiguous matches not assigned; idempotent upsert; `--dry-run` | Inc 2 |
| F-10 | `turf.toWgs84` | Inc 2 |
| F-11 | Lean DTO, zoom threshold, no duplicate session type | Inc 3, 6 |
| F-12 | Layer keys and invalidation | Inc 5–8 |
| F-13 | Current street and address, prefilled form | Inc 7 |
| F-14 | Order revised; 10 increments | Dependency Order |
| F-15 | "Done when" everywhere, plus Inc 10 | All |
| F-16 | Existing CSS variable reused | Inc 6 |
| F-17 | Deletions committed first | Inc 1.1 |
| F-18 | Superseded by Q5/A3: server checks **plus** a partial unique index, P2002 mapped to the same error, soft-deleted rows don't reserve numbers | §1.4, Inc 3 |
| R-01 | Session `streetId` is the only source after start; `MapZoomManager` skips clearing while a session is active; zoom test added | Inc 8.1a, 8 Done when |
| R-02 | Zoom gate via the existing `updateZoomClass` CSS-class pattern; no React zoom state | Inc 6 step 8 |
| R-03 | District-wide property loading while numbering | Inc 8.2 |
| R-04 | `isAccountActive` → 403 `ACCOUNT_SUSPENDED` on all four routes | Inc 4.3 |
| R-05 | Numbered properties aren't relocated on re-import; `skippedNumberedRelocation` logged | Inc 2 step 7 |
| R-06 | The G3 decision is an entry condition for the real import | Inc 2, Approval Gates |
| R-07 | `--dry-run` never queries `properties`; allowed before G2 and G3 | Inc 2 step 9 |
| R-08 | Candidates computed as soon as a street is chosen; only clicks and the cursor depend on `isActive` | Inc 8.2 |
| R-09 | Action return types carry `numbers` | Inc 4.2 |
| R-10 | User-confirmed regex `^[1-9]\d*(?:[A-Z]|\/\d+)?$`; trim only, no upper-casing or zero-stripping; one shared `HOUSE_NUMBER_REGEX` for frontend, backend and data layer | §0.4, Inc 3.2 |
| R-11 | Detail-route checks moved under G3 | Inc 4 Done when |
| R-12 | Version skew documented; generate + tsc with the preview flag are in Done when | Inc 1 |

---

## Approval Gates

Each gate opens only with explicit approval for that gate. Approving a review is not approval to execute.

| Gate | What it allows | Preconditions | Status |
|---|---|---|---|
| **G1 — Review the migration SQL** | Nothing runs. The SQL is shown to the user, and every destructive statement is confirmed to target only `properties`. | — | Shown at Increment 1 execution |
| **G2 — Execute the migration on production** | §1.6: fresh `pg_dump` backup, re-check 0 rows, create the migration folder, `prisma migrate deploy`, §1.5 checks. | Schema change written | **Conditionally authorized by the user** (Increment 1 start). Conditions: only `properties` dropped and recreated; nothing else touched; SQL shown and verified first; fresh backup; 0 rows immediately before; post-migration checks. **If any condition can't be verified, stop and ask.** Committing the deletions (1.1) is no longer a precondition, by the user's choice. |
| **G3 — Write test and import data to production** | Running `scripts/import-properties.ts` (365 rows) and every write test in Increments 3, 4, 7, 8 and 10, which create real house numbers and addresses in production. | G2 executed | **Not approved. Decision needed** (see below) |
| **G4 — Deploy feature code to production** | Merging and deploying code that uses the new `Property` shape. | G2 executed | **Not approved.** |
| **(Separate task) — Fix the drift** | Anything touching the 1,401 orphans, the missing uzkad FKs or `streets.uzkadupdatedat`. | Its own task and approval | **Out of scope (A2).** |

### Open items
- **O1 — G3:** the user first chose a separate development database, then **explicitly authorized the 365-property import into production** (done, see Increment 2). **Write tests** (house-number assignments, batch saves) are still forbidden on production. They need the development database described below, or a new explicit decision, before Increments 3–10 can be exercised end to end.
- **O2 — House number format:** **resolved.** The user confirmed `^[1-9]\d*(?:[A-Z]|\/\d+)?$` with no silent conversion (§0.4).
- **O3 — Deploy the legacy-code removal:** done (`866144d`); see "Production Deployment State" below.
- **O4 — Street type in the address:** **resolved.** The user chose "berk ko'chasi" (possessive form); see Increment 3 decisions.

### Production Deployment State (checked 2026-11-12)

- **Hosting:** Railway, through its GitHub integration (no deployment config file in the repo; `next.config.ts` has `typescript.ignoreBuildErrors: true`).
- **Deployed commit:** the GitHub deployment records, read from the public API, show the newest production deployment (environment "protective-respect / production", created by `railway-app[bot]`) is **`432745b`**, status `success`, last updated 2026-10-02. That is very likely what production runs. A redeploy or rollback done only in the Railway dashboard wouldn't appear on GitHub, so confirm it in Railway.
- **Pushes to `main` deploy to production.** Feature work is pushed to `feature/property-house-numbering`, never to `main`.
- **What fails in `432745b` since the migration:** the legacy code's generated client asks for the dropped columns (`newCadNumber`, `newHouseNumber`, `isNew`, `type`, …).

  | Surface in `432745b` | Code path | Effect now |
  |---|---|---|
  | Sidebar "Ko'chmas mulklar" → `/properties` (table page) | `GET /api/properties` → `getPropertyTableData` (selects `newCadNumber`, `isNew`, `type`) | API returns 500; the table shows an error or nothing (it was empty before) |
  | `/properties/[id]` detail page | `getPropertyDetailById` (`include` → all scalars) | Server error page. Only reachable by typing a URL, because no rows exist. |
  | Map: selecting a mahalla | `useProperties` → `GET /api/map/properties` → `getPropertiesByMahallaCode` (selects `newCadNumber`, `type`) | Request fails (React Query retries, then shows an empty list). The map keeps working, with no properties layer and console/network errors. |
  | Map: draw a polygon (`MapDrawControl`) → `CreatePropertyDialog` | `createProperty` action | Insert fails, so **nothing is written** (old column list and mahalla/street codes). The user sees an error. |
  | Edit / delete property dialogs | `updateProperty` / `deleteProperty` | Unreachable, because there are no rows |
  | District / region detail pages | `prisma.property.count({ where: { districtId } })` | **Still works**: `COUNT(*)` doesn't touch the dropped columns |

  No data can be corrupted: every legacy write fails as a whole.
- **Update (2026-11-12, user-authorized):** `feature/property-house-numbering` was merged into `main` as merge commit `866144d` (fast-forward push, no force). Railway deployed `866144d` to "protective-respect / production": `in_progress` at 13:30:26Z, **`success`** at 13:32:14Z, and the previous `432745b` deployment was marked `inactive` at 13:32:18Z. The build's `prisma migrate deploy` left `_prisma_migrations` unchanged (6 rows, none failed), which confirms the pinned migration checksum matched. The deployed tree has no `/properties`, `/api/properties` or `/api/map/properties` routes (verified with a local `next build` of the same tree). Checking the live site over HTTP needs the public URL or Railway access.
- **Fix (as originally planned):** the working-tree removal of the legacy feature, committed as `refactor: remove legacy property feature` on the feature branch. It goes live when the user merges the feature branch into `main`, which deploys. **Merge it together with the schema and migration commit.** The migration is already recorded in production's `_prisma_migrations`, so the build's `migrate deploy` will treat it as applied and do nothing, as long as the migration folder is part of the deployed code. No other code change is needed.

### G3 — Development Database Setup (instructions; nothing executed)

Goal: a database that is **not production**, holding a copy of production's schema and reference data, for the import and all write tests in Increments 2–10.

**Option A — local PostgreSQL 18 (recommended for solo development).** The client tools are already installed in `C:\Program Files\PostgreSQL\18\bin`, but no PostgreSQL server service is running on this machine.
1. Install or start a PostgreSQL **18** server locally: run the PostgreSQL 18 installer (server component), or use Docker with `postgres:18`. The major version must be at least 18, to restore an 18.6 dump.
2. Create the database and a dedicated role:
   ```bash
   psql -U postgres -c "CREATE ROLE manzillar_dev LOGIN PASSWORD '<dev-password>';"
   psql -U postgres -c "CREATE DATABASE manzillar_dev OWNER manzillar_dev;"
   ```
3. Restore from the verified backup, leaving out session tokens (they are production credentials):
   ```bash
   pg_restore --no-owner --no-privileges --role=manzillar_dev \
     --dbname="postgresql://manzillar_dev:<dev-password>@localhost:5432/manzillar_dev" \
     --exclude-table-data=auth_sessions \
     "C:\Users\j.turdimatov\manzillar-db-backups\prod_before_properties_20261112T130835Z.dump"
   ```
   The dump was taken **before** the properties migration, so the dev database then has the legacy `properties` table and 5 recorded migrations. Bring it up to date with `npx prisma migrate deploy` **while `DATABASE_URL` points at the dev database**. Alternatively, take a new dump of production first (read-only `pg_dump`) so the dev copy already has the new table.
4. **Privacy:** the dump contains real user accounts (`users`, `auth_identities`, `auth_accounts`, including password hashes). Keep the dev database local, don't share the dump, and consider resetting test users' passwords in dev only.

**Option B — a separate Railway database.**
1. In the Railway project, create a **separate environment** (for example `development`), not the `production` environment, and add a new PostgreSQL 18 service to it.
2. Copy that service's **public** connection URL.
3. Restore into it with the same `pg_restore` command as Option A step 3, using the new URL as `--dbname`.
4. Bring it up to date with `npx prisma migrate deploy` against that URL.
5. Make sure the app service in the production environment keeps using the production database variable.

**Switching safely (both options):**
- Prisma CLI, `prisma.config.ts` and the scripts in `scripts/` read `DATABASE_URL` from **`.env` via `dotenv`**. Next.js's `.env.development.local` override does **not** apply to them. So point the **local `.env`** at the dev database, and keep the production URL only in Railway's production variables, plus a separate, clearly named file if it's needed for read-only checks.
- Before any write, confirm the target with a read-only check:
  ```sql
  SELECT current_database(), inet_server_addr();
  ```
  The result must **not** be host `sakura.proxy.rlwy.net` or database `railway`.
- Safety guard for Increment 2: `scripts/import-properties.ts` refuses to run (non-dry-run) when the `DATABASE_URL` host is the production host (`sakura.proxy.rlwy.net`), unless the user explicitly passes `--allow-production` under a future G3 production approval.
- Even on the dev database, prefer `migrate deploy` over `migrate dev`. A restored copy has the same drift, and `migrate dev` would offer to reset it. That would only lose dev data, but it is still disruptive.

**G3 is satisfied when:** the dev database exists; the read-only target check shows it isn't production; `npx prisma migrate status` against it shows all 5 migrations applied; and `properties` there has the new shape. Only then may the Increment 2 import and the write tests run, and **only against the dev database**.

### Prisma version note (R-12, checked 2026-11-12)
CLI `prisma@7.4.2` generates the client (it reports `clientVersion 7.4.2`), which loads its runtime from `@prisma/client@7.3.0` (`@prisma/client/runtime/client`). Results:
- `prisma validate` and `prisma generate`: pass.
- `tsc --noEmit`: no new errors.
- **Runtime:** read-only queries through the generated client against production all succeed: `region.count`, `property.count`, `property.findMany` (all new columns), `include` of district/mahalla/street, and `district._count.properties`.

**No actual issue was found.** Versions are kept as they are, per the user. Upgrading `@prisma/client` to 7.4.2 is the clean fix whenever dependency changes are approved.

### Remaining blockers and decisions for the user (from Revision 4)

1. **G1:** review the migration SQL in §1.4.
2. **G3 (testing with only a production database):** every write test would change production data. Options:
   - **(a)** Set up a separate development database, for example a local PostgreSQL or a Railway database restored from a production backup. Development and testing then happen there; per §1.2 it is inspected first.
   - **(b)** Approve controlled writes to production: the import of the 365 Yangiobod properties plus test numbering on a named test street, with a cleanup step afterwards that resets `houseNumber`, `streetId` and `newAddress` to `NULL` for the test rows.

   This plan recommends **(a)**. Until you decide, Increments 3–9 can be coded and type-checked, but not exercised end to end.
3. **Preview feature:** the partial index needs `previewFeatures = ["partialIndexes"]` in Prisma 7.4.2. Preview features can change between Prisma releases, so take care when upgrading Prisma. The CLI already offers 8.0.0-rc. If you'd rather not use a preview feature, the alternative is an index that exists only in raw SQL, which would show up as permanent drift and conflicts with A3's "do not silently introduce schema drift". This plan uses the preview flag.
4. **Optional documentation follow-up (not done):** `docs/PRISMA_MIGRATIONS.md` tells developers to run `npm run migrate:dev`, which is unsafe against the current production database. Updating it is outside "planning documentation", so it's only flagged here.
