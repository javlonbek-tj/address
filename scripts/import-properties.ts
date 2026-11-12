// Imports UzKad property polygons (EPSG:3857 GeoJSON) into the "properties" table.
//
//   npx tsx scripts/import-properties.ts [file] --dry-run             # matching only, never touches "properties"
//   npx tsx scripts/import-properties.ts [file] --dry-run --compare   # also reads "properties" to preview creates/updates
//   npx tsx scripts/import-properties.ts [file] --confirm-target=<host:port/db> [--expect-create=<n>]   # writes
//     --expect-create aborts before writing unless the plan is exactly <n> creates and nothing else.
//
// Writes go only to "properties", in one transaction, and only when the file and the database
// state are free of anomalies. Re-imports never touch houseNumber, streetId, newAddress or isActive.
import 'dotenv/config';
import fs from 'fs';
import { centroid, toWgs84 } from '@turf/turf';
import type { Feature, FeatureCollection, Geometry, Point } from 'geojson';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../lib/generated/prisma/client';

export type SourceProps = {
  cadastral_?: string | null;
  sp_id?: string | null;
  sp_uid?: string | null;
  property_k?: string | null;
  soato_regi?: string | number | null;
  soato_dist?: string | number | null;
  district_n?: string | null;
  mahalla_co?: string | number | null;
  mahalla_na?: string | null;
};

export type DistrictRef = { id: string; code: string; name: string; regionId: string };
export type RegionRef = { id: string; code: string };
export type MahallaRef = { id: string; code: string; name: string; uzKadName: string; districtId: string };

export type MahallaMatch =
  | { by: 'code' | 'name'; mahallaId: string }
  | { by: 'ambiguous'; mahallaId: null; candidates: string[] }
  | { by: 'unmatched'; mahallaId: null };

export type ImportRecord = {
  cadNumber: string | null;
  spId: string | null;
  spUid: string | null;
  propertyKind: string | null;
  geometry: Geometry;
  center: Point;
  districtId: string;
  mahallaId: string | null;
};

export type ExistingRow = {
  id: string;
  cadNumber: string | null;
  spId: string | null;
  spUid: string | null;
  propertyKind: string | null;
  houseNumber: string | null;
  districtId: string;
  mahallaId: string | null;
  geometry: unknown;
  center: unknown;
};

export type UpdateData = {
  geometry: Geometry;
  center: Point;
  spUid: string | null;
  propertyKind: string | null;
  districtId?: string;
  mahallaId?: string | null;
};

export type WritePlan = {
  toCreate: ImportRecord[];
  toUpdate: { id: string; data: UpdateData }[];
  unchanged: number;
  skippedNumberedRelocation: { key: string; from: string; to: string }[];
  conflicts: string[];
};

export function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

