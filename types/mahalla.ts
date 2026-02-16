import type { Mahalla as MahallaType } from '@/lib/generated/prisma/client';

export type Mahalla = MahallaType & {
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
