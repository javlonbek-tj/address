'use server';

import { prisma } from '@/server/prisma';
import { revalidatePath } from 'next/cache';
import {
  UserRole,
  UserStatus,
  RegionUserPosition,
} from '@/lib/generated/prisma/enums';

export async function createUser(data: any) {
  try {
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role as UserRole,
        status: (data.status as UserStatus) || 'active',
        position: data.position as RegionUserPosition,
        regionId: data.regionId || null,
        districtId: data.districtId || null,
        isActive: true,
      },
    });

    revalidatePath('/employees');
    return { success: true, data: user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return {
      success: false,
      error: 'Foydalanuvchi yaratishda xatolik yuz berdi',
    };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        position: data.position as RegionUserPosition,
        regionId: data.regionId || null,
        districtId: data.districtId || null,
      },
    });

    revalidatePath('/employees');
    return { success: true, data: user };
  } catch (error) {
    console.error('Failed to update user:', error);
    return {
      success: false,
      error: 'Foydalanuvchi ma’lumotlarini yangilashda xatolik yuz berdi',
    };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/employees');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return {
      success: false,
      error: 'Foydalanuvchini o‘chirishda xatolik yuz berdi',
    };
  }
}
