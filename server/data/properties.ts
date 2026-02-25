import { prisma } from '@/server/prisma';

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
