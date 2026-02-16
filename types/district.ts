import type { District as DistrictType } from '@/lib/generated/prisma/client';

export type District = DistrictType & {
  region: {
    id: string;
    name: string;
    code: string;
  };
};
