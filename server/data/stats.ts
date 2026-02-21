import 'server-only';
import { prisma } from '../prisma';

export async function getGlobalStatistics() {
  try {
    const [regions, districts, mahallas, streets] = await Promise.all([
      prisma.region.count({ where: { isActive: true } }),
      prisma.district.count({ where: { isActive: true } }),
      prisma.mahalla.count({ where: { isActive: true } }),
      prisma.street.count({ where: { isActive: true } }),
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
      prisma.district.count({ where: { regionId, isActive: true } }),
      prisma.mahalla.count({
        where: { district: { regionId, isActive: true } },
      }),
      prisma.street.count({
        where: { district: { regionId, isActive: true } },
      }),
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
      prisma.mahalla.count({ where: { districtId, isActive: true } }),
      prisma.street.count({ where: { districtId, isActive: true } }),
    ]);

    return { mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch district statistics:', error);
    return { mahallas: 0, streets: 0 };
  }
}

export async function getDashboardAnalytics() {
  try {
    const [
      totalRegions,
      totalDistricts,
      totalMahallas,
      totalStreets,
      streetsByType,
      hiddenMahallas,
    ] = await Promise.all([
      prisma.region.count({ where: { isActive: true } }),
      prisma.district.count({ where: { isActive: true } }),
      prisma.mahalla.count({ where: { isActive: true } }),
      prisma.street.count({ where: { isActive: true } }),
      prisma.street.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
      }),
      prisma.mahalla.count({
        where: {
          hidden: true,
        },
      }),
    ]);

    const regionsWithCounts = await prisma.region.findMany({
      where: { isActive: true },
      select: {
        name: true,
        districts: {
          select: {
            _count: {
              select: { mahallas: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const regionStats = regionsWithCounts.map((region) => ({
      name: region.name,
      mahallas: region.districts.reduce(
        (acc, district) => acc + district._count.mahallas,
        0,
      ),
    }));

    return {
      counts: {
        regions: totalRegions,
        districts: totalDistricts,
        mahallas: totalMahallas,
        streets: totalStreets,
        properties: 148882,
      },
      charts: {
        regions: regionStats,
        streetTypes: streetsByType.map((s) => ({
          name: s.type || 'Aniqlanmagan',
          value: s._count.id,
        })),
        dataHealth: {
          hiddenMahallas,
          totalMahallas,
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch dashboard analytics:', error);
    return null;
  }
}
