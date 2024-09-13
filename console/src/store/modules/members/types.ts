import { Map } from "immutable";

import { IPermission } from "../permissions/types";

export interface IMember {
  id: string;
  email: string;
  admin: boolean;
  first_name: string;
  last_name: string;
  owner: boolean;
  role: string;
  permissions: IPermission[];
}
export interface IMemberState {
  members: Map<string, IMember>;
  currentMember: null | IMember;
}
