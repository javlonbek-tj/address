import type { Mahalla as MahallaType } from '@/lib/generated/prisma/client';

export type MahallaWithRelations = MahallaType & {
  district: {
    id: string;
    name: string;
    code: number;
    region: {
      id: string;
      name: string;
      code: number;
    };
  };
  _count: {
    streets: number;
  };
};

export type Mahalla = {
  id: string;
  name: string;
  code: number;
  uzKadName: string;
  geoCode: number;
  oneId: string;
  hidden: boolean;
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
