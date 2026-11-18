'use server';

import { centroid } from '@turf/turf';

import { prisma } from '@/server/prisma';
import type { ActionResult } from '@/types';
import type { MahallaSchemaType } from '@/lib';
import type { Mahalla } from '@/types';
import { mahallaSchema } from '@/lib';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, assertSuperadmin, isSuperuser } from '@/lib/auth/authorization';
import { SUPERUSER_DENIED_MESSAGE } from '@/lib/constants/user';

// Mahallas created without a boundary file; an empty MultiPolygon keeps the required column valid and renders nothing.
const EMPTY_GEOMETRY = { type: 'MultiPolygon', coordinates: [] };

function withCenter(geometry: NonNullable<MahallaSchemaType['geometry']>) {
  return {
    geometry,
    center: { type: 'Point', coordinates: centroid(geometry).geometry.coordinates },
  };
}

const mahallaSelect = {
  id: true,
  name: true,
  code: true,
  uzKadName: true,
  geoCode: true,
  oneId: true,
  isOptimized: true,
  mergedInto: { select: { code: true, name: true } },
  mergedMahallas: { select: { code: true, name: true } },
  oldName: true,
  regulation: true,
  regulationUrl: true,
  district: {
    select: {
      id: true,
      name: true,
      region: { select: { id: true, name: true } },
    },
  },
} as const;

async function findDuplicateMahalla(
  data: Pick<MahallaSchemaType, 'code' | 'districtId' | 'name' | 'uzKadName'>,
  excludeId?: string,
) {
  return prisma.mahalla.findFirst({
    where: {
      ...(excludeId && { NOT: { id: excludeId } }),
      OR: [
        { code: data.code },
        {
          districtId: data.districtId,
          OR: [
            { name: { equals: data.name, mode: 'insensitive' } },
            { uzKadName: { equals: data.uzKadName, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: { id: true },
  });
}

async function resolveMahallaIdsByCode(items: Array<{ mahallaCode: string }>) {
  const mahallas = await prisma.mahalla.findMany({
    where: { code: { in: items.map((item) => item.mahallaCode) } },
    select: { id: true },
  });
  return mahallas.map((mahalla) => ({ id: mahalla.id }));
}

export async function createMahalla(
  data: MahallaSchemaType,
): Promise<ActionResult<Mahalla>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user)) return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertSuperadmin(session!.user);

  const validationResult = mahallaSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const { regionId, mergingMahallas, mergedInto, geometry, ...fields } = validationResult.data;

  try {
    if (await findDuplicateMahalla(fields)) {
      return {
        success: false,
        message: 'Mahalla allaqachon mavjud',
      };
    }

    const targets = await resolveMahallaIdsByCode(mergedInto);
    const sources = await resolveMahallaIdsByCode(mergingMahallas);

    const mahalla = await prisma.mahalla.create({
      data: {
        ...fields,
        ...(geometry ? withCenter(geometry) : { geometry: EMPTY_GEOMETRY }),
        mergedInto: { connect: targets },
        mergedMahallas: { connect: sources },
      },
      select: mahallaSelect,
    });

    return { success: true, data: mahalla };
  } catch (error) {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function updateMahalla(
  id: string,
  data: MahallaSchemaType,
): Promise<ActionResult<Mahalla>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user)) return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertSuperadmin(session!.user);

  const validationResult = mahallaSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const { regionId, mergingMahallas, mergedInto, geometry, ...fields } = validationResult.data;

  try {
    if (await findDuplicateMahalla(fields, id)) {
      return {
        success: false,
        message: 'Mahalla allaqachon mavjud',
      };
    }

    const targets = await resolveMahallaIdsByCode(mergedInto);
    const sources = await resolveMahallaIdsByCode(mergingMahallas);

    const mahalla = await prisma.mahalla.update({
      where: { id },
      data: {
        ...fields,
        ...(geometry && withCenter(geometry)),
        mergedInto: { set: targets },
        mergedMahallas: { set: sources },
      },
      select: mahallaSelect,
    });

    return { success: true, data: mahalla };
  } catch (error) {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function deleteMahalla(id: string): Promise<ActionResult<null>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user)) return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertSuperadmin(session!.user);

  try {
    await prisma.mahalla.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
