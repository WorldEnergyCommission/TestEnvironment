export interface BakingMonitorReport {
  // timestamp of the report
  ts: number;
  // initial baking start
  first_load_start: number;
  // baking after the defined time
  load_after_baking_window: boolean;
  // baking on time
  load_in_baking_window: boolean;
  // baking before the defined time
  load_before_baking_window: boolean;
  // start baking 1 hour or less before closing
  load_operating_buffer_end: boolean;
  // start baking 1 hour or less before opening
  load_operating_buffer_start: boolean;
  // start baking 1 hour or more before opening
  load_baking_window_before_buffer_start: boolean;
  // start baking 1 hour or less before closing
  load_start_operating_buffer_end: boolean;
}

// Defines the baking monitor report as a datatable item
export interface BakingMonitorReportItem {
  date: string;
  // baking during defined time
  withinBakingWindow: string;
  // timestamp of the first baking start
  firstBakingStart: string;
  // start baking 1 hour or less before opening
  beforeOpening: string;
  // start baking 1 hour or less before closing
  beforeClosing: string;
  ts: number;
}

// Header for the vuetify data table
export interface DataTableHeader {
  title: string;
  key: string;
  value?: any;
}
