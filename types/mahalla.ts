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
  isOptimized: boolean;
  mergedInto: Array<{ code: string; name: string }>;
  mergedMahallas: Array<{ code: string; name: string }>;
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
