import { prisma } from '../prisma';
import type { DistrictReport, RegionReport, StreetsReportData } from '@/types';

function toNumber(v: bigint | number) {
  return typeof v === 'bigint' ? Number(v) : v;
}

interface RawDistrictRow {
  districtId: string;
  districtName: string;
  districtCode: string;
  regionId: string;
  regionName: string;
  totalStreets: bigint;
  filledCount: bigint;
  emptyCount: bigint;
}

interface RawRegionRow {
  regionId: string;
  regionName: string;
  totalStreets: bigint;
  filledCount: bigint;
  emptyCount: bigint;
}

interface ReportParams {
  regionId?: string;
  districtId?: string;
}

function buildSummary(items: (RegionReport | DistrictReport)[]) {
  const s = items.reduce(
    (acc, d) => ({
      totalStreets: acc.totalStreets + d.totalStreets,
      filledCount: acc.filledCount + d.filledCount,
      emptyCount: acc.emptyCount + d.emptyCount,
      filledPercent: 0,
    }),
    { totalStreets: 0, filledCount: 0, emptyCount: 0, filledPercent: 0 },
  );
  s.filledPercent = s.totalStreets > 0 ? Math.round((s.filledCount / s.totalStreets) * 100) : 0;
  return s;
}

function toDistrictReports(rows: RawDistrictRow[]): DistrictReport[] {
  return rows.map((row) => {
    const total = toNumber(row.totalStreets);
    const filled = toNumber(row.filledCount);
    const empty = toNumber(row.emptyCount);
    return {
      districtId: row.districtId,
      districtName: row.districtName,
      districtCode: row.districtCode,
      regionId: row.regionId,
      regionName: row.regionName,
      totalStreets: total,
      filledCount: filled,
      emptyCount: empty,
      filledPercent: total > 0 ? Math.round((filled / total) * 100) : 0,
      remainingPercent: total > 0 ? Math.round((empty / total) * 100) : 0,
    };
  });
}

function toRegionReports(rows: RawRegionRow[]): RegionReport[] {
  return rows.map((row) => {
    const total = toNumber(row.totalStreets);
    const filled = toNumber(row.filledCount);
    const empty = toNumber(row.emptyCount);
    return {
      regionId: row.regionId,
      regionName: row.regionName,
      totalStreets: total,
      filledCount: filled,
      emptyCount: empty,
      filledPercent: total > 0 ? Math.round((filled / total) * 100) : 0,
      remainingPercent: total > 0 ? Math.round((empty / total) * 100) : 0,
    };
  });
}

export async function getStreetsReport({ regionId, districtId }: ReportParams = {}): Promise<StreetsReportData> {
  if (districtId) {
    const rows = await prisma.$queryRaw<RawDistrictRow[]>`
      SELECT
        d.id AS "districtId", d.name AS "districtName", d.code AS "districtCode",
        r.id AS "regionId",   r.name AS "regionName",
        COUNT(s.id)::bigint AS "totalStreets",
        COUNT(CASE WHEN s."uzKadCode" IS NOT NULL THEN 1 END)::bigint AS "filledCount",
        COUNT(CASE WHEN s."uzKadCode" IS NULL     THEN 1 END)::bigint AS "emptyCount"
      FROM districts d
      JOIN regions r ON d."regionId" = r.id
      LEFT JOIN streets s ON s."districtId" = d.id AND s."isActive" = true
      WHERE d."isActive" = true AND d.id = ${districtId}
      GROUP BY d.id, d.name, d.code, r.id, r.name
    `;
    const districts = toDistrictReports(rows);
    return { mode: 'districts', regions: [], districts, summary: buildSummary(districts) };
  }

  if (regionId) {
    const rows = await prisma.$queryRaw<RawDistrictRow[]>`
      SELECT
        d.id AS "districtId", d.name AS "districtName", d.code AS "districtCode",
        r.id AS "regionId",   r.name AS "regionName",
        COUNT(s.id)::bigint AS "totalStreets",
        COUNT(CASE WHEN s."uzKadCode" IS NOT NULL THEN 1 END)::bigint AS "filledCount",
        COUNT(CASE WHEN s."uzKadCode" IS NULL     THEN 1 END)::bigint AS "emptyCount"
      FROM districts d
      JOIN regions r ON d."regionId" = r.id
      LEFT JOIN streets s ON s."districtId" = d.id AND s."isActive" = true
      WHERE d."isActive" = true AND d."regionId" = ${regionId}
      GROUP BY d.id, d.name, d.code, r.id, r.name
      ORDER BY d.name
    `;
    const districts = toDistrictReports(rows);
    return { mode: 'districts', regions: [], districts, summary: buildSummary(districts) };
  }

  const rows = await prisma.$queryRaw<RawRegionRow[]>`
    SELECT
      r.id AS "regionId", r.name AS "regionName",
      COUNT(s.id)::bigint AS "totalStreets",
      COUNT(CASE WHEN s."uzKadCode" IS NOT NULL THEN 1 END)::bigint AS "filledCount",
      COUNT(CASE WHEN s."uzKadCode" IS NULL     THEN 1 END)::bigint AS "emptyCount"
    FROM regions r
    LEFT JOIN districts d ON d."regionId" = r.id AND d."isActive" = true
    LEFT JOIN streets s ON s."districtId" = d.id AND s."isActive" = true
    WHERE r."isActive" = true
    GROUP BY r.id, r.name
    ORDER BY r.name
  `;
  const regions = toRegionReports(rows);
  return { mode: 'regions', regions, districts: [], summary: buildSummary(regions) };
}
