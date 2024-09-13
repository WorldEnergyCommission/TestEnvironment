export type ChartAggregations =
  | "avg"
  | "count"
  | "max"
  | "min"
  | "range"
  | "sum"
  | "first"
  | "last"
  | "stddev"
  | "var"
  | "diff"
  | "derivate";

export type ChartType = "line" | "column" | "area" | "spline" | "diff";

export type ChartMissingValueStrategy = "none" | "locf"; // last observation carried forward

export interface ChartOption {
  seriesType?: "View" | "Calculation" | "Threshold" | "AnomalyScore";
  agg?: ChartAggregations;
  var?: string;
  calculation?: {
    expression: string;
    aggregations: string[];
  };
  type: ChartType;
  unit: string;
  name: string;
  miss?: string; // TODO: add types
  scaling?: { max: number | undefined; min: number | undefined }; // only optional for single charts (not for series)
}

export interface ChartData {
  collection_id: string;
  created_at: string;
  favorite: boolean;
  data: {
    // new chart mappings + options all at once
    chartOptions: ChartOption[];
    // old property, kept for backwards compatibility
    mappings: {
      [key: string]: string;
    };
    // old property, kept for backwards compatibility
    options: {
      [key: string]: {
        agg: ChartAggregations;
        name: string;
        scaling: {
          max: number | undefined;
          min: number | undefined;
        };
        type: ChartType;
        unit: string;
      };
    };
    type: "chart";
    periodName: "live" | "hour" | "day" | "week" | "month" | "year" | "forecast6h" | "forecast24h";
    interval: "1s" | "15s" | "1m" | "15m" | "1h" | "1d" | "1w";
    selectedStackingOptions: any;
    selectedWidth: any;
  };
  id: string;
  name: string;
}
