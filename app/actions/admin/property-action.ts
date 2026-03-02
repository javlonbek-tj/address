'use server';

import { prisma } from '@/server/prisma';
import type { ActionResult, PropertyWithRelations } from '@/types';
import { propertySchema, type PropertySchemaType } from '@/lib';

export async function updateProperty(
  id: string,
  data: PropertySchemaType,
): Promise<ActionResult<PropertyWithRelations>> {
  const validationResult = propertySchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }

  const {
    cadNumber,
    newCadNumber,
    newHouseNumber,
    type,
    streetId,
    mahallaId,
    districtId,
  } = validationResult.data;

  try {
    // Check if cadNumber already exists
    const existingCad = await prisma.property.findFirst({
      where: {
        cadNumber,
        NOT: { id },
      },
    });

    if (existingCad) {
      return {
        success: false,
        message: 'Ushbu eski kadastr raqami allaqachon mavjud',
      };
    }

    // Check if newCadNumber already exists (if provided)
    if (newCadNumber) {
      const existingNewCad = await prisma.property.findFirst({
        where: {
          newCadNumber,
          NOT: { id },
        },
      });

      if (existingNewCad) {
        return {
          success: false,
          message: 'Ushbu yangi kadastr raqami allaqachon mavjud',
        };
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        cadNumber,
        newCadNumber: newCadNumber || null,
        newHouseNumber: newHouseNumber || null,
        type: type || 'residential',
        streetId: streetId || null,
        mahallaId,
        districtId,
      },
      include: {
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
        street: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return { success: true, data: updatedProperty as any };
  } catch (error) {
    console.error('Failed to update property:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function deleteProperty(
  id: string,
): Promise<ActionResult<PropertyWithRelations>> {
  try {
    const deletedProperty = await prisma.property.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true, data: deletedProperty as any };
  } catch (error) {
    console.error('Failed to delete property:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
