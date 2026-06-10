'use server';

import { prisma } from '@/server/prisma';
import type { ActionResult, Street } from '@/types';
import { streetSchema, type StreetSchemaType } from '@/lib';
import { getServerSession } from '@/lib/auth/session';
import {
  assertActive,
  assertSuperadmin,
  isSuperuser,
} from '@/lib/auth/authorization';
import { SUPERUSER_DENIED_MESSAGE } from '@/lib/constants/user';

export async function updateStreet(
  id: string,
  data: StreetSchemaType,
): Promise<ActionResult<Street>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user))
    return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertSuperadmin(session!.user);

  const validationResult = streetSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const { name, code, type, uzKadCode, mahallas } = validationResult.data;

  try {
    // Check if code already exists and is not this street
    const existingStreet = await prisma.street.findFirst({
      where: {
        code,
        NOT: { id },
      },
    });

    if (existingStreet) {
      return {
        success: false,
        message: "Ushbu ko'cha kodi allaqachon mavjud",
      };
    }

    const updatedStreet = await prisma.street.update({
      where: { id },
      data: {
        name,
        code,
        type,
        uzKadCode: uzKadCode || null,
        mahalla: {
          set: mahallas.map((m) => ({ code: m.mahallaCode })),
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        uzKadCode: true,
        type: true,
        oldName: true,
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
        mahalla: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return { success: true, data: updatedStreet as unknown as Street };
  } catch (error) {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function updateStreetUzKadCode(
  id: string,
  uzKadCode: string | null,
): Promise<ActionResult<null>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user))
    return { success: false, message: SUPERUSER_DENIED_MESSAGE };

  try {
    if (uzKadCode) {
      const [street, uzKadStreet] = await Promise.all([
        prisma.street.findUnique({ where: { id }, select: { type: true, districtId: true } }),
        prisma.uzKadStreet.findUnique({ where: { code: uzKadCode }, select: { type: true, districtId: true } }),
      ]);

      if (!uzKadStreet) {
        return { success: false, message: 'Bu UzKad kodi mavjud emas' };
      }

      if (uzKadStreet.districtId !== street?.districtId) {
        return { success: false, message: "Bu kod boshqa tumanga tegishli" };
      }

      if (uzKadStreet.type && street?.type && uzKadStreet.type !== street.type) {
        return { success: false, message: "Xat ko'cha kodi qo'yildi" };
      }
    }

    await prisma.street.update({
      where: { id },
      data: {
        uzKadCode: uzKadCode || null,
        uzKadUpdatedAt: uzKadCode ? new Date() : null,
      },
    });

    return { success: true, data: null };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, message: "Bu UzKad kodi boshqa ko'chaga biriktirilgan" };
    }
    return { success: false, message: 'Saqlashda xatolik yuz berdi' };
  }
}

export async function deleteStreet(id: string): Promise<ActionResult<null>> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user))
    return { success: false, message: SUPERUSER_DENIED_MESSAGE };
  assertSuperadmin(session!.user);

  try {
    await prisma.street.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
