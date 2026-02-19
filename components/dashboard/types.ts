export interface ChartData {
  name: string;
  value: number;
  id?: string;
  [key: string]: any;
}

export interface AnalyticsChartsProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'pie';
  onItemClick?: (id: string) => void;
  colors: string[];
}
