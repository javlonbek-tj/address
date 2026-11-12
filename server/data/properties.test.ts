// Run: npm test
// assignPropertyAddresses runs against an in-memory fake of the Prisma client: it applies the
// same filters, enforces the partial unique index (streetId, houseNumber) WHERE isActive on
// writes, and rolls back on errors. No real database is used.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma, type PrismaClient } from '@/lib/generated/prisma/client';
import { assignPropertyAddresses, buildNewAddress, isHouseNumberConflict } from './properties';

type Row = {
  id: string;
  districtId: string;
  mahallaName: string | null;
  isActive: boolean;
  streetId: string | null;
  houseNumber: string | null;
  newAddress: string | null;
};
type StreetRow = { id: string; name: string; type: string; districtId: string; isActive: boolean };

function uniqueViolation() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed on the fields: (`"streetId"`,`"houseNumber"`)', {
    code: 'P2002',
    clientVersion: 'test',
    meta: {
      driverAdapterError: {
        cause: { kind: 'UniqueConstraintViolation', constraint: { fields: ['"streetId"', '"houseNumber"'] } },
      },
    },
  });
}

function fakeDb(rows: Row[], streets: StreetRow[], opts: { hideTakenNumbers?: boolean } = {}) {
  const district = { name: 'Sirdaryo tumani', region: { name: 'Sirdaryo viloyati' } };
  const checkIndex = () => {
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r.isActive || r.streetId === null || r.houseNumber === null) continue;
      const key = `${r.streetId}|${r.houseNumber}`;
      if (seen.has(key)) throw uniqueViolation();
      seen.add(key);
    }
  };
  const tx = {
    street: {
      findFirst: async ({ where }: { where: { id: string; isActive: boolean } }) => {
        const s = streets.find((x) => x.id === where.id && x.isActive === where.isActive);
        return s ? { name: s.name, type: s.type, districtId: s.districtId, district } : null;
      },
    },
    property: {
      findMany: async ({ where }: { where: Record<string, unknown> }) => {
        const idIn = (where.id as { in?: string[] })?.in;
        const idNotIn = (where.id as { notIn?: string[] })?.notIn;
        const numbersIn = (where.houseNumber as { in?: string[] })?.in;
        if (numbersIn && opts.hideTakenNumbers) return [];
        return rows
          .filter((r) => (where.isActive === undefined ? true : r.isActive === where.isActive))
          .filter((r) => (idIn ? idIn.includes(r.id) : true))
          .filter((r) => (idNotIn ? !idNotIn.includes(r.id) : true))
          .filter((r) => (where.streetId === undefined ? true : r.streetId === where.streetId))
          .filter((r) => (numbersIn ? r.houseNumber !== null && numbersIn.includes(r.houseNumber) : true))
          .map((r) => ({
            id: r.id,
            districtId: r.districtId,
            houseNumber: r.houseNumber,
            mahalla: r.mahallaName ? { name: r.mahallaName } : null,
          }));
      },
      updateMany: async ({ where, data }: { where: { id: { in: string[] } }; data: { houseNumber: null } }) => {
        const hit = rows.filter((r) => where.id.in.includes(r.id));
        hit.forEach((r) => (r.houseNumber = data.houseNumber));
        return { count: hit.length };
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Row> }) => {
        const row = rows.find((r) => r.id === where.id)!;
        Object.assign(row, data);
        checkIndex();
        return row;
      },
    },
  };
  const db = {
    $transaction: async (fn: (t: typeof tx) => Promise<unknown>) => {
      const snapshot = rows.map((r) => ({ ...r }));
      try {
        return await fn(tx);
      } catch (error) {
        rows.splice(0, rows.length, ...snapshot);
        throw error;
      }
    },
  };
  return db as unknown as PrismaClient;
}

const streets: StreetRow[] = [
  { id: 'st-shiroq', name: 'Shiroq-3', type: "Berk ko'cha", districtId: 'd-sir', isActive: true },
  { id: 'st-atlas', name: 'Atlas', type: "Ko'cha", districtId: 'd-sir', isActive: true },
  { id: 'st-old', name: 'Eski', type: "Ko'cha", districtId: 'd-sir', isActive: false },
  { id: 'st-other', name: 'Boshqa', type: "Ko'cha", districtId: 'd-other', isActive: true },
];

