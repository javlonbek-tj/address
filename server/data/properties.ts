import { prisma } from '../prisma';
import { Prisma, type PrismaClient } from '@/lib/generated/prisma/client';
import { HOUSE_NUMBER_FORMAT_MESSAGE, HOUSE_NUMBER_REGEX } from '@/lib/schemas/property-schema';
import type { PropertyDetail, PropertyListItem } from '@/types';

export type AssignItem = { propertyId: string; houseNumber: string };

type AssignResult =
  | { ok: true; count: number; reserved: number }
  | { ok: false; error: 'STREET_NOT_FOUND' | 'PROPERTY_NOT_FOUND' | 'DISTRICT_MISMATCH' | 'MAHALLA_MISSING' }
  | {
      ok: false;
      error: 'DUPLICATE_HOUSE_NUMBER' | 'INVALID_HOUSE_NUMBER' | 'RESERVED_HOUSE_NUMBER';
      numbers: string[];
    };

type AssignFailure = Extract<AssignResult, { ok: false }>;

class ReservationConflictError extends Error {}

export function assignErrorMessage(result: AssignFailure): string {
  switch (result.error) {
    case 'STREET_NOT_FOUND':
      return "Ko'cha topilmadi";
    case 'PROPERTY_NOT_FOUND':
      return 'Bino topilmadi';
    case 'DISTRICT_MISMATCH':
      return "Bino va ko'cha bir tumanda emas";
    case 'MAHALLA_MISSING':
      return 'Binoning mahallasi aniqlanmagan';
    case 'INVALID_HOUSE_NUMBER':
      return HOUSE_NUMBER_FORMAT_MESSAGE;
    case 'DUPLICATE_HOUSE_NUMBER':
      return result.numbers.length
        ? `Bu ko'chada ${result.numbers.join(', ')} uy raqami allaqachon mavjud`
        : "Bu ko'chada ushbu uy raqami allaqachon mavjud";
    case 'RESERVED_HOUSE_NUMBER':
      return result.numbers.length
        ? `Bu ko'chada ${result.numbers.join(', ')} raqami zaxirada. Zaxiradagi raqamni ro'yxatdan tanlang`
        : "Bu ko'chada ushbu raqam zaxirada";
  }
}

export function assignErrorStatus(result: AssignFailure): number {
  if (result.error === 'DUPLICATE_HOUSE_NUMBER' || result.error === 'RESERVED_HOUSE_NUMBER') return 409;
  if (result.error === 'STREET_NOT_FOUND' || result.error === 'PROPERTY_NOT_FOUND') return 404;
  return 400;
}

