'use server';

import type { RegionSchemaType } from '@/lib';
import type { ActionResult } from '@/types';
import { regionSchema } from '@/lib';
import { prisma } from '@/server';
import type { Region } from '@/lib/generated/prisma/client';

export async function updateRegion(
  id: string,
  data: RegionSchemaType,
): Promise<ActionResult<Region>> {
  const validationResult = regionSchema.safeParse(data);

  if (!validationResult.success) {
    console.log(validationResult.error);
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const { name, code } = validationResult.data;
  const codeNumber = Number(code);

  try {
    const existingRegion = await prisma.region.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: codeNumber },
        ],
        NOT: { id },
      },
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
        code: codeNumber,
      },
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
