import { Map } from "immutable";

export type ModuleProperty = {
  data_mapping_id: string;
  data_mapping_name: string;
  data_mapping_type_id?: string;
  name?: string;
  id?: string;
  mappings?: Record<string, string>;
};
export type ModuleType = {
  name: string;
  type: string;
  type_id: string;
  id: string;
  created_at: string;
  project_id: string;
  collection_id: string;
  properties: ModuleProperty[];
};

export interface IModulesState {
  modulesWithMappings: Map<string, ModuleType>;
}
