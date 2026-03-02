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
  }[];
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
  uzKadCode: string | null;
  type: string;
  oldName: string | null;
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
  }[];
};

export type StreetTableData = {
  data: Street[];
  total: number;
  page: number;
  limit: number;
};
