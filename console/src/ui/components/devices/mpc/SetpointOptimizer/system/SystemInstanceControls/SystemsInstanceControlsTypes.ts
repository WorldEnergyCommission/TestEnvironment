export interface SystemsInstanceControls {
  name: string;
  type: string;
  status: string;
  timezone: string;
  y1_y2_diff: number;
  on_off_state: string;
  weekly_schedule: any;
  room_temperatures: any;
  flow_temperature: string;
  return_temperature: string;
  max_flow_temperature: number;
  min_flow_temperature: number;
  set_point_temperature: number;
  weekly_schedule_active: boolean;
  out_in_flow_temperature: string;
  in_out_flow_temperature: string;
  advanced_curve_settings: boolean;
  optimized_flow_temperature: string;
  x_range: SystemsInstanceControlsRangeX;
  y1_y_range: SystemsInstanceControlsRangeY;
  y2_y_range: SystemsInstanceControlsRangeY;
}

export interface SystemsInstanceControlsRangeY {
  lower: number;
  upper: number;
}

export interface SystemsInstanceControlsRangeX {
  left: number;
  right: number;
}