export function buildNewAddress({
  regionName,
  districtName,
  mahallaName,
  streetName,
  streetType,
  houseNumber,
}: {
  regionName: string;
  districtName: string;
  mahallaName: string;
  streetName: string;
  streetType: string;
  houseNumber: string;
}): string {
  // Mahalla names are stored with their "MFY" suffix already ("Yangiobod MFY").
  const mahalla = mahallaName.replace(/\s+mfy$/i, '');
  // Street types are stored as "Ko'cha", "Berk ko'cha", …; the address uses the possessive form
  // ("Shiroq-3 berk ko'chasi"). Any apostrophe variant is accepted.
  const lowered = streetType.charAt(0).toLowerCase() + streetType.slice(1);
  const type = /ko['ʻʼ‘’`]cha$/i.test(lowered) ? `${lowered}si` : lowered;
  return `${regionName}, ${districtName}, ${mahalla} MFY, ${streetName} ${type}, ${houseNumber}-uy`;
}

// The only unique constraint over (streetId, houseNumber) is the partial index
// properties_streetId_houseNumber_active_key. @prisma/adapter-pg reports the violated
// columns (not the index name) in meta.driverAdapterError.cause.constraint.fields.
export function isHouseNumberConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') return false;
  const meta = error.meta as
    | {
        target?: unknown;
        driverAdapterError?: { cause?: { constraint?: { fields?: string[]; index?: string } } };
      }
    | undefined;
  const target = meta?.target;
  const constraint = meta?.driverAdapterError?.cause?.constraint;
  const names = [
    ...(Array.isArray(target) ? target : typeof target === 'string' ? [target] : []),
    ...(constraint?.fields ?? []),
    ...(constraint?.index ? [constraint.index] : []),
  ].map((name) => String(name).replace(/"/g, ''));
  return (
    names.includes('properties_streetId_houseNumber_active_key') ||
    (names.includes('streetId') && names.includes('houseNumber'))
  );
}

export async function getProperties({
  districtId,
  mahallaId,
  streetId,
}: {
  districtId: string;
  mahallaId?: string;
  streetId?: string;
}): Promise<PropertyListItem[]> {
  return prisma.property.findMany({
    where: {
      districtId,
      isActive: true,
      ...(mahallaId ? { mahallaId } : {}),
      ...(streetId ? { streetId } : {}),
    },
    select: {
      id: true,
      cadNumber: true,
      propertyKind: true,
      houseNumber: true,
      newAddress: true,
      streetId: true,
      mahallaId: true,
      geometry: true,
      mahalla: { select: { name: true } },
      street: { select: { name: true, type: true } },
    },
    orderBy: { cadNumber: 'asc' },
  });
}

export async function getPropertyById(id: string): Promise<PropertyDetail | null> {
  return prisma.property.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      cadNumber: true,
      houseNumber: true,
      newAddress: true,
      streetId: true,
      districtId: true,
      mahalla: { select: { id: true, name: true } },
      street: { select: { id: true, name: true, type: true } },
    },
  });
}

export async function getStreetDistrictId(streetId: string): Promise<string | null> {
  const street = await prisma.street.findFirst({
    where: { id: streetId, isActive: true },
    select: { districtId: true },
  });
  return street?.districtId ?? null;
}

// Used and reserved numbers of one street (letter suffixes and auto-skipping reserved numbers).
export async function getStreetNumbers(streetId: string): Promise<{ used: string[]; reserved: string[] }> {
  const [used, reserved] = await Promise.all([
    prisma.property.findMany({
      where: { streetId, isActive: true, houseNumber: { not: null } },
      select: { houseNumber: true },
    }),
    prisma.reservedHouseNumber.findMany({ where: { streetId }, select: { houseNumber: true } }),
  ]);
  return {
    used: used.map((u) => u.houseNumber as string),
    reserved: reserved.map((r) => r.houseNumber),
  };
}

export async function getReservedNumbersByDistrict(districtId: string) {
  return prisma.reservedHouseNumber.findMany({
    where: { street: { districtId } },
    select: { houseNumber: true, createdAt: true, street: { select: { name: true, type: true } } },
    orderBy: [{ street: { name: 'asc' } }, { createdAt: 'asc' }],
  });
}

export async function deleteReservedNumber(streetId: string, houseNumber: string): Promise<boolean> {
  const { count } = await prisma.reservedHouseNumber.deleteMany({ where: { streetId, houseNumber } });
  return count > 0;
}

