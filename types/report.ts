export type DistrictReport = {
  districtId: string;
  districtName: string;
  districtCode: string;
  regionId: string;
  regionName: string;
  totalStreets: number;
  filledCount: number;
  emptyCount: number;
  dailyFilled: number;
  filledPercent: number;
  remainingPercent: number;
};

export type ReportSummary = {
  totalStreets: number;
  filledCount: number;
  emptyCount: number;
  dailyFilled: number;
  filledPercent: number;
};

export type StreetsReportData = {
  districts: DistrictReport[];
  summary: ReportSummary;
};
