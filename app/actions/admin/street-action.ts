'use server';

import { prisma } from '@/server/prisma';
import type { ActionResult } from '@/types';

export async function deleteStreet(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.street.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, data: null };
  } catch (error) {
    console.error('Failed to delete street:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
