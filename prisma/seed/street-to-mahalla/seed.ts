import 'server-only';

import * as xlsx from 'xlsx';
import path from 'path';
import { prisma } from '@/server/prisma';

async function main() {
  console.log('Starting seed process...');

  const filePath = path.resolve(process.cwd(), 'streets.xlsx'); // Excel should be in the root directory
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} rows in ${filePath}`);

  for (const row of data as any[]) {
    const streetCode = String(row['CODE']).trim();
    const mahallaCodesString = String(row['MAHALLAS'] || '').trim();

    if (!streetCode || !mahallaCodesString) {
      console.warn(`Skipping row due to missing data: ${JSON.stringify(row)}`);
      continue;
    }

    const mahallaCodes = mahallaCodesString
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      // Connect specifically targets the mahalla relation
      // Since it's many-to-many, Prisma will handle the join table
      await prisma.street.update({
        where: { code: streetCode },
        data: {
          mahalla: {
            set: mahallaCodes.map((code) => ({ code })),
          },
        },
      });
      console.log(
        `Updated street ${streetCode} with ${mahallaCodes.length} mahallas`,
      );
    } catch (error) {
      console.error(
        `Failed to update street ${streetCode}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log('Seed process finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
