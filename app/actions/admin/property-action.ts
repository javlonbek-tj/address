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

  const { newCadNumber, type, streetId } = validationResult.data;

  try {
    // Check if newCadNumber already exists (if provided)
    if (newCadNumber) {
      const existingProperty = await prisma.property.findFirst({
        where: {
          newCadNumber,
          NOT: { id },
        },
      });

      if (existingProperty) {
        return {
          success: false,
          message: 'Ushbu yangi kadastr raqami boshqa bino uchun kiritilgan',
        };
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        newCadNumber,
        type,
        streetId,
      },
      include: {
        district: {
          select: {
            name: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data: updatedProperty as PropertyWithRelations };
  } catch (error) {
    console.error('Failed to update property:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
