import * as XLSX from 'xlsx';
import path from 'path';
import { prisma } from '@/server/prisma';
import {
  RegionUserPosition,
  UserRole,
  UserStatus,
} from '@/lib/generated/prisma/enums';

async function main() {
  const filePath = path.resolve(process.cwd(), 'exported_users.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  console.log(`Found ${data.length} users in Excel file.`);

  for (const row of data) {
    const {
      fullName,
      phoneNumber,
      status,
      position,
      district_code,
      region_code,
    } = row;

    if (!fullName || !phoneNumber) {
      console.warn(
        `Skipping row with missing fullName or phoneNumber: ${JSON.stringify(row)}`,
      );
      continue;
    }

    let role: UserRole = 'district_user';
    let regionId: string | null = null;
    let districtId: string | null = null;

    // Resolve Region
    if (region_code) {
      const region = await prisma.region.findUnique({
        where: { code: String(region_code) },
      });
      if (region) {
        regionId = region.id;
      } else {
        console.warn(
          `Region with code ${region_code} not found for user ${fullName}`,
        );
      }
    }

    // Resolve District
    if (district_code) {
      const district = await prisma.district.findUnique({
        where: { code: String(district_code) },
      });
      if (district) {
        districtId = district.id;
        role = 'district_user';
      } else {
        console.warn(
          `District with code ${district_code} not found for user ${fullName}`,
        );
      }
    } else if (regionId) {
      role = 'region_user';
    }

    const userStatus: UserStatus =
      status === 'inactive' ? 'inactive' : 'active';
    const userPosition: RegionUserPosition | null =
      position === 'boss'
        ? 'boss'
        : position === 'assistant'
          ? 'assistant'
          : null;

    try {
      const existingUser = await prisma.user.findFirst({
        where: { phoneNumber: String(phoneNumber) },
      });

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullName,
            status: userStatus,
            role,
            position: userPosition,
            regionId,
            districtId,
            isActive: true,
          },
        });
        console.log(`Updated user: ${fullName}`);
      } else {
        await prisma.user.create({
          data: {
            fullName,
            phoneNumber: String(phoneNumber),
            status: userStatus,
            role,
            position: userPosition,
            regionId,
            districtId,
            isActive: true,
          },
        });
        console.log(`Created user: ${fullName}`);
      }
    } catch (error) {
      console.error(`Error processing user ${fullName}:`, error);
    }
  }

  console.log('User seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
