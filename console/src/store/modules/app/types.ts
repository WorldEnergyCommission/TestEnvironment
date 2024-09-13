import { IPermission } from "../permissions/types";

export interface IAppState {
  reportBox: IReportBox;
  weatherData: any;
  weatherForecastData: any;
  user: IUser;
  workbenchCurrentTab: null | number;
  shouldForward: boolean;
  auth: IAuth;
}

export interface IReportBox {
  message: string;
  type: string;
  value: boolean;
}

export interface IUser {
  email: string;
  id: string;
  first_name: string;
  last_name: string;
}

export interface IAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}
