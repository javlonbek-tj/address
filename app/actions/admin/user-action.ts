'use server';

import { revalidatePath } from 'next/cache';
import { hashPassword } from 'better-auth/crypto';
import { prisma } from '@/server/prisma';
import {
  UserRole,
  UserStatus,
  RegionUserPosition,
} from '@/lib/generated/prisma/enums';
import {
  userSchema,
  type UserFormValues,
  updateUserSchema,
  type UpdateUserFormValues,
} from '@/lib';
import type { ActionResult } from '@/types';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, assertSuperadmin } from '@/lib/auth/authorization';

export async function createUser(data: UserFormValues): Promise<ActionResult> {
  const session = await getServerSession();
  assertActive(session!.user);
  assertSuperadmin(session!.user);

  const validation = userSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION_ERROR' };
  }

  const {
    username,
    fullName,
    phoneNumber,
    role,
    status,
    position,
    regionId,
    districtId,
    password,
  } = validation.data;

  try {
    if (status === UserStatus.active) {
      if (!username || !password) {
        return { success: false, error: 'VALIDATION_ERROR' };
      }

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return { success: false, error: 'Bu login mavjud' };
      }

      const passwordHash = await hashPassword(password);

      await prisma.$transaction(async (tx) => {
        const authIdentity = await tx.user.create({
          data: {
            username,
            displayUsername: fullName ?? username,
            accounts: {
              create: {
                accountId: username,
                providerId: 'credential',
                password: passwordHash,
              },
            },
          },
        });

        await tx.appUser.create({
          data: {
            fullName,
            phoneNumber,
            role: role as UserRole,
            status: UserStatus.active,
            position: position as RegionUserPosition,
            regionId: regionId ?? null,
            districtId: districtId ?? null,
            isActive: true,
            authId: authIdentity.id,
          },
        });
      });
    } else {
      // Vakant — no auth identity needed
      await prisma.appUser.create({
        data: {
          fullName: null,
          phoneNumber: null,
          role: role as UserRole,
          status: UserStatus.inactive,
          position: position as RegionUserPosition,
          regionId: regionId ?? null,
          districtId: districtId ?? null,
          isActive: true,
          authId: null,
        },
      });
    }

    revalidatePath('/users');
    return { success: true };
  } catch {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function updateUser(
  id: string,
  data: UpdateUserFormValues,
): Promise<ActionResult> {
  const session = await getServerSession();
  assertActive(session!.user);
  assertSuperadmin(session!.user);

  const validation = updateUserSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION_ERROR' };
  }

  const {
    fullName,
    phoneNumber,
    role,
    status,
    position,
    regionId,
    districtId,
  } = validation.data;

  try {
    await prisma.appUser.update({
      where: { id },
      data: {
        fullName,
        phoneNumber,
        role: role as UserRole,
        status: status as UserStatus,
        position: position as RegionUserPosition,
        regionId: regionId ?? null,
        districtId: districtId ?? null,
      },
    });

    revalidatePath('/users');
    return { success: true };
  } catch {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  assertActive(session!.user);
  assertSuperadmin(session!.user);

  try {
    await prisma.appUser.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/users');
    return { success: true };
  } catch {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
