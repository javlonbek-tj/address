export type RegionReport = {
  regionId: string;
  regionName: string;
  totalStreets: number;
  filledCount: number;
  emptyCount: number;
  dailyFilled: number;
  weeklyFilled: number;
  monthlyFilled: number;
  filledPercent: number;
  remainingPercent: number;
};

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
  weeklyFilled: number;
  monthlyFilled: number;
  filledPercent: number;
  remainingPercent: number;
};

export type ReportSummary = {
  totalStreets: number;
  filledCount: number;
  emptyCount: number;
  dailyFilled: number;
  weeklyFilled: number;
  monthlyFilled: number;
  filledPercent: number;
};

export type StreetsReportData = {
  mode: 'regions' | 'districts';
  regions: RegionReport[];
  districts: DistrictReport[];
  summary: ReportSummary;
};
