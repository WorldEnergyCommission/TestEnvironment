export interface IChartsState {
  chartsTypes: any;
}

export interface FetchChartAggParams {
  variable: string;
  from: number;
  to: number;
  agg: string;
  interval: string;
  miss?: string;
  tz?: string;
}

export type FetchChartAgg = (params: FetchChartAggParams) => Promise<any>;
