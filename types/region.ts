import type { Geometry } from 'geojson';

export type Region = {
  id: string;
  name: string;
  code: string;
  geometry?: Geometry;
};

export type RegionTableData = {
  data: Region[];
  total: number;
  page: number;
  limit: number;
};
