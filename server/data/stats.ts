import 'server-only';
import { prisma } from '../prisma';

export async function getGlobalStatistics() {
  try {
    const [regions, districts, mahallas, streets] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.mahalla.count(),
      prisma.street.count(),
    ]);

    return { regions, districts, mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch global statistics:', error);
    return { regions: 0, districts: 0, mahallas: 0, streets: 0 };
  }
}

export async function getRegionStatistics(regionId: string) {
  if (!regionId) return null;
  try {
    const [districts, mahallas, streets] = await Promise.all([
      prisma.district.count({ where: { regionId } }),
      prisma.mahalla.count({ where: { district: { regionId } } }),
      prisma.street.count({ where: { district: { regionId } } }),
    ]);

    return { districts, mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch region statistics:', error);
    return { districts: 0, mahallas: 0, streets: 0 };
  }
}

export async function getDistrictStatistics(districtId: string) {
  if (!districtId) return null;
  try {
    const [mahallas, streets] = await Promise.all([
      prisma.mahalla.count({ where: { districtId } }),
      prisma.street.count({ where: { districtId } }),
    ]);

    return { mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch district statistics:', error);
    return { mahallas: 0, streets: 0 };
  }
}
