import { Map } from "immutable";

export interface IPermission {
  id: string;
  description: string;
  scope: string;
  scope_id: string;
  group: string;
  scope_reference: string;
  without_scope: boolean;
  dependent_on: string[];
}

export interface IPossiblePermissionScope {
  id: string;
  name: string;
}

export interface IPermissionState {
  permissions: Map<string, IPermission>;
  memberPermission: Map<string, IPermission[]>;
  groups: string[];
  possiblePermisssions: IPossiblePermissionScope[];
  // Platform permissions
  platformPermissions?: IPermission[];
}
