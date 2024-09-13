import moment from "moment";

import { ITime } from "@/store/modules/rules/types";

export const weekdayToIndex = (day: string) => {
  switch (day.toLowerCase()) {
    case "monday":
      return 1;
    case "tuesday":
      return 2;
    case "wednesday":
      return 3;
    case "thursday":
      return 4;
    case "friday":
      return 5;
    case "saturday":
      return 6;
    case "sunday":
      return 0;
    default:
      throw new Error("Day not supported");
  }
};

export const week_days = [1, 2, 3, 4, 5, 6, 0];

export const formattedTime = (time: ITime | undefined) => {
  if (!time) return "";
  if (time.hours === 24 && time.minutes === 0) {
    return "24:00";
  }
  return moment(time).format("HH:mm");
};

/**
 * Localized Day Of Week
 * @param dayIndex 0 = Sunday, 1 = Monday ...
 * @return "Monday"
 */
export const localizedDayOfWeek = (dayIndex: number, short = false) => {
  return moment()
    .day(dayIndex)
    .format(short ? "dd" : "dddd");
};

export const getActiveDaysShort = (days: boolean[]) => {
  return week_days
    .map((dayIndex) => (days[dayIndex] ? localizedDayOfWeek(dayIndex, true) : false))
    .filter(Boolean)
    .join(", ");
};

// Time 24:00 is not allowed in the latest ISO specification, therefore special treatment is necessary
export const timeStringToObject = (timeStr: string): ITime => {
  if (timeStr === "24:00")
    return {
      hours: 24,
      minutes: 0,
    };
  const time = moment(timeStr, ["HH:mm"]);
  return {
    hours: time.hours(),
    minutes: time.minutes(),
  };
};

export const isWholeDay = (timeFrom: ITime, timeTo: ITime) => {
  return (
    timeFrom.hours === 0 && timeFrom.minutes === 0 && timeTo.hours === 24 && timeTo.minutes === 0
  );
};
