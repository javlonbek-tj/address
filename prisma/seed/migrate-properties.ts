import { PrismaClient } from '../../lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Reading properties.geojson...');
  const geojsonPath = path.join(process.cwd(), 'properties.geojson');
  const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  const features = geojsonData.features;

  console.log(`Found ${features.length} properties. Migrating...`);

  const districts = await prisma.district.findMany({
    select: { id: true, code: true },
  });
  const districtMap = new Map(districts.map((d) => [d.code, d.id]));

  const mahallas = await prisma.mahalla.findMany({
    select: { id: true, code: true },
  });
  const mahallaMap = new Map(mahallas.map((m) => [m.code, m.id]));

  let count = 0;
  let skipped = 0;

  for (const feature of features) {
    const props = feature.properties;
    const geometry = feature.geometry;

    const districtCode = String(props.DISTRICT_CODE || '');
    const mahallaCode = String(props.MAHALLA_CODE || '');

    if (!districtCode) {
      console.warn(`Missing DISTRICT_CODE for property ${props.KAD_RAQAM}. Skipping...`);
      skipped++;
      continue;
    }

    const districtId = districtMap.get(districtCode);
    if (!districtId) {
      console.warn(`District "${districtCode}" not found for property ${props.KAD_RAQAM}. Skipping...`);
      skipped++;
      continue;
    }

    const mahallaId = mahallaCode ? mahallaMap.get(mahallaCode) : undefined;
    if (mahallaCode && !mahallaId) {
      console.warn(`Mahalla "${mahallaCode}" not found for property ${props.KAD_RAQAM}. Using null.`);
    }

    try {
      const data = {
        oldHouseNumber: String(props.UY_RAQAM || ''),
        oldStreetName: String(props.KOCHA || ''),
        oldMahallaName: String(props.MFY || ''),
        type: String(props.Turi || 'residential').toLowerCase(),
        geometry: geometry as any,
        districtId,
        isActive: true,
        isNew: false,
        ...(mahallaId ? { mahallaId } : {}),
      };

      if (props.KAD_RAQAM) {
        await prisma.property.upsert({
          where: { cadNumber: props.KAD_RAQAM },
          update: data,
          create: { ...data, cadNumber: props.KAD_RAQAM },
        });
      } else {
        await prisma.property.create({
          data: { ...data, cadNumber: null },
        });
      }
      count++;
      if (count % 100 === 0) console.log(`Migrated ${count} properties...`);
    } catch (error) {
      console.error(`Failed to migrate property ${props.KAD_RAQAM}:`, error);
    }
  }

  console.log(
    `Migration completed! ${count} created/updated, ${skipped} skipped.`,
  );
  await prisma.$disconnect();
}

main().catch(console.error);
