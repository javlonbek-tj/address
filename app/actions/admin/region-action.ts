'use server';

import type { RegionSchemaType } from '@/lib';
import type { ActionResult } from '@/types';
import { regionSchema } from '@/lib';
import { prisma } from '@/server';
import type { Region } from '@/types';

export async function updateRegion(
  id: string,
  data: RegionSchemaType,
): Promise<ActionResult<Region>> {
  const validationResult = regionSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const { name, code } = validationResult.data;

  try {
    const existingRegion = await prisma.region.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { code }],
        NOT: { id },
      },
      select: { id: true },
    });

    if (existingRegion) {
      return {
        success: false,
        message: 'Hudud allaqachon mavjud',
      };
    }

    const updatedRegion = await prisma.region.update({
      where: { id },
      data: {
        name,
        code,
      },
      select: { id: true, name: true, code: true },
    });

    return {
      success: true,
      data: updatedRegion,
    };
  } catch (error) {
    console.error('[UPDATE_REGION_ERROR]', error);
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}

export async function deleteRegion(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.region.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('[DELETE_REGION_ERROR]', error);
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}
