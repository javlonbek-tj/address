'use server';

import { prisma } from '@/server/prisma';
import type { ActionResult } from '@/types';
import type { MahallaSchemaType } from '@/lib';
import type { Mahalla } from '@/types';
import { mahallaSchema } from '@/lib';

export async function updateMahalla(
  id: string,
  data: MahallaSchemaType,
): Promise<ActionResult<Mahalla>> {
  const validationResult = mahallaSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const {
    name,
    code,
    districtId,
    uzKadName,
    geoCode,
    oneId,
    oldName,
    regulation,
    regulationUrl,
    isOptimized,
    mergingMahallas,
    mergedInto,
  } = validationResult.data;

  try {
    const existingMahalla = await prisma.mahalla.findFirst({
      where: {
        NOT: { id: id || undefined },
        OR: [
          { code },
          {
            districtId,
            OR: [
              { name: { equals: name, mode: 'insensitive' } },
              { uzKadName: { equals: uzKadName, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { id: true },
    });

    if (existingMahalla) {
      return {
        success: false,
        message: 'Mahalla allaqachon mavjud',
      };
    }

    const targetCodes = (mergedInto || []).map(
      (mahalla) => mahalla.mahallaCode,
    );
    const targets = await prisma.mahalla.findMany({
      where: { code: { in: targetCodes } },
      select: { id: true },
    });

    const sourceCodes = (mergingMahallas || []).map(
      (mahalla) => mahalla.mahallaCode,
    );
    const sources = await prisma.mahalla.findMany({
      where: { code: { in: sourceCodes } },
      select: { id: true },
    });

    const updatedMahalla = await prisma.$transaction(async (tx) => {
      const mahalla = await tx.mahalla.update({
        where: { id },
        data: {
          name,
          code,
          districtId,
          uzKadName,
          geoCode,
          oneId,
          oldName,
          regulation,
          regulationUrl,
          isOptimized,
          mergedInto: {
            set: targets.map((mahalla) => ({ id: mahalla.id })),
          },
          mergedMahallas: {
            set: sources.map((mahalla) => ({ id: mahalla.id })),
          },
        },
        select: {
          id: true,
          name: true,
          code: true,
          uzKadName: true,
          geoCode: true,
          oneId: true,
          isOptimized: true,
          mergedInto: {
            select: {
              code: true,
              name: true,
            },
          },
          mergedMahallas: {
            select: {
              code: true,
              name: true,
            },
          },
          oldName: true,
          regulation: true,
          regulationUrl: true,
          district: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return mahalla;
    });

    return { success: true, data: updatedMahalla };
  } catch (error) {
    console.error('Failed to update mahalla:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function deleteMahalla(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.mahalla.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, data: null };
  } catch (error) {
    console.error('Failed to delete mahalla:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
