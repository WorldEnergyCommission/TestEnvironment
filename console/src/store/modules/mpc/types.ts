import { Map } from "immutable";

export interface IMPCState {
  mlModelTypes: IMLModelTypes;
  mpcControllers: Map<string, IMLModel>;
  isWeatherServiceActive: boolean;
}

export interface IMLModelTypes {
  [key: string]: IMLModelType;
}

export interface IMLModelType {
  [key: string]: any;
}

export interface IMLModel {
  [key: string]: any;
}
