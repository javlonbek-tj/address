import { prisma } from '../prisma';
import type { DistrictReport, StreetsReportData } from '@/types';

interface RawRow {
  districtId: string;
  districtName: string;
  districtCode: string;
  regionId: string;
  regionName: string;
  totalStreets: bigint;
  filledCount: bigint;
  emptyCount: bigint;
  dailyFilled: bigint;
}

function toNumber(v: bigint | number) {
  return typeof v === 'bigint' ? Number(v) : v;
}

interface ReportParams {
  regionId?: string;
  districtId?: string;
}

export async function getStreetsReport({
  regionId,
  districtId,
}: ReportParams = {}): Promise<StreetsReportData> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let rows: RawRow[];

  if (districtId) {
    rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        d.id            AS "districtId",
        d.name          AS "districtName",
        d.code          AS "districtCode",
        r.id            AS "regionId",
        r.name          AS "regionName",
        COUNT(s.id)::bigint                                                           AS "totalStreets",
        COUNT(CASE WHEN s."uzKadCode" IS NOT NULL THEN 1 END)::bigint                 AS "filledCount",
        COUNT(CASE WHEN s."uzKadCode" IS NULL     THEN 1 END)::bigint                 AS "emptyCount",
        COUNT(CASE WHEN s."uzKadUpdatedAt" >= ${todayStart} THEN 1 END)::bigint       AS "dailyFilled"
      FROM districts d
      JOIN regions r ON d."regionId" = r.id
      LEFT JOIN streets s ON s."districtId" = d.id AND s."isActive" = true
      WHERE d."isActive" = true AND d.id = ${districtId}
      GROUP BY d.id, d.name, d.code, r.id, r.name
      ORDER BY r.name, d.name
    `;
  } else if (regionId) {
    rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        d.id            AS "districtId",
        d.name          AS "districtName",
        d.code          AS "districtCode",
        r.id            AS "regionId",
        r.name          AS "regionName",
        COUNT(s.id)::bigint                                                           AS "totalStreets",
        COUNT(CASE WHEN s."uzKadCode" IS NOT NULL THEN 1 END)::bigint                 AS "filledCount",
        COUNT(CASE WHEN s."uzKadCode" IS NULL     THEN 1 END)::bigint                 AS "emptyCount",
        COUNT(CASE WHEN s."uzKadUpdatedAt" >= ${todayStart} THEN 1 END)::bigint       AS "dailyFilled"
      FROM districts d
      JOIN regions r ON d."regionId" = r.id
      LEFT JOIN streets s ON s."districtId" = d.id AND s."isActive" = true
      WHERE d."isActive" = true AND d."regionId" = ${regionId}
      GROUP BY d.id, d.name, d.code, r.id, r.name
      ORDER BY r.name, d.name
    `;
  } else {
    rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        d.id            AS "districtId",
        d.name          AS "districtName",
        d.code          AS "districtCode",
        r.id            AS "regionId",
        r.name          AS "regionName",
        COUNT(s.id)::bigint                                                           AS "totalStreets",
        COUNT(CASE WHEN s."uzKadCode" IS NOT NULL THEN 1 END)::bigint                 AS "filledCount",
        COUNT(CASE WHEN s."uzKadCode" IS NULL     THEN 1 END)::bigint                 AS "emptyCount",
        COUNT(CASE WHEN s."uzKadUpdatedAt" >= ${todayStart} THEN 1 END)::bigint       AS "dailyFilled"
      FROM districts d
      JOIN regions r ON d."regionId" = r.id
      LEFT JOIN streets s ON s."districtId" = d.id AND s."isActive" = true
      WHERE d."isActive" = true
      GROUP BY d.id, d.name, d.code, r.id, r.name
      ORDER BY r.name, d.name
    `;
  }

  const districts: DistrictReport[] = rows.map((row) => {
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
      dailyFilled: toNumber(row.dailyFilled),
      filledPercent: total > 0 ? Math.round((filled / total) * 100) : 0,
      remainingPercent: total > 0 ? Math.round((empty / total) * 100) : 0,
    };
  });

  const summary = districts.reduce(
    (acc, d) => ({
      totalStreets: acc.totalStreets + d.totalStreets,
      filledCount: acc.filledCount + d.filledCount,
      emptyCount: acc.emptyCount + d.emptyCount,
      dailyFilled: acc.dailyFilled + d.dailyFilled,
      filledPercent: 0,
    }),
    { totalStreets: 0, filledCount: 0, emptyCount: 0, dailyFilled: 0, filledPercent: 0 },
  );

  summary.filledPercent =
    summary.totalStreets > 0
      ? Math.round((summary.filledCount / summary.totalStreets) * 100)
      : 0;

  return { districts, summary };
}
