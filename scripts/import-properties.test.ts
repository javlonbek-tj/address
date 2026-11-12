// Run: npx tsx --test scripts/import-properties.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Feature, Geometry, Point } from 'geojson';
import {
  buildRecord,
  findFileDuplicates,
  matchDistrict,
  matchMahalla,
  normalizeName,
  planWrites,
  sameJson,
  type DistrictRef,
  type ExistingRow,
  type ImportRecord,
  type MahallaRef,
  type SourceProps,
} from './import-properties';

const regions = [
  { id: 'r-sir', code: '1724' },
  { id: 'r-tosh', code: '1727' },
];
const districts: DistrictRef[] = [
  { id: 'd-sir', code: '1724231', name: 'Sirdaryo tumani', regionId: 'r-sir' },
  { id: 'd-other', code: '1727259', name: 'Yangiyo‘l tumani', regionId: 'r-tosh' },
];
const mahallas: MahallaRef[] = [
  { id: 'm-yangi', code: '1724231017', name: 'Yangiobod MFY', uzKadName: 'Yangiobod MFY', districtId: 'd-sir' },
  { id: 'm-bog', code: '1724231018', name: 'Bog‘ishamol MFY', uzKadName: 'Bogishamol', districtId: 'd-sir' },
  { id: 'm-twin-1', code: '1724231020', name: 'Navbahor MFY', uzKadName: 'Navbahor', districtId: 'd-sir' },
  { id: 'm-twin-2', code: '1724231021', name: 'Navbahor', uzKadName: 'Navbahor-2', districtId: 'd-sir' },
  { id: 'm-elsewhere', code: '1727259001', name: 'Yangiobod MFY', uzKadName: 'Yangiobod MFY', districtId: 'd-other' },
];

const square: Geometry = {
  type: 'Polygon',
  coordinates: [
    [
      [7643614.64, 4963657.78],
      [7643742.26, 4963657.78],
      [7643742.26, 4963615.85],
      [7643614.64, 4963615.85],
      [7643614.64, 4963657.78],
    ],
  ],
};

function feature(props: SourceProps): Feature<Geometry, SourceProps> {
  return { type: 'Feature', geometry: square, properties: props };
}

test('normalizeName unifies apostrophes, case, spacing and the MFY suffix', () => {
  assert.equal(normalizeName('Yangiobod MFY'), 'yangiobod');
  assert.equal(normalizeName('  Yangiobod  '), 'yangiobod');
  assert.equal(normalizeName('Bog‘ishamol MFY'), normalizeName("Bog'ishamol"));
  assert.equal(normalizeName(null), '');
});

test('matchDistrict uses soato_dist first, then a unique name within the region', () => {
  assert.equal(matchDistrict({ soato_dist: '1724231' }, districts, regions)?.id, 'd-sir');
  assert.equal(matchDistrict({ soato_dist: 1724231 }, districts, regions)?.id, 'd-sir');
  assert.equal(
    matchDistrict({ soato_dist: '9999999', soato_regi: '1724', district_n: 'Sirdaryo tumani' }, districts, regions)?.id,
    'd-sir',
  );
  assert.equal(
    matchDistrict({ soato_dist: '9999999', soato_regi: '1727', district_n: 'Sirdaryo tumani' }, districts, regions),
    null,
  );
  assert.equal(matchDistrict({}, districts, regions), null);
});

test('matchMahalla matches Mahalla.code only inside the matched district', () => {
  assert.deepEqual(matchMahalla({ mahalla_co: '1724231017' }, 'd-sir', mahallas), { by: 'code', mahallaId: 'm-yangi' });
  assert.deepEqual(matchMahalla({ mahalla_co: '1727259001' }, 'd-sir', mahallas), { by: 'unmatched', mahallaId: null });
});

test('matchMahalla falls back to a unique normalized name within the district', () => {
  assert.deepEqual(
    matchMahalla({ mahalla_co: 'e174227b-d259-4cd8-b30e-d14c1e45d40f', mahalla_na: 'Yangiobod' }, 'd-sir', mahallas),
    { by: 'name', mahallaId: 'm-yangi' },
  );
  assert.deepEqual(matchMahalla({ mahalla_na: 'Bogishamol' }, 'd-sir', mahallas), { by: 'name', mahallaId: 'm-bog' });
});

test('matchMahalla never assigns ambiguous or missing names', () => {
  const ambiguous = matchMahalla({ mahalla_na: 'Navbahor' }, 'd-sir', mahallas);
  assert.equal(ambiguous.by, 'ambiguous');
  assert.equal(ambiguous.mahallaId, null);
  assert.deepEqual(matchMahalla({ mahalla_na: 'Unknown' }, 'd-sir', mahallas), { by: 'unmatched', mahallaId: null });
  assert.deepEqual(matchMahalla({}, 'd-sir', mahallas), { by: 'unmatched', mahallaId: null });
});

test('buildRecord converts EPSG:3857 to WGS84 degrees and computes the centroid', () => {
  const rec = buildRecord(
    feature({ cadastral_: '12:07:44:02:01:0045', sp_id: 'sp-1', sp_uid: 'uid-1', property_k: 'prop_kind_private_house' }),
    'd-sir',
    'm-yangi',
  );
  assert.equal(rec.cadNumber, '12:07:44:02:01:0045');
  assert.equal(rec.propertyKind, 'prop_kind_private_house');
  assert.equal(rec.geometry.type, 'Polygon');
  const [lng, lat] = (rec.geometry as { coordinates: number[][][] }).coordinates[0][0];
  assert.ok(lng > 68.6 && lng < 68.9, `lng ${lng}`);
  assert.ok(lat > 40.6 && lat < 40.9, `lat ${lat}`);
  const [cx, cy] = rec.center.coordinates;
  assert.ok(cx > 68.6 && cx < 68.9 && cy > 40.6 && cy < 40.9);
});

