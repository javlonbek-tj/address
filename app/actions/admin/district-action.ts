'use server';

import type { DistrictSchemaType } from '@/lib';
import type { ActionResult } from '@/types';
import { districtSchema } from '@/lib';
import { prisma } from '@/server';
import type { District } from '@/types';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, assertMinRole, isSuperuser } from '@/lib/auth/authorization';
import { UserRole } from '@/lib/generated/prisma/enums';
import { SUPERUSER_DENIED_MESSAGE } from '@/lib/constants/user';

export async function updateDistrict(
  id: string,
  data: DistrictSchemaType,
): Promise<ActionResult<District>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user)) return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertMinRole(session!.user, UserRole.region_user);

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
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}

export async function deleteDistrict(id: string): Promise<ActionResult<null>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user)) return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertMinRole(session!.user, UserRole.region_user);

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
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}
