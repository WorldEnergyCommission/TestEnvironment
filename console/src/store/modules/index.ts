import { anomalyDetection } from "./anomalyDetection";
import { app } from "./app";
import { charts } from "./charts";
import { dataMappings } from "./dataMappings";
import { devices } from "./devices";
import { events } from "./events";
import { measurements } from "./measurements";
import { members } from "./members";
import { modules } from "./modules";
import { mpc } from "./mpc";
import { navigation } from "./navigation";
import { permissions } from "./permissions";
import { projects } from "./projects";
import { report } from "./report";
import { rooms } from "./rooms";
import { rules } from "@/store/modules/rules";

export default {
  app,
  navigation,
  projects,
  devices,
  rooms,
  measurements,
  charts,
  members,
  anomalyDetection,
  rules,
  mpc,
  report,
  events,
  permissions,
  dataMappings,
  modules,
};