test('findFileDuplicates reports repeated cadastral_ and sp_id values', () => {
  const issues = findFileDuplicates([
    feature({ cadastral_: 'A', sp_id: '1' }),
    feature({ cadastral_: 'A', sp_id: '2' }),
    feature({ cadastral_: 'B', sp_id: '2' }),
    feature({ cadastral_: 'C', sp_id: '3' }),
  ]);
  assert.deepEqual(issues, ['duplicate cadastral_ in file: A', 'duplicate sp_id in file: 2']);
});

test('sameJson ignores key order', () => {
  assert.ok(sameJson({ type: 'Point', coordinates: [1, 2] }, { coordinates: [1, 2], type: 'Point' }));
  assert.ok(!sameJson({ type: 'Point', coordinates: [1, 2] }, { type: 'Point', coordinates: [1, 3] }));
  assert.ok(!sameJson({ type: 'Point' }, { type: 'Polygon' }));
  assert.ok(!sameJson([1, 2], [1, 2, 3]));
});

test('sameJson tolerates the 17th-digit loss of the database round-trip but not real moves', () => {
  // Observed after the production import: 40.669016000147394 was stored as 40.66901600014739.
  assert.ok(sameJson({ coordinates: [68.67, 40.669016000147394] }, { coordinates: [68.67, 40.66901600014739] }));
  assert.ok(!sameJson({ coordinates: [68.67, 40.669016] }, { coordinates: [68.67, 40.669017] }));
});

test('planWrites treats round-trip precision noise as unchanged', () => {
  const noisy = JSON.parse(JSON.stringify(base.center)) as { coordinates: number[] };
  noisy.coordinates = noisy.coordinates.map((v) => v + 7e-15);
  const plan = planWrites([rec({})], [row({ center: noisy })]);
  assert.equal(plan.unchanged, 1);
  assert.equal(plan.toUpdate.length, 0);
});

// planWrites runs against mocked database rows.
const base = buildRecord(feature({ cadastral_: 'CAD-1', sp_id: 'SP-1', sp_uid: 'U-1', property_k: 'k' }), 'd-sir', 'm-yangi');
const rec = (over: Partial<ImportRecord>): ImportRecord => ({ ...base, ...over });
const row = (over: Partial<ExistingRow>): ExistingRow => ({
  id: 'row-1',
  cadNumber: 'CAD-1',
  spId: 'SP-1',
  spUid: 'U-1',
  propertyKind: 'k',
  houseNumber: null,
  districtId: 'd-sir',
  mahallaId: 'm-yangi',
  geometry: base.geometry,
  center: base.center,
  ...over,
});

test('planWrites creates every record when the table is empty', () => {
  const plan = planWrites([rec({}), rec({ cadNumber: 'CAD-2', spId: 'SP-2' })], []);
  assert.equal(plan.toCreate.length, 2);
  assert.equal(plan.toUpdate.length + plan.unchanged + plan.conflicts.length, 0);
});

test('planWrites leaves identical rows untouched (idempotent re-import)', () => {
  const plan = planWrites([rec({})], [row({})]);
  assert.equal(plan.unchanged, 1);
  assert.equal(plan.toCreate.length + plan.toUpdate.length, 0);
});

test('planWrites matches by spId when there is no cadastral number', () => {
  const plan = planWrites([rec({ cadNumber: null })], [row({ cadNumber: null })]);
  assert.equal(plan.unchanged, 1);
});

test('planWrites updates geometry but never sends houseNumber, streetId, newAddress or isActive', () => {
  const moved: Point = { type: 'Point', coordinates: [68.7, 40.7] };
  const plan = planWrites([rec({ center: moved })], [row({ houseNumber: '5' })]);
  assert.equal(plan.toUpdate.length, 1);
  const keys = Object.keys(plan.toUpdate[0].data);
  for (const forbidden of ['houseNumber', 'streetId', 'newAddress', 'isActive', 'cadNumber', 'spId']) {
    assert.ok(!keys.includes(forbidden), `update must not include ${forbidden}`);
  }
});

test('planWrites keeps district/mahalla of numbered properties and reports the relocation', () => {
  const plan = planWrites([rec({ mahallaId: 'm-bog' })], [row({ houseNumber: '7' })]);
  assert.equal(plan.skippedNumberedRelocation.length, 1);
  assert.equal(plan.toUpdate.length, 0);
  assert.equal(plan.unchanged, 1);
});

test('planWrites relocates unnumbered properties', () => {
  const plan = planWrites([rec({ mahallaId: 'm-bog' })], [row({})]);
  assert.equal(plan.toUpdate.length, 1);
  assert.equal(plan.toUpdate[0].data.mahallaId, 'm-bog');
});

test('planWrites reports conflicting identifiers instead of writing', () => {
  const split = planWrites([rec({})], [row({ id: 'a', spId: 'OTHER' }), row({ id: 'b', cadNumber: 'CAD-9' })]);
  assert.equal(split.conflicts.length, 1);
  const stolenSpId = planWrites([rec({})], [row({ id: 'b', cadNumber: 'CAD-9' })]);
  assert.equal(stolenSpId.conflicts.length, 1);
  assert.equal(stolenSpId.toCreate.length, 0);
});
