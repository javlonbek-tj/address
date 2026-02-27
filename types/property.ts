import type { Property as PrismaProperty } from '@/lib/generated/prisma/client';

export type PropertyWithRelations = PrismaProperty & {
  district?: {
    name: string;
    region?: {
      name: string;
    };
  };
};

export type PropertyForForm = {
  id: string;
  newCadNumber: string | null;
  newHouseNumber: string | null;
  mahallaId: string;
  type: string | null;
  streetId: string | null;
  street?: {
    id: string;
    name: string;
  } | null;
  districtId: string;
};
