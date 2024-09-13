import { Map } from "immutable";

export type DataMappingType = {
  name: string;
  id: string;
};

export type DataMapping = {
  name: string;
  type: string;
  type_id: string;
  mappings: Record<string, string>;
  id: string;
  created_at: string;
  project_id: string;
  complete_mappings: string[];
};

export interface IDataMappingsState {
  dataMappings: Map<string, DataMapping>;
}
