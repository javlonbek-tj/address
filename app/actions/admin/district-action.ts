'use server';

import type { DistrictSchemaType } from '@/lib';
import type { ActionResult } from '@/types';
import { districtSchema } from '@/lib';
import { prisma } from '@/server';
import type { District } from '@/types';

export async function updateDistrict(
  id: string,
  data: DistrictSchemaType,
): Promise<ActionResult<District>> {
  const validationResult = districtSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const { name, code, regionId } = validationResult.data;

  try {
    const existingDistrict = await prisma.district.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { code }],
        NOT: { id },
      },
      select: { id: true },
    });

    if (existingDistrict) {
      return {
        success: false,
        message: 'Tuman allaqachon mavjud',
      };
    }

    const updatedDistrict = await prisma.district.update({
      where: { id },
      data: {
        name,
        code,
        regionId,
      },
      select: { id: true, name: true, code: true, regionId: true },
    });

    return {
      success: true,
      data: updatedDistrict,
    };
  } catch (error) {
    console.error('[UPDATE_DISTRICT_ERROR]', error);
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}

export async function deleteDistrict(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.district.update({
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
    console.error('[DELETE_DISTRICT_ERROR]', error);
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}
