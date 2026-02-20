import type { Street as StreetType } from '@/lib/generated/prisma/client';

export type StreetWithMetadata = StreetType & {
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
  metadata?: {
    length: number;
    bearing: number;
    startPoint: { lat: number; lng: number };
    endPoint: { lat: number; lng: number };
  };
};

export type Street = {
  id: string;
  name: string;
  code: string;
  uzKadCode: string;
  type: string;
  oldName: string | null;
  district: {
    name: string;
    region: {
      name: string;
    };
  };
  mahalla: {
    name: string;
  };
};
