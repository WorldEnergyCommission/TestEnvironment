import { Map } from "immutable";

export type IMeasurementGetter = (variable: string) => string | number;

export interface IVariablesState {
  measurements: Map<string, string | number>;
  measurement: IMeasurementGetter;
  measurementsKeys: string[];
  measurementsFilter: string;
}
