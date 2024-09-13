import { Map } from "immutable";

import { IDnDPosition } from "@/ui/mixins/dnd";

export interface IProjectsState {
  projectId: string | null;
  projectStatus: boolean | null;
  projects: Map<string, IProject>;
  project: IProject;
  projectsFilter: string;
  mqttInfo?: any;
  lastHeartbeatMessage: number;
  dndActive: boolean;
  documents: [];
}

export interface IProject {
  id: string;
  name: string;
  secret: string;
  created_at: Date;
  lat: number;
  lon: number;
  connectivity: IProjectConnectivity;
  limits: IProjectLimits;
  meta: IProjectMeta;
  owner_id: string;
  stats: IProjectStats;
}

export interface IProjectMeta {
  description: string;
  isDNDActive: boolean;
  isAreasMiniView: boolean;
  imageId?: string;
  location?: any;
  disableDevicesWhenOffline: boolean;
  enableAutomaticReport: boolean;
  roomsPositions: any;
  favoritesDevicesPositions?: Record<string, Array<IDnDPosition>>;
  hardwareId: string;
}

export interface IProjectStats {
  collections: number;
  devices: number;
  errors: number;
  members: number;
  warnings: number;
}

export interface IProjectConnectivity {
  actions: any;
  enabled: boolean;
}

export interface IProjectLimits {
  collections: number;
  devices: number;
  members: number;
}
