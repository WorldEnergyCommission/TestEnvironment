import { Chart } from "highcharts";
import moment from "moment";

import { ChartData } from "./types";

declare class LynusChart {
  chart: Chart;
  period: any;
  countLines: number;
  countColumns: number;
  stackingOptions: string;
  calendarUsed: boolean;
  isDarkTheme: boolean;
  backgroundColor: string;
  start: number;
  startTimestamp: number;
  end: number;
  endTimestamp: number;
  endChart: number;
  timezoneAbbreviation: string;
  isPreview: boolean;

  constructor(
    device: ChartData,
    projectId: string,
    baseURL: string,
    isDarkTheme: boolean,
    chartStart: number,
    initialBackgroundColor: string,
    stackingOP: any,
    periodConfigs?: any, // optional, defaults to periodConfigurations of ChartUtils.js
    chartColors?: string[], // optional, defaults to color list of LynusChart.js
    timezoneAbbreviation?: string, // optional, defaults to "UTC"
    isPreview?: boolean,
  );

  switchPeriod(period: any): void;

  switchPeriodAndLoad(period: any, authToken: string): void;

  calculateBounds(startMoment: moment.Moment): any;

  loadCalendarRange(startMoment: moment.Moment, authToken: string): Promise<any>;

  liveUpdateAllVariables(values: number[]): void;

  buildChart(container: HTMLElement): void;

  setLocale(locale: string): void;

  setIsDarkTheme(isDarkTheme: boolean): void;

  setDevice(device: ChartData): void;

  setChartColors(chartColors: string[]): void;

  onThemeChange(backgroundColor: string): void;

  onFullScreenChange(): void;

  updateColumnLineCounts(): void;

  updateTheme(): void;

  handleFullScreen(): void;

  setWidth(width: number): void;

  setChartColors(colors: string[]): void;

  showLoading(): void;

  toggleStacking(): void;

  loadChart(authToken: string): Promise<any>;

  loadFromAPI(
    baseURL: string,
    projectId: string,
    variable: string,
    agg: string,
    miss: string,
    authToken: string,
  ): Promise<any>;

  loadData(baseURL: string, authToken: string): Promise<any>;

  load(loadedData: any): Promise<void>;

  drawThreshold(value: number): void;

  getChartStartAndEndTimestamps(): number[];

  formatUnixTimestamp(format: string, timestamp: number): string;

  destroy(): void;
}

export default LynusChart;
