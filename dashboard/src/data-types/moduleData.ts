import { Interval } from './interval';

export interface ModuleData {
  pv_aggregated_current_power?: number;
  pv_aggregated_current_power_symbolic?: number;
  pv_aggregated_produced_energy_prediction_next_day?: number;
  pv_aggregated_power?: Interval;
  cs_aggregated_current_connected_cars?: number;
  cs_aggregated_charged_energy?: Interval;
  ws_current_outdoor_temperature?: OutdoorWeather;
  ws_average_room_humidity?: number;
  ws_average_room_temperature?: number;
  rp_live_variables?: {
    battery_soc?: string[];
    grid?: string[];
    pv?: string[];
  };
  report_for_all_projects?: ReportMeasurements;
  report_for_current_project?: ReportMeasurements;
  project_state?: ProjectState;
  otherVars?: { [key: string]: number };
}

export interface OutdoorWeather {
  temperature?: number;
  icon?: string;
}

export interface ReportMeasurements {
  autarchy?: number;
  live?: {
    battery_soc?: number;
    grid?: number;
    pv?: number;
  };
  today?: {
    co2_saved?: number;
    coal_saved?: number;
    electricity_cost?: number;
    electricity_earnings?: number;
    grid_consumption?: number;
    grid_feed_in?: number;
    pv?: number;
    trees_planted?: number;
  };
  valid?: boolean;
  week?: ReportMeasurementsWeek;
}

export interface ReportMeasurementsWeek {
  autarchy?: { [key: string]: number };
  grid_consumption?: { [key: string]: number };
  grid_feed_in?: { [key: string]: number };
  pv?: { [key: string]: number };
}

export interface Project {
  id: string;
  stats: ProjectStats;
}

export interface ProjectStats {
  errors: number;
  warnings: number;
}

export interface ProjectState extends ProjectStats {
  total: number;
  noErrors: number;
}