// Unifies Uzbek apostrophe variants and drops a trailing "MFY" so "Yangiobod" matches "Yangiobod MFY".
export function normalizeName(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFC')
    .replace(/['ʻʼ‘’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+mfy$/, '');
}

export function matchDistrict(
  props: SourceProps,
  districts: DistrictRef[],
  regions: RegionRef[],
): DistrictRef | null {
  const code = text(props.soato_dist);
  const byCode = code ? districts.find((d) => d.code === code) : undefined;
  if (byCode) return byCode;

  const region = regions.find((r) => r.code === text(props.soato_regi));
  const name = normalizeName(props.district_n);
  if (!region || !name) return null;
  const byName = districts.filter((d) => d.regionId === region.id && normalizeName(d.name) === name);
  return byName.length === 1 ? byName[0] : null;
}

export function matchMahalla(props: SourceProps, districtId: string, mahallas: MahallaRef[]): MahallaMatch {
  const inDistrict = mahallas.filter((m) => m.districtId === districtId);

  const code = text(props.mahalla_co);
  const byCode = code ? inDistrict.find((m) => m.code === code) : undefined;
  if (byCode) return { by: 'code', mahallaId: byCode.id };

  const name = normalizeName(props.mahalla_na);
  if (!name) return { by: 'unmatched', mahallaId: null };
  const byName = inDistrict.filter(
    (m) => normalizeName(m.name) === name || normalizeName(m.uzKadName) === name,
  );
  if (byName.length === 1) return { by: 'name', mahallaId: byName[0].id };
  if (byName.length > 1) return { by: 'ambiguous', mahallaId: null, candidates: byName.map((m) => m.id) };
  return { by: 'unmatched', mahallaId: null };
}

export function buildRecord(
  feature: Feature<Geometry, SourceProps>,
  districtId: string,
  mahallaId: string | null,
): ImportRecord {
  const wgs = toWgs84(feature) as Feature<Geometry, SourceProps>;
  return {
    cadNumber: text(feature.properties.cadastral_),
    spId: text(feature.properties.sp_id),
    spUid: text(feature.properties.sp_uid),
    propertyKind: text(feature.properties.property_k),
    geometry: wgs.geometry,
    center: centroid(wgs).geometry,
    districtId,
    mahallaId,
  };
}

export function findFileDuplicates(features: Feature<Geometry, SourceProps>[]): string[] {
  const issues: string[] = [];
  for (const [label, field] of [
    ['cadastral_', 'cadastral_'],
    ['sp_id', 'sp_id'],
  ] as const) {
    const seen = new Set<string>();
    for (const f of features) {
      const v = text(f.properties[field]);
      if (!v) continue;
      if (seen.has(v)) issues.push(`duplicate ${label} in file: ${v}`);
      seen.add(v);
    }
  }
  return issues;
}

// Stored JSON coordinates lose the 17th significant digit on the way into PostgreSQL
// (~1e-14°), so coordinates are compared with a tolerance far below any real change (~0.1 mm).
const COORDINATE_TOLERANCE = 1e-9;

export function sameJson(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= COORDINATE_TOLERANCE;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => sameJson(v, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return (
      ka.length === kb.length &&
      ka.every((k, i) => k === kb[i] && sameJson((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
    );
  }
  return a === b;
}

// Matches by cadNumber, otherwise by spId. A key that resolves to a different row than the
// other key, or an spId already owned by another cadastral number, is a conflict.
export function planWrites(records: ImportRecord[], existing: ExistingRow[]): WritePlan {
  const byCad = new Map(existing.filter((e) => e.cadNumber).map((e) => [e.cadNumber as string, e]));
  const bySp = new Map(existing.filter((e) => e.spId).map((e) => [e.spId as string, e]));
  const plan: WritePlan = { toCreate: [], toUpdate: [], unchanged: 0, skippedNumberedRelocation: [], conflicts: [] };

  for (const rec of records) {
    const key = rec.cadNumber ?? rec.spId ?? '(no key)';
    const cadRow = rec.cadNumber ? byCad.get(rec.cadNumber) : undefined;
    const spRow = rec.spId ? bySp.get(rec.spId) : undefined;

    if (cadRow && spRow && cadRow.id !== spRow.id) {
      plan.conflicts.push(`${key}: cadNumber and spId match different rows (${cadRow.id}, ${spRow.id})`);
      continue;
    }
    if (rec.cadNumber && !cadRow && spRow) {
      plan.conflicts.push(`${key}: spId ${rec.spId} already belongs to row ${spRow.id} (cadNumber ${spRow.cadNumber ?? 'null'})`);
      continue;
    }

    const row = cadRow ?? spRow;
    if (!row) {
      plan.toCreate.push(rec);
      continue;
    }

    const moved = row.districtId !== rec.districtId || row.mahallaId !== rec.mahallaId;
    const keepLocation = moved && !!row.houseNumber;
    if (keepLocation) {
      plan.skippedNumberedRelocation.push({
        key,
        from: `${row.districtId}/${row.mahallaId ?? 'null'}`,
        to: `${rec.districtId}/${rec.mahallaId ?? 'null'}`,
      });
    }

    const changed =
      !sameJson(row.geometry, rec.geometry) ||
      !sameJson(row.center, rec.center) ||
      row.spUid !== rec.spUid ||
      row.propertyKind !== rec.propertyKind ||
      (moved && !keepLocation);

    if (!changed) {
      plan.unchanged++;
      continue;
    }
    plan.toUpdate.push({
      id: row.id,
      data: {
        geometry: rec.geometry,
        center: rec.center,
        spUid: rec.spUid,
        propertyKind: rec.propertyKind,
        ...(keepLocation ? {} : { districtId: rec.districtId, mahallaId: rec.mahallaId }),
      },
    });
  }
  return plan;
}

function describeTarget(url: string): string {
  const u = new URL(url);
  return `${u.hostname}:${u.port || '5432'}${u.pathname}`;
}

const json = (value: unknown) => value as Prisma.InputJsonValue;

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--')) ?? './Yangiobod.geojson';
  const dryRun = args.includes('--dry-run');
  const compare = args.includes('--compare');
  const confirmTarget = args.find((a) => a.startsWith('--confirm-target='))?.split('=')[1];
  const expectCreateArg = args.find((a) => a.startsWith('--expect-create='))?.split('=')[1];
  const expectCreate = expectCreateArg === undefined ? undefined : Number(expectCreateArg);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');
  const target = describeTarget(databaseUrl);
  console.log(`Target database: ${target}`);
  console.log(`Mode: ${dryRun ? (compare ? 'dry-run + compare (read-only)' : 'dry-run (read-only, "properties" not accessed)') : 'WRITE'}`);

  if (!dryRun && confirmTarget !== target) {
    console.error(`Refusing to write: pass --confirm-target=${target} to confirm the target database.`);
    process.exitCode = 1;
    return;
  }

  const collection = JSON.parse(fs.readFileSync(file, 'utf8')) as FeatureCollection<Geometry, SourceProps> & {
    crs?: { properties?: { name?: string } };
  };
  if (collection.type !== 'FeatureCollection') throw new Error('File is not a GeoJSON FeatureCollection');
  if (collection.crs?.properties?.name !== 'EPSG:3857') {
    throw new Error(`Expected CRS EPSG:3857, got ${collection.crs?.properties?.name ?? 'none'}`);
  }
  const features = collection.features;

  const duplicates = findFileDuplicates(features);
  if (duplicates.length) {
    duplicates.forEach((d) => console.error(d));
    console.error('Aborting: the file contains duplicate identifiers. Nothing was read from or written to "properties".');
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const [districts, regions, mahallas] = await Promise.all([
      prisma.district.findMany({ select: { id: true, code: true, name: true, regionId: true } }),
      prisma.region.findMany({ select: { id: true, code: true } }),
      prisma.mahalla.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true, uzKadName: true, districtId: true },
      }),
    ]);

    const counts = {
      processed: 0,
      unmatchedDistrict: 0,
      noKey: 0,
      mahallaByCode: 0,
      mahallaByName: 0,
      mahallaAmbiguous: 0,
      mahallaUnmatched: 0,
    };
    const records: ImportRecord[] = [];

    for (const feature of features) {
      counts.processed++;
      const key = text(feature.properties.cadastral_) ?? text(feature.properties.sp_id);
      if (!key) {
        counts.noKey++;
        console.warn(`No cadastral_ or sp_id (feature #${counts.processed})`);
        continue;
      }
      const district = matchDistrict(feature.properties, districts, regions);
      if (!district) {
        counts.unmatchedDistrict++;
        console.warn(`${key}: district not matched (soato_dist=${feature.properties.soato_dist})`);
        continue;
      }
      const mahalla = matchMahalla(feature.properties, district.id, mahallas);
      if (mahalla.by === 'code') counts.mahallaByCode++;
      if (mahalla.by === 'name') counts.mahallaByName++;
      if (mahalla.by === 'ambiguous') {
        counts.mahallaAmbiguous++;
        console.warn(`${key}: ambiguous mahalla "${feature.properties.mahalla_na}" -> ${mahalla.candidates.join(', ')}`);
      }
      if (mahalla.by === 'unmatched') {
        counts.mahallaUnmatched++;
        console.warn(`${key}: mahalla not matched ("${feature.properties.mahalla_na}", ${feature.properties.mahalla_co})`);
      }
      records.push(buildRecord(feature, district.id, mahalla.mahallaId));
      if (counts.processed % 100 === 0) console.log(`... ${counts.processed}/${features.length} features processed`);
    }

    console.log('Matching:', JSON.stringify({ ...counts, readyToImport: records.length }));
    const anomalies = counts.unmatchedDistrict + counts.noKey + counts.mahallaAmbiguous + counts.mahallaUnmatched;

    if (dryRun && !compare) {
      console.log('Dry run complete. No writes; the "properties" table was not accessed.');
      return;
    }

    const cadNumbers = records.map((r) => r.cadNumber).filter((v): v is string => !!v);
    const spIds = records.map((r) => r.spId).filter((v): v is string => !!v);
    const existing = await prisma.property.findMany({
      where: { OR: [{ cadNumber: { in: cadNumbers } }, { spId: { in: spIds } }] },
      select: {
        id: true,
        cadNumber: true,
        spId: true,
        spUid: true,
        propertyKind: true,
        houseNumber: true,
        districtId: true,
        mahallaId: true,
        geometry: true,
        center: true,
      },
    });
    const plan = planWrites(records, existing);
    plan.conflicts.forEach((c) => console.error(`conflict: ${c}`));
    plan.skippedNumberedRelocation.forEach((s) =>
      console.warn(`skippedNumberedRelocation: ${s.key} keeps ${s.from} (file says ${s.to})`),
    );
    console.log(
      'Plan:',
      JSON.stringify({
        existingMatched: existing.length,
        toCreate: plan.toCreate.length,
        toUpdate: plan.toUpdate.length,
        unchanged: plan.unchanged,
        skippedNumberedRelocation: plan.skippedNumberedRelocation.length,
        conflicts: plan.conflicts.length,
      }),
    );

    if (dryRun) {
      console.log('Dry run complete. No writes.');
      return;
    }
    if (anomalies > 0 || plan.conflicts.length > 0) {
      console.error('Aborting before any write: resolve the anomalies/conflicts above first.');
      process.exitCode = 1;
      return;
    }
    if (
      expectCreate !== undefined &&
      (plan.toCreate.length !== expectCreate ||
        plan.toUpdate.length > 0 ||
        plan.unchanged > 0 ||
        plan.skippedNumberedRelocation.length > 0)
    ) {
      console.error(`Aborting before any write: expected exactly ${expectCreate} creates and no existing rows.`);
      process.exitCode = 1;
      return;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const created = plan.toCreate.length
          ? await tx.property.createMany({
              data: plan.toCreate.map((r) => ({
                cadNumber: r.cadNumber,
                spId: r.spId,
                spUid: r.spUid,
                propertyKind: r.propertyKind,
                geometry: json(r.geometry),
                center: json(r.center),
                districtId: r.districtId,
                mahallaId: r.mahallaId,
              })),
            })
          : { count: 0 };
        if (created.count !== plan.toCreate.length) {
          throw new Error(`Expected to create ${plan.toCreate.length} rows, created ${created.count}`);
        }
        for (const u of plan.toUpdate) {
          await tx.property.update({
            where: { id: u.id },
            data: { ...u.data, geometry: json(u.data.geometry), center: json(u.data.center) },
          });
        }
        return { created: created.count, updated: plan.toUpdate.length };
      },
      { maxWait: 20_000, timeout: 120_000 },
    );

    console.log(
      'Import complete:',
      JSON.stringify({
        ...result,
        unchanged: plan.unchanged,
        skippedNumberedRelocation: plan.skippedNumberedRelocation.length,
        failed: 0,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Import failed (transaction rolled back, nothing written):', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
