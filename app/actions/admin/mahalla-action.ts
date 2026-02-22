'use server';

import { prisma } from '@/server/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteMahalla(id: string) {
  try {
    await prisma.mahalla.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/mahallas');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete mahalla:', error);
    return { success: false, error: "Mahallani o'chirishda xatolik yuz berdi" };
  }
}
