/**
 * Represents a report object for a project.
 */
export interface ProjectReport {
  autarchy?: number;
  live?: LiveData;
  today?: TodayData;
  valid?: boolean;
  week?: WeekData;
}

/**
 * Represents live data for a report.
 */
export interface LiveData {
  battery_soc?: string[];
  grid?: string[];
  pv?: string[];
}

/**
 * Represents today's data for a report.
 */
export interface TodayData {
  co2_saved?: number;
  coal_saved?: number;
  electricity_cost?: number;
  electricity_earnings?: number;
  grid_consumption?: number;
  grid_feed_in?: number;
  pv?: number;
  trees_planted?: number;
}

/**
 * Represents weekly data for a report.
 */
export interface WeekData {
  autarchy?: { [timestamp: string]: number };
  grid_consumption?: { [timestamp: string]: number };
  grid_feed_in?: { [timestamp: string]: number };
  pv?: { [timestamp: string]: number };
}
