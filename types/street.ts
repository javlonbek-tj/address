import type { Street as StreetType } from '@/lib/generated/prisma/client';

export type Street = StreetType & {
  district: {
    id: string;
    name: string;
    code: string;
  };
  mahalla: {
    id: string;
    name: string;
    code: string;
  };
};
