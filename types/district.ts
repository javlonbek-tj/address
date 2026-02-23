export type District = {
  id: string;
  name: string;
  code: string;
  regionId: string;
};

export type DistrictTableData = {
  data: District[];
  total: number;
  page: number;
  limit: number;
};
