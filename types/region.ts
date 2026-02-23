export type Region = {
  id: string;
  name: string;
  code: string;
};

export type RegionTableData = {
  data: Region[];
  total: number;
  page: number;
  limit: number;
};
