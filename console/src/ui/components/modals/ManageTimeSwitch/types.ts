export interface ITime {
  hours: number;
  minutes: number;
  /** tz time zone name e.g. Europe/Berlin */
  timezone: string;
}

export interface IScheduleItem {
  time: ITime;
  action: 1 | 0;
  /** 0 = Sunday, 1 = Monday,.. */
  activeDays: boolean[];
  index?: number;
}

export type Schedule = IScheduleItem[];

export interface ITimeSwitchSettings {
  schedule: Schedule;
  /** Activates the backend switching of values according to the schedule. */
  isActive: boolean;
}
