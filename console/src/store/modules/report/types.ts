export interface IReportState {
  reportList: IReport[];
}

export interface IReport {
  // all Report Types
  id: string;
  created_at: string;
  type: string;
  timezone: string;
  name?: string;
  currency?: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  variables?: any[];
  actions?: any[];
  meta: {
    zev: {
      arrayDaySettingsInternal: any[];
      arrayDaySettingsExternal: any[];
      groupingSelected: boolean;
      innosolv: {
        username: string;
      };
      titles: {
        grid: string;
        photovoltaik: string;
      };
      consumers?: any[];
      producers?: {
        internal: any[];
        external: any[];
      };
      tariffs: {
        internal: {
          time: any[];
          low: string | number;
          high: string | number;
        };
        external: {
          time: any[];
          low: string | number;
          high: string | number;
        };
      };
    };
  };
}
