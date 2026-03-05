import 'server-only';

import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as {
  prismaInstance: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prismaInstance ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prismaInstance = prisma;