// Single source of truth for writing house numbers (manual: one item, semi-auto: many).
// `reserve` keeps numbers free for empty plots. A reserved number can only be given to a
// building when `useReserved` is set (picked from the reserve list); the reservation is then
// released in the same transaction. Callers must authorize the street's district before calling.
export async function assignPropertyAddresses(
  streetId: string,
  items: AssignItem[],
  db: PrismaClient = prisma,
  options: { reserve?: string[]; useReserved?: boolean; userId?: string } = {},
): Promise<AssignResult> {
  const reserve = options.reserve ?? [];
  const numbers = items.map((i) => i.houseNumber);
  const allNumbers = [...numbers, ...reserve];

  const invalid = allNumbers.filter((n) => !HOUSE_NUMBER_REGEX.test(n));
  if (invalid.length) return { ok: false, error: 'INVALID_HOUSE_NUMBER', numbers: invalid };

  const repeated = [...new Set(allNumbers.filter((n, index) => allNumbers.indexOf(n) !== index))];
  if (repeated.length) return { ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: repeated };

  const ids = items.map((i) => i.propertyId);

  try {
    return await db.$transaction(
      async (tx): Promise<AssignResult> => {
        const street = await tx.street.findFirst({
          where: { id: streetId, isActive: true },
          select: {
            name: true,
            type: true,
            districtId: true,
            district: { select: { name: true, region: { select: { name: true } } } },
          },
        });
        if (!street) return { ok: false, error: 'STREET_NOT_FOUND' };

        const properties = await tx.property.findMany({
          where: { id: { in: ids }, isActive: true },
          select: { id: true, districtId: true, mahalla: { select: { name: true } } },
        });
        const byId = new Map(properties.map((p) => [p.id, p]));
        if (ids.some((id) => !byId.has(id))) return { ok: false, error: 'PROPERTY_NOT_FOUND' };
        if (properties.some((p) => p.districtId !== street.districtId)) {
          return { ok: false, error: 'DISTRICT_MISMATCH' };
        }
        if (properties.some((p) => !p.mahalla)) return { ok: false, error: 'MAHALLA_MISSING' };

        // Rows being written are excluded, so re-saving or swapping numbers within a batch is allowed.
        const taken = await tx.property.findMany({
          where: { streetId, isActive: true, houseNumber: { in: allNumbers }, id: { notIn: ids } },
          select: { houseNumber: true },
        });
        if (taken.length) {
          const conflicts = [...new Set(taken.map((t) => t.houseNumber as string))].sort();
          return { ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: conflicts };
        }

        const reservedTaken = await tx.reservedHouseNumber.findMany({
          where: { streetId, houseNumber: { in: allNumbers } },
          select: { houseNumber: true },
        });
        const reservedSet = new Set(reservedTaken.map((r) => r.houseNumber));
        const blocked = [
          ...reserve.filter((n) => reservedSet.has(n)),
          ...(options.useReserved ? [] : numbers.filter((n) => reservedSet.has(n))),
        ];
        if (blocked.length) {
          return { ok: false, error: 'RESERVED_HOUSE_NUMBER', numbers: [...new Set(blocked)].sort() };
        }
        const releasing = numbers.filter((n) => reservedSet.has(n));
        if (releasing.length) {
          await tx.reservedHouseNumber.deleteMany({ where: { streetId, houseNumber: { in: releasing } } });
        }
        if (reserve.length) {
          try {
            await tx.reservedHouseNumber.createMany({
              data: reserve.map((houseNumber) => ({ streetId, houseNumber, createdById: options.userId })),
            });
          } catch (error) {
            // Same columns as the property index, so the source is identified here, not by the error.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
              throw new ReservationConflictError();
            }
            throw error;
          }
        }

        // The unique index is not deferrable: clear first so swaps don't collide mid-transaction.
        await tx.property.updateMany({ where: { id: { in: ids } }, data: { houseNumber: null } });
        for (const item of items) {
          const property = byId.get(item.propertyId)!;
          await tx.property.update({
            where: { id: item.propertyId },
            data: {
              houseNumber: item.houseNumber,
              streetId,
              newAddress: buildNewAddress({
                regionName: street.district.region.name,
                districtName: street.district.name,
                mahallaName: property.mahalla!.name,
                streetName: street.name,
                streetType: street.type,
                houseNumber: item.houseNumber,
              }),
            },
          });
        }
        return { ok: true, count: items.length, reserved: reserve.length };
      },
      { maxWait: 10_000, timeout: 60_000 },
    );
  } catch (error) {
    // Another session took the number between the pre-check and the write.
    if (isHouseNumberConflict(error)) return { ok: false, error: 'DUPLICATE_HOUSE_NUMBER', numbers: [] };
    if (error instanceof ReservationConflictError) return { ok: false, error: 'RESERVED_HOUSE_NUMBER', numbers: [] };
    throw error;
  }
}