const property = (id: string, over: Partial<Row> = {}): Row => ({
  id,
  districtId: 'd-sir',
  mahallaName: 'Yangiobod MFY',
  isActive: true,
  streetId: null,
  houseNumber: null,
  newAddress: null,
  ...over,
});

test('buildNewAddress produces the Task.md format without doubling the MFY suffix', () => {
  const parts = {
    regionName: 'Sirdaryo viloyati',
    districtName: 'Sirdaryo tumani',
    streetName: 'Shiroq-3',
    streetType: "Berk ko'cha",
    houseNumber: '1',
  };
  const expected = "Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 1-uy";
  assert.equal(buildNewAddress({ ...parts, mahallaName: 'Yangiobod MFY' }), expected);
  assert.equal(buildNewAddress({ ...parts, mahallaName: 'Yangiobod' }), expected);
  assert.equal(buildNewAddress({ ...parts, mahallaName: 'Yangiobod mfy' }), expected);
  assert.equal(
    buildNewAddress({ ...parts, mahallaName: 'Yangiobod', streetType: "Berk ko'chasi" }),
    "Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 1-uy",
  );
});

test('isHouseNumberConflict recognizes only the (streetId, houseNumber) unique violation', () => {
  assert.ok(isHouseNumberConflict(uniqueViolation()));
  assert.ok(
    isHouseNumberConflict(
      new Prisma.PrismaClientKnownRequestError('x', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['streetId', 'houseNumber'] },
      }),
    ),
  );
  const cadConflict = new Prisma.PrismaClientKnownRequestError('x', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { driverAdapterError: { cause: { constraint: { fields: ['"cadNumber"'] } } } },
  });
  assert.ok(!isHouseNumberConflict(cadConflict));
  assert.ok(!isHouseNumberConflict(new Prisma.PrismaClientKnownRequestError('x', { code: 'P2003', clientVersion: 't' })));
  assert.ok(!isHouseNumberConflict(new Error('boom')));
});

test('assigns a house number, links the street and stores the full address', async () => {
  const rows = [property('p1')];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '1' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: true, count: 1 });
  assert.equal(rows[0].houseNumber, '1');
  assert.equal(rows[0].streetId, 'st-shiroq');
  assert.equal(rows[0].newAddress, "Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 1-uy");
});

test('assigns a batch of odd numbers in one call', async () => {
  const rows = [property('p1'), property('p2'), property('p3')];
  const result = await assignPropertyAddresses(
    'st-atlas',
    [
      { propertyId: 'p1', houseNumber: '1' },
      { propertyId: 'p2', houseNumber: '3' },
      { propertyId: 'p3', houseNumber: '5' },
    ],
    fakeDb(rows, streets),
  );
  assert.deepEqual(result, { ok: true, count: 3 });
  assert.deepEqual(rows.map((r) => r.houseNumber), ['1', '3', '5']);
  assert.ok(rows.every((r) => r.newAddress?.endsWith(`, ${r.houseNumber}-uy`)));
});

test('rejects invalid house numbers before touching the database', async () => {
  const rows = [property('p1')];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '05' }], fakeDb(rows, []));
  assert.deepEqual(result, { ok: false, error: 'INVALID_HOUSE_NUMBER', numbers: ['05'] });
  assert.equal(rows[0].houseNumber, null);
});

test('rejects a number repeated inside the batch', async () => {
  const rows = [property('p1'), property('p2')];
  const result = await assignPropertyAddresses(
    'st-shiroq',
    [
      { propertyId: 'p1', houseNumber: '5' },
      { propertyId: 'p2', houseNumber: '5' },
    ],
    fakeDb(rows, streets),
  );
  assert.deepEqual(result, { ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: ['5'] });
  assert.ok(rows.every((r) => r.houseNumber === null));
});

test('rejects a number already used by another active property on the street', async () => {
  const rows = [property('p1', { streetId: 'st-shiroq', houseNumber: '3' }), property('p2'), property('p3')];
  const result = await assignPropertyAddresses(
    'st-shiroq',
    [
      { propertyId: 'p2', houseNumber: '1' },
      { propertyId: 'p3', houseNumber: '3' },
    ],
    fakeDb(rows, streets),
  );
  assert.deepEqual(result, { ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: ['3'] });
  assert.equal(rows[1].houseNumber, null, 'nothing is written when any number conflicts');
});

