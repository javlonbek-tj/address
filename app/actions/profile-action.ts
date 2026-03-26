'use server';

import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { prisma } from '@/server/prisma';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib';
import type { ActionResult } from '@/types';
import { getServerSession } from '@/lib/auth/session';
import { assertActive, isSuperuser } from '@/lib/auth/authorization';
import { SUPERUSER_DENIED_MESSAGE } from '@/lib/constants/user';

export async function changePassword(
  data: ChangePasswordFormValues,
): Promise<ActionResult> {
  const session = await getServerSession();
  assertActive(session!.user);
  if (isSuperuser(session!.user)) return { success: false, message: SUPERUSER_DENIED_MESSAGE };

  const validation = changePasswordSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION_ERROR' };
  }

  const { oldPassword, newPassword } = validation.data;

  try {
    const authUser = await prisma.user.findUnique({
      where: { id: session!.user.id },
      include: { accounts: { where: { providerId: 'credential' } } },
    });

    const account = authUser?.accounts[0];
    if (!account?.password) {
      return { success: false, message: 'Foydalanuvchi topilmadi' };
    }

    const isValid = await verifyPassword({
      hash: account.password,
      password: oldPassword,
    });
    if (!isValid) {
      return { success: false, message: "Eski parol noto'g'ri" };
    }

    const newHash = await hashPassword(newPassword);

    await prisma.account.update({
      where: { id: account.id },
      data: { password: newHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
