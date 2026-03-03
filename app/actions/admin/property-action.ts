'use server';

import { prisma } from '@/server/prisma';
import type { ActionResult, PropertyWithRelations } from '@/types';
import {
  updatePropertySchema,
  createPropertySchema,
  type PropertySchemaType,
} from '@/lib';

export async function updateProperty(
  id: string,
  data: PropertySchemaType,
): Promise<ActionResult<PropertyWithRelations>> {
  const validationResult = updatePropertySchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      message:
        validationResult.error.format()._errors[0] || 'Validatsiya xatosi',
    };
  }

  const {
    newCadNumber,
    newHouseNumber,
    type,
    streetId,
    mahallaId,
    districtId,
  } = validationResult.data;

  try {
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
          message: 'Yangi kadastr raqami allaqachon mavjud',
        };
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        newCadNumber: newCadNumber,
        newHouseNumber: newHouseNumber,
        type: type,
        streetId: streetId,
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

    return { success: true, data: updatedProperty };
  } catch (error) {
    console.error('Failed to update property:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function createProperty(
  data: PropertySchemaType,
): Promise<ActionResult<PropertyWithRelations>> {
  const validationResult = createPropertySchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
      message:
        validationResult.error.format()._errors[0] || 'Validatsiya xatosi',
    };
  }

  const {
    newCadNumber,
    newHouseNumber,
    type,
    streetId,
    mahallaId,
    districtId,
    geometry,
  } = validationResult.data;

  try {
    if (newCadNumber) {
      const existingNewCad = await prisma.property.findFirst({
        where: {
          newCadNumber,
        },
      });

      if (existingNewCad) {
        return {
          success: false,
          message: 'Yangi kadastr raqami allaqachon mavjud',
        };
      }
    }

    const newProperty = await prisma.property.create({
      data: {
        newCadNumber: newCadNumber,
        newHouseNumber: newHouseNumber,
        type: type,
        isNew: true,
        streetId: streetId,
        mahallaId,
        districtId,
        geometry: geometry,
        isActive: true,
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

    return { success: true, data: newProperty };
  } catch (error) {
    console.error('Failed to create property:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}

export async function deleteProperty(id: string): Promise<ActionResult<null>> {
  try {
    await prisma.property.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true, data: null };
  } catch (error) {
    console.error('Failed to delete property:', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR' };
  }
}
