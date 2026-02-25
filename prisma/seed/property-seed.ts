import { prisma } from '@/server/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Seeding Property data...');

  const geojsonPath = path.join(process.cwd(), 'property.geojson');
  if (!fs.existsSync(geojsonPath)) {
    console.error('property.geojson file not found in root directory');
    return;
  }

  const fileContent = fs.readFileSync(geojsonPath, 'utf-8');
  const geojson = JSON.parse(fileContent);

  const features = geojson.features;
  console.log(`Found ${features.length} features in GeoJSON.`);

  // Cache districts to map soato_district to UUID
  const districts = await prisma.district.findMany();
  const districtMap = new Map(districts.map((d) => [d.code, d.id]));

  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const feature of features) {
    const { properties, geometry } = feature;
    const cadNumber = properties.cadastral_number;
    const soatoDistrict = String(properties.soato_district);
    const mahallaCode = String(properties.mahalla_code);

    if (!cadNumber) {
      console.warn('Feature missing cadastral_number. Skipping.');
      skippedCount++;
      continue;
    }

    const districtId = districtMap.get(soatoDistrict);
    if (!districtId) {
      console.warn(
        `District with code ${soatoDistrict} not found for property ${cadNumber}. Skipping.`,
      );
      skippedCount++;
      continue;
    }

    // Calculate center
    let center = null;
    try {
      if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
        const coords = geometry.coordinates[0];
        const latSum = coords.reduce(
          (acc: number, curr: any) => acc + curr[1],
          0,
        );
        const lngSum = coords.reduce(
          (acc: number, curr: any) => acc + curr[0],
          0,
        );
        center = [lngSum / coords.length, latSum / coords.length];
      } else if (geometry.type === 'MultiPolygon') {
        const coords = geometry.coordinates[0][0];
        const latSum = coords.reduce(
          (acc: number, curr: any) => acc + curr[1],
          0,
        );
        const lngSum = coords.reduce(
          (acc: number, curr: any) => acc + curr[0],
          0,
        );
        center = [lngSum / coords.length, latSum / coords.length];
      }
    } catch (e) {
      console.warn(`Could not calculate center for property ${cadNumber}.`);
    }

    try {
      await prisma.property.upsert({
        where: { cadNumber },
        update: {
          geometry: geometry as any,
          center: center as any,
          districtId,
          mahallaId: mahallaCode,
          isActive: true,
        },
        create: {
          cadNumber,
          geometry: geometry as any,
          center: center as any,
          districtId,
          mahallaId: mahallaCode,
          isActive: true,
        },
      });
      createdCount++;
      if (createdCount % 100 === 0) {
        console.log(`Processed ${createdCount} properties...`);
      }
    } catch (error) {
      console.error(`Error processing property ${cadNumber}:`, error);
      errorCount++;
    }
  }

  console.log(`\nSeeding complete.`);
  console.log(`Created/Updated: ${createdCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
