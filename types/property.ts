import type { Property as PrismaProperty } from '@/lib/generated/prisma/client';

export type PropertyWithRelations = PrismaProperty & {
  district: {
    id: string;
    name: string;
    region: {
      id: string;
      name: string;
      code: string;
    };
  };
  mahalla: {
    id: string;
    name: string;
    code: string;
  } | null;
  street: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export type Property = {
  id: string;
  cadNumber: string | null;
  newCadNumber: string | null;
  newHouseNumber: string | null;
  type: string | null;
  isNew: boolean;
  district: {
    id: string;
    name: string;
    code: string;
    region: {
      id: string;
      name: string;
      code: string;
    };
  };
  mahalla: {
    id: string;
    name: string;
    code: string;
  } | null;
  street: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export type PropertyTableData = {
  data: Property[];
  total: number;
  page: number;
  limit: number;
};
