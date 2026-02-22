export type Region = {
  id: string;
  name: string;
  code: number;
};

export type RegionTableData = {
  data: Region[];
  total: number;
  page: number;
  limit: number;
};
