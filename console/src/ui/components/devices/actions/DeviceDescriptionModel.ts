export interface DeviceDescription {
  title: string;
  name: string;
  overview: string;
  table: DeviceDescriptionTable[];
}

export interface DeviceDescriptionTable {
  name: string;
  description: string;
  allowedValues: string;
}
