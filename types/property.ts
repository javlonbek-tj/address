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
  cadNumber: string;
  newCadNumber: string | null;
  newHouseNumber: string | null;
  mahallaId: string;
  mahalla: {
    id: string;
    name: string;
    code: string;
  };
  type: string | null;
  streetId: string | null;
  street: {
    id: string;
    name: string;
    code: string;
  } | null;
  districtId: string;
  district: {
    id: string;
    name: string;
    region: {
      id: string;
      name: string;
    };
  };
};
export type Property = {
  id: string;
  cadNumber: string;
  newCadNumber: string | null;
  newHouseNumber: string | null;
  type: string | null;
  district: {
    id: string;
    name: string;
    region: {
      id: string;
      name: string;
    };
  };
  mahalla: {
    id: string;
    name: string;
    code: string;
  };
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