test('the same number on a different street is allowed', async () => {
  const rows = [property('p1', { streetId: 'st-atlas', houseNumber: '3' }), property('p2')];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p2', houseNumber: '3' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: true, count: 1 });
});

test('soft-deleted properties do not reserve their old number', async () => {
  const rows = [property('p-old', { isActive: false, streetId: 'st-shiroq', houseNumber: '7' }), property('p1')];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '7' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: true, count: 1 });
});

test('re-saving a property with its own number succeeds', async () => {
  const rows = [property('p1', { streetId: 'st-shiroq', houseNumber: '9' })];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '9' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: true, count: 1 });
});

test('swapping two numbers in one batch succeeds despite the unique index', async () => {
  const rows = [
    property('p1', { streetId: 'st-shiroq', houseNumber: '1' }),
    property('p2', { streetId: 'st-shiroq', houseNumber: '3' }),
  ];
  const result = await assignPropertyAddresses(
    'st-shiroq',
    [
      { propertyId: 'p1', houseNumber: '3' },
      { propertyId: 'p2', houseNumber: '1' },
    ],
    fakeDb(rows, streets),
  );
  assert.deepEqual(result, { ok: true, count: 2 });
  assert.deepEqual(rows.map((r) => r.houseNumber), ['3', '1']);
});

test('moving a numbered property to another street updates street and address', async () => {
  const rows = [property('p1', { streetId: 'st-atlas', houseNumber: '4', newAddress: 'old' })];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '2A' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: true, count: 1 });
  assert.equal(rows[0].streetId, 'st-shiroq');
  assert.equal(rows[0].newAddress, "Sirdaryo viloyati, Sirdaryo tumani, Yangiobod MFY, Shiroq-3 berk ko'chasi, 2A-uy");
});

test('rejects an unknown or inactive street', async () => {
  const rows = [property('p1')];
  for (const streetId of ['missing', 'st-old']) {
    const result = await assignPropertyAddresses(streetId, [{ propertyId: 'p1', houseNumber: '1' }], fakeDb(rows, streets));
    assert.deepEqual(result, { ok: false, error: 'STREET_NOT_FOUND' }, streetId);
  }
});

test('rejects unknown or soft-deleted properties', async () => {
  const rows = [property('p1'), property('p-old', { isActive: false })];
  for (const propertyId of ['missing', 'p-old']) {
    const result = await assignPropertyAddresses('st-shiroq', [{ propertyId, houseNumber: '1' }], fakeDb(rows, streets));
    assert.deepEqual(result, { ok: false, error: 'PROPERTY_NOT_FOUND' }, propertyId);
  }
});

test('rejects a street from another district', async () => {
  const rows = [property('p1')];
  const result = await assignPropertyAddresses('st-other', [{ propertyId: 'p1', houseNumber: '1' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: false, error: 'DISTRICT_MISMATCH' });
  assert.equal(rows[0].houseNumber, null);
});

test('rejects a property without a mahalla', async () => {
  const rows = [property('p1', { mahallaName: null })];
  const result = await assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '1' }], fakeDb(rows, streets));
  assert.deepEqual(result, { ok: false, error: 'MAHALLA_MISSING' });
});

test('a concurrent duplicate caught by the unique index returns the same error and rolls back', async () => {
  // Simulates another session saving number 3 after our pre-check: the pre-check sees nothing,
  // the write hits the unique index.
  const rows = [property('p1', { streetId: 'st-shiroq', houseNumber: '3' }), property('p2'), property('p3')];
  const result = await assignPropertyAddresses(
    'st-shiroq',
    [
      { propertyId: 'p2', houseNumber: '1' },
      { propertyId: 'p3', houseNumber: '3' },
    ],
    fakeDb(rows, streets, { hideTakenNumbers: true }),
  );
  assert.deepEqual(result, { ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: [] });
  assert.equal(rows[1].houseNumber, null, 'earlier writes in the batch are rolled back');
  assert.equal(rows[0].houseNumber, '3');
});

test('unrelated database errors are not swallowed', async () => {
  const db = {
    $transaction: async () => {
      throw new Error('connection lost');
    },
  } as unknown as PrismaClient;
  await assert.rejects(assignPropertyAddresses('st-shiroq', [{ propertyId: 'p1', houseNumber: '1' }], db), /connection lost/);
});
