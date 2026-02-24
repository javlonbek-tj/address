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
    hidden,
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

    const updatedMahalla = await prisma.$transaction(async (tx) => {
      const mahalla = id
        ? await tx.mahalla.update({
            where: { id },
            data: {
              name,
              code,
              districtId,
              uzKadName,
              geoCode,
              oneId,
              hidden: isOptimized ? hidden : false,
              oldName,
              regulation,
              regulationUrl,
            },
          })
        : await tx.mahalla.create({
            data: {
              name,
              code,
              districtId,
              uzKadName,
              geoCode,
              oneId,
              hidden: isOptimized ? hidden : false,
              oldName,
              regulation,
              regulationUrl,
              geometry: {},
            },
          });

      if (isOptimized && mergingMahallas && mergingMahallas.length > 0) {
        await tx.mahalla.updateMany({
          where: {
            id: { in: mergingMahallas.map((m: any) => m.id) },
          },
          data: {
            mergedIntoId: mahalla.id,
            mergedIntoName: mahalla.name,
          },
        });
      }

      return mahalla;
    });

    return { success: true, data: updatedMahalla as unknown as Mahalla };
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
