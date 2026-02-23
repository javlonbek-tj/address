import type { Mahalla as MahallaType } from '@/lib/generated/prisma/client';

export type MahallaWithRelations = MahallaType & {
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
  _count: {
    streets: number;
  };
};

export type Mahalla = {
  id: string;
  name: string;
  code: string;
  uzKadName: string;
  geoCode: string;
  oneId: string;
  hidden: boolean;
  mergedIntoId: string | null;
  mergedIntoName: string | null;
  oldName: string | null;
  regulation: string | null;
  regulationUrl: string | null;
  district: {
    id: string;
    name: string;
    region: {
      id: string;
      name: string;
    };
  };
};

export type MahallaTableData = {
  data: Mahalla[];
  total: number;
  page: number;
  limit: number;
};
