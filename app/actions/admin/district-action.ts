'use server';

import type { DistrictSchemaType } from '@/lib';
import type { ActionResult } from '@/types';
import { districtSchema } from '@/lib';
import { prisma } from '@/server';
import type { District } from '@/lib/generated/prisma/client';

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
  const codeNumber = Number(code);

  try {
    const existingDistrict = await prisma.district.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: codeNumber },
        ],
        NOT: { id },
      },
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
        code: codeNumber,
        regionId,
      },
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
