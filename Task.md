# Property House Numbering System — Task Plan

## Overview

Goal: Import property (binolar) data from GeoJSON, store them in the database, and provide two workflows for assigning house numbers — **manual** and **semi-automatic**.

---

## 1. Data Model — Prisma Schema

Add `Property` model to `prisma/schema.prisma`:

```prisma
model Property {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  # Source identifiers from UzKad GeoJSON
  cadNumber    String?  @unique   # cadastral_ field from GeoJSON
  spId         String?  @unique   # sp_id field
  spUid        String?            # sp_uid field
  propertyKind String?            # property_k (e.g. prop_kind_private_house)

  # Geometry — stored as WGS84 (converted from EPSG:3857)
  geometry Json
  center   Json?

  # House number assigned by our system
  houseNumber String?             # e.g. "1", "2A", "14"

  # Computed full address (denormalized for fast display/export)
  # Format: "Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 1-uy"
  newAddress  String?

  isActive Boolean @default(true)

  # Relations
  districtId String
  district   District @relation(fields: [districtId], references: [id], onDelete: Cascade)

  mahallaId String?
  mahalla   Mahalla? @relation(fields: [mahallaId], references: [id], onDelete: SetNull)

  streetId String?
  street   Street?  @relation(fields: [streetId], references: [id], onDelete: SetNull)

  @@index([districtId])
  @@index([mahallaId])
  @@index([streetId])
  @@map("properties")
}
```

> **Note:** Mahalla and Street relations use `id`, not `code`, to keep referential integrity consistent with the rest of the schema.

---

## 2. GeoJSON Import Script

**File:** `scripts/import-properties.ts`

Steps:
1. Read `Yangiobod.geojson`
2. For each feature:
   - Convert coordinates from **EPSG:3857 → WGS84** (use `proj4` or `@turf/projection`)
   - Compute centroid from polygon (`@turf/centroid`)
   - Look up `districtId` by matching `soato_dist` or `district_n` against DB
   - Look up `mahallaId` by matching `mahalla_na` against DB
   - Insert into `properties` table with `cadNumber`, `spId`, `geometry`, `center`
3. Skip duplicates by `cadNumber` (upsert)

```bash
npx tsx scripts/import-properties.ts
```

---

## 3. Manual House Numbering

**UI location:** Map view — click on a property polygon → side panel opens

### Flow:
1. User clicks on a property on the map
2. Side panel shows current data: cadastral number, mahalla, current street (if any)
3. User fills in:
   - **Street** — dropdown of streets in the same district
   - **House number** — free text input (e.g. "1", "2A", "14")
4. On save:
   - `houseNumber` is stored
   - `streetId` is linked
   - `newAddress` is computed and stored:
     ```
     {region.name}, {district.name}, {mahalla.name} MFY, {street.name} {street.type}, {houseNumber}-uy
     ```
5. Property marker on map updates (color change to show it has an address)

---

## 4. Semi-Automatic House Numbering

### Concept

User selects a street, then clicks properties one by one along the street. The system assigns odd numbers to the **left** side and even numbers to the **right** side, incrementing by 2 each click.

### Flow:

1. **User selects a street** from the map or sidebar
2. System highlights all unaddressed properties within a configured buffer of the street (e.g. 50m)
3. **Side panel asks:** "Qaysi tomondan boshlaysiz?" → `Chap tomon (1, 3, 5…)` / `O'ng tomon (2, 4, 6…)`
4. User picks a side → system enters **numbering mode**
   - Cursor changes to crosshair
   - Properties near the street pulse/highlight to indicate they are selectable
5. **User clicks properties one by one** in order along the street
   - Each click assigns the next number in sequence:
     - Left side: 1 → 3 → 5 → 7 …
     - Right side: 2 → 4 → 6 → 8 …
   - Clicked property immediately shows its assigned number on the map
   - A counter in the side panel shows: "Belgilandi: 7 ta | Keyingi raqam: 15"
6. **User can undo** the last assignment (button in panel)
7. **User clicks "Saqlash"** → all assignments are batch-saved to DB
   - `houseNumber`, `streetId`, `newAddress` written for each property
8. **User can then switch to the other side** and repeat for the remaining properties

### State during numbering mode (client-side, not saved until confirmed):

```ts
interface NumberingSession {
  streetId: string;
  side: 'left' | 'right';        // left = odd, right = even
  startNumber: number;            // 1 or 2
  assignments: Array<{
    propertyId: string;
    houseNumber: number;
  }>;
}
```

### Number format rules:
- Left side (odd): 1, 3, 5, 7 …
- Right side (even): 2, 4, 6, 8 …
- Starting number is configurable (e.g. user can set "start from 14" to continue a partially numbered street)

---

## 5. `newAddress` Field

Computed on every save (manual or semi-auto):

```
{region.name}, {district.name}, {mahalla.name} MFY, {street.name} {street.type lowercased}, {houseNumber}-uy
```

Example:
```
Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 1-uy
```

Stored in `newAddress` column. Also exposed via API for export.

---

## 6. Map Display

- Properties shown as polygons on the map (existing layer system)
- Color coding:
  - **Grey** — no address assigned
  - **Green** — has `houseNumber` and `streetId`
- Tooltip on hover: shows `houseNumber` if assigned, else cadastral number
- During semi-auto numbering mode: highlighted candidates shown in yellow/orange

---

## 7. API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/properties?districtId=&mahallaId=&streetId=` | List properties with filters |
| GET | `/api/properties/:id` | Single property detail |
| PATCH | `/api/properties/:id` | Update houseNumber, streetId, newAddress |
| POST | `/api/properties/batch-assign` | Batch assign from semi-auto session |

---

## 8. Implementation Order

- [ ] **Step 1** — Add Property model to `schema.prisma` and run `prisma migrate dev`
- [ ] **Step 2** — Write and run `scripts/import-properties.ts` to import GeoJSON
- [ ] **Step 3** — Add Property relations back to District, Mahalla, Street models
- [ ] **Step 4** — API: GET list + GET single + PATCH single
- [ ] **Step 5** — Map: show property polygons layer, click → side panel
- [ ] **Step 6** — Manual numbering UI in side panel
- [ ] **Step 7** — Semi-auto numbering mode (street selection → side selection → click sequence → batch save)
- [ ] **Step 8** — `newAddress` computed field on save
- [ ] **Step 9** — Export: include `newAddress` in Excel/CSV export

---

## 9. Technical Notes

- **Coordinate conversion:** GeoJSON from UzKad is in **EPSG:3857** (Web Mercator). Must convert to **WGS84** before storing. Use `proj4`:
  ```ts
  import proj4 from 'proj4';
  proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs');
  const [lng, lat] = proj4('EPSG:3857', 'WGS84', [x, y]);
  ```

- **Street-to-property association during import:** GeoJSON has no `streetId`. Street assignment happens later through the numbering workflows.

- **Buffer for semi-auto:** Use `@turf/buffer` on the street geometry and `@turf/boolean-intersects` to find candidate properties within ~50m of the street.
