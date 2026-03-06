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

  // Cache districts to avoid repeated queries
  const districts = await prisma.district.findMany({
    select: { id: true, code: true },
  });
  const districtMap = new Map(districts.map((d) => [d.code, d.id]));

  let count = 0;
  let skipped = 0;

  for (const feature of features) {
    const props = feature.properties;
    const geometry = feature.geometry;

    const districtCode = '1727424'; // YOU SHOULD CHANGE THIS IN EVERY RUN
    const districtId = districtMap.get(districtCode);

    if (!districtId) {
      console.warn(
        `District with code ${districtCode} not found for property ${props.KAD_RAQAM}. Skipping...`,
      );
      skipped++;
      continue;
    }

    try {
      const data = {
        oldHouseNumber: String(props.UY_RAQAM || ''),
        oldStreetName: String(props.KOCHA || ''),
        oldMahallaName: String(props.MFY || ''),
        type: String(props.Turi || 'residential').toLowerCase(),
        geometry: geometry as any,
        districtId: districtId,
        isActive: true,
        isNew: false,
        mahallaId: '1727424017', // YOU SHOULD CHANGE THIS IN EVERY RUN
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
