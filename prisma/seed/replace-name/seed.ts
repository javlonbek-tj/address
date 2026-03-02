import 'dotenv/config';
import { prisma } from '@/server/prisma';
import * as xlsx from 'xlsx';
import path from 'path';

async function main() {
  console.log('Starting street name replacement process...');

  const filePath = path.resolve(process.cwd(), 'streets.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} rows in ${filePath}`);

  let updatedCount = 0;
  let errorCount = 0;

  for (const row of data as any[]) {
    const streetCode = String(row['code']).trim();
    const streetName = String(row['name'] || '').trim();
    const streetType = String(row['type'] || '').trim();

    if (!streetCode) {
      console.warn(`Skipping row due to missing code: ${JSON.stringify(row)}`);
      continue;
    }

    try {
      const result = await prisma.street.updateMany({
        where: { code: streetCode },
        data: {
          name: streetName,
          type: streetType,
        },
      });

      if (result.count > 0) {
        updatedCount += result.count;
        console.log(
          `Updated street ${streetCode}: ${streetName} (${streetType})`,
        );
      } else {
        console.warn(`Street with code ${streetCode} not found in database.`);
      }
    } catch (error) {
      errorCount++;
      console.error(
        `Failed to update street ${streetCode}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(
    `Replacement process finished. Updated: ${updatedCount}, Errors: ${errorCount}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
