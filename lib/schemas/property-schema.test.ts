// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  batchAssignSchema,
  HOUSE_NUMBER_FORMAT_MESSAGE,
  HOUSE_NUMBER_REGEX,
  propertyAssignSchema,
} from './property-schema';

test('HOUSE_NUMBER_REGEX accepts canonical house numbers', () => {
  for (const value of ['1', '25', '2A', '12/1', '100', '7Z', '3/12']) {
    assert.ok(HOUSE_NUMBER_REGEX.test(value), value);
  }
});

test('HOUSE_NUMBER_REGEX rejects non-canonical values instead of converting them', () => {
  for (const value of ['05', '0', '2a', '2AB', '12/', '/1', 'A', '1-2', '1 A', '', ' 1', '12/01A']) {
    assert.ok(!HOUSE_NUMBER_REGEX.test(value), JSON.stringify(value));
  }
});

test('propertyAssignSchema trims whitespace but never rewrites the number', () => {
  const ok = propertyAssignSchema.safeParse({ streetId: 's1', houseNumber: ' 12/1 ' });
  assert.ok(ok.success);
  assert.equal(ok.data.houseNumber, '12/1');

  for (const houseNumber of ['05', '0', '2a']) {
    const result = propertyAssignSchema.safeParse({ streetId: 's1', houseNumber });
    assert.ok(!result.success, houseNumber);
    assert.equal(result.error.issues[0].message, HOUSE_NUMBER_FORMAT_MESSAGE);
  }
});

test('propertyAssignSchema requires a street and a house number', () => {
  const result = propertyAssignSchema.safeParse({ streetId: ' ', houseNumber: '' });
  assert.ok(!result.success);
  const messages = result.error.issues.map((i) => i.message);
  assert.ok(messages.includes("Ko'cha tanlanishi kerak"));
  assert.ok(messages.includes('Uy raqami kiritilishi kerak'));
});

test('propertyAssignSchema limits the length to 10 characters', () => {
  assert.ok(!propertyAssignSchema.safeParse({ streetId: 's1', houseNumber: '12345678901' }).success);
});

test('batchAssignSchema accepts sequential semi-automatic numbers', () => {
  const result = batchAssignSchema.safeParse({
    streetId: 's1',
    assignments: [
      { propertyId: 'p1', houseNumber: 1 },
      { propertyId: 'p2', houseNumber: 3 },
    ],
  });
  assert.ok(result.success);
});

test('batchAssignSchema rejects repeated properties, repeated numbers and invalid numbers', () => {
  const repeatedProperty = batchAssignSchema.safeParse({
    streetId: 's1',
    assignments: [
      { propertyId: 'p1', houseNumber: 1 },
      { propertyId: 'p1', houseNumber: 3 },
    ],
  });
  assert.ok(!repeatedProperty.success);
  assert.ok(repeatedProperty.error.issues.some((i) => i.message === 'Takroriy bino'));

  const repeatedNumber = batchAssignSchema.safeParse({
    streetId: 's1',
    assignments: [
      { propertyId: 'p1', houseNumber: 5 },
      { propertyId: 'p2', houseNumber: 5 },
    ],
  });
  assert.ok(!repeatedNumber.success);
  assert.ok(repeatedNumber.error.issues.some((i) => i.message === 'Takroriy uy raqami'));

  for (const houseNumber of [0, -1, 1.5]) {
    assert.ok(
      !batchAssignSchema.safeParse({ streetId: 's1', assignments: [{ propertyId: 'p1', houseNumber }] }).success,
      String(houseNumber),
    );
  }
  assert.ok(!batchAssignSchema.safeParse({ streetId: 's1', assignments: [] }).success);
});
