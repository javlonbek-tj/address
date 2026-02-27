import { prisma } from '@/server/prisma';
import { PropertyForForm } from '@/types';

export async function getPropertiesByMahallaCode(mahallaCode: string) {
  return await prisma.property.findMany({
    where: {
      mahallaId: mahallaCode,
      isActive: true,
    },
    select: {
      id: true,
      cadNumber: true,
      newCadNumber: true,
      type: true,
      geometry: true,
      center: true,
      streetId: true,
      districtId: true,
      mahallaId: true,
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
}

export async function getPropertyById(
  id: string,
): Promise<PropertyForForm | null> {
  return await prisma.property.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      newCadNumber: true,
      newHouseNumber: true,
      mahallaId: true,
      type: true,
      streetId: true,
      street: {
        select: {
          id: true,
          name: true,
        },
      },
      districtId: true,
    },
  });
}
