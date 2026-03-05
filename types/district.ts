import type { Geometry } from 'geojson';

export type District = {
  id: string;
  name: string;
  code: string;
  regionId: string;
  geometry?: Geometry;
};

export type DistrictTableData = {
  data: District[];
  total: number;
  page: number;
  limit: number;
};
