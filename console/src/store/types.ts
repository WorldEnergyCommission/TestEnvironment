import { IChartsState } from "./modules/charts/types";
import { IDataMappingsState } from "./modules/dataMappings/types";
import { IModulesState } from "./modules/modules/types";
import { IReportState } from "./modules/report/types";
import { IAnomalyDetectionState } from "@/store/modules/anomalyDetection/types";
import { IAppState } from "@/store/modules/app/types";
import { IDevicesState } from "@/store/modules/devices/types";
import { IEventState } from "@/store/modules/events/types";
import { IVariablesState } from "@/store/modules/measurements/types";
import { IMemberState } from "@/store/modules/members/types";
import { IMPCState } from "@/store/modules/mpc/types";
import { INavigationState } from "@/store/modules/navigation/types";
import { IPermissionState } from "@/store/modules/permissions/types";
import { IProjectsState } from "@/store/modules/projects/types";
import { IRoomsState } from "@/store/modules/rooms/types";
import { IRulesState } from "@/store/modules/rules/types";

export interface RootState {
  app: IAppState;
  navigation: INavigationState;
  projects: IProjectsState;
  measurements: IVariablesState;
  rooms: IRoomsState;
  devices: IDevicesState;
  members: IMemberState;
  mpc: IMPCState;
  rules: IRulesState;
  events: IEventState;
  anomalyDetection: IAnomalyDetectionState;
  permissions: IPermissionState;
  report: IReportState;
  charts: IChartsState;
  dataMappings: IDataMappingsState;
  modules: IModulesState;
}
