import type { Property as PrismaProperty } from '@/lib/generated/prisma/client';

export type PropertyWithRelations = PrismaProperty & {
  district?: {
    name: string;
    region?: {
      name: string;
    };
  };
};
