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
  district: {
    name: string;
    region: {
      name: string;
    };
  };
};
