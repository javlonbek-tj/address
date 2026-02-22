export type District = {
  id: string;
  name: string;
  code: number;
  regionId: string;
};

export type DistrictTableData = {
  data: District[];
  total: number;
  page: number;
  limit: number;
};
