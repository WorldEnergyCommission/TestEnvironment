import moment from "moment";
import { TranslateResult } from "vue-i18n";
import "moment-timezone";

import { sha } from "../../version.json";

/**
 * This function converts a time parameter to the time in minutes. Starting from 00:00 = 0 to 24:00 = 1.440.
 * Times will be in UTC Time !
 * @param time is a string in the format of HH:MM
 * @returns time in minutes as number
 */
export function timeToMinutes(time: string) {
  const splitElement: string[] = time.split(":");

  if (splitElement.length !== 2) {
    return 0;
  } else {
    const hours = Number.parseInt(splitElement[0], 10);
    const minutes = Number.parseInt(splitElement[1], 10);

    return hours * 60 + minutes;
  }
}

/**
 * This function converts a time in minutes to the time in format HH:MM. Starting from 00:00 = 0 to 24:00 = 1.440.
 * Times will be in UTC Time !
 * @param minutes as number
 * @returns time is a string in the format of HH:MM
 */
export function minutesToTime(minutes: number) {
  const hours: any = Math.trunc(minutes / 60);
  const min = minutes - hours * 60;
  return `${hours < 10 ? `0${hours}` : hours}:${min < 10 ? `0${min}` : min}`;
}

/**
 * Calculates the number of pages from the given itemCount and itemsPerPage.
 * @param itemCount number of items in the complete list
 * @param itemsPerPage  number of items that should be shown per page
 * @returns number of pages
 */
export function calculatePageCount(itemCount: number, itemsPerPage: number) {
  if (itemCount === 0) {
    return 0;
  }

  if (itemCount % itemsPerPage === 0) {
    return Math.trunc(itemCount / itemsPerPage);
  } else {
    return Math.trunc(itemCount / itemsPerPage + 1);
  }
}

/**
 * Call time_is_out message if promise not return something in 15 seconds
 * @param promisesList array of promises
 * @param reportFn  setReport function
 * @param reportArgs report message options
 */
type Report = {
  type: string;
  message: TranslateResult;
  value: boolean;
};

export async function requestWithTimer(
  promisesList: Promise<number | string | boolean>[],
  reportFn: (args: Report) => void,
  reportArgs: Report,
) {
  const delay = new Promise((resolve) => {
    setTimeout(() => resolve("time_is_out"), 15000);
  });
  await Promise.race([delay, Promise.allSettled(promisesList)]).then((res) => {
    if (res === "time_is_out") reportFn(reportArgs);
  });
}

/**
 * Converts a string into an integer, but return null instead of NaN if it cannot be converted
 * @param text the text containing the number
 * @param radix the radix to use for the conversion
 * @return the converted number if successful or null
 */
export function parseInteger(text: string, radix = 10): number | null {
  const parseResult = parseInt(text, radix);
  return isNaN(parseResult) ? null : parseResult;
}

/**
 * Get all number string parts in a date or time or date time string as an array
 * @param text the input string
 * @return the text parts that should represent a number
 */
export function getNumberStringParts(text: string): string[] {
  return text.replace("T", "-").replace(":", "-").split("-");
}

/**
 * Converts a date object to a YYYY-MM-DD date string
 * @param date the date object to convert to a date string
 * @return the date string
 */
export function getDateString(date: Date = new Date()): string {
  return `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

/**
 * Converts a date object to a HH:MM time string
 * @param date the date object to convert to a time string
 * @return the time string
 */
export function getTimeString(date: Date = new Date()): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Converts a date object to a YYYY-MM-DDTHH:MM date time string
 * @param date the date object to convert to a date time string
 * @return the date time string
 */
export function getDateTimeString(date: Date = new Date()): string {
  return constructDateTimeString(getDateString(date), getTimeString(date));
}

/**
 * Converts a date string like YYYY-MM-DD to a date object and fills up missing
 * date components with the current date object values
 * @param date the date string with eventual missing component
 * @return the date object with eventually filled up components
 */
export function getDateFromDateString(date: string = getDateString()): Date {
  const currentDate = new Date();
  let [year, month, day] = getNumberStringParts(date)
    .slice(0, 3)
    .map((element: string) => parseInteger(element));
  year ??= currentDate.getFullYear();
  if (month == null) {
    month ??= currentDate.getMonth();
  } else {
    month -= 1;
  }
  day ??= currentDate.getDate();
  const hour = currentDate.getHours();
  const minute = currentDate.getMinutes();
  return new Date(year, month, day, hour, minute);
}

/**
 * Converts a time string like HH:MM to a date object and fills up missing
 * date components with the current date object values
 * @param time the time string with eventual missing component
 * @return the date object with eventually filled up components
 */
export function getDateFromTimeString(time: string = getTimeString()): Date {
  const currentDate = new Date();
  let [hour, minute] = getNumberStringParts(time)
    .slice(0, 2)
    .map((element: string) => parseInteger(element));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  hour ??= currentDate.getHours();
  minute ??= currentDate.getMinutes();
  return new Date(year, month, day, hour, minute);
}

/**
 * Converts a date time string like YYYY-MM-DDTHH:MM to a date object and fills up missing
 * date components with the current date object values
 * @param dateTime the date time string with eventual missing component
 * @return the date object with eventually filled up components
 */
export function getDateFromDateTimeString(dateTime: string = getDateTimeString()): Date {
  const [dateString, timeString] = constructDateAndTimeString(dateTime);
  const dateFromDatePart = getDateFromDateString(dateString);
  const dateFromTimePart = getDateFromTimeString(timeString);
  return new Date(
    dateFromDatePart.getFullYear(),
    dateFromDatePart.getMonth(),
    dateFromDatePart.getDate(),
    dateFromTimePart.getHours(),
    dateFromTimePart.getMinutes(),
  );
}

/**
 * Sanitizes a date string by filling up missing components and returning a date string in the
 * format of YYYY-MM-DD
 * @param date the date string to be sanitized
 * @return the date string with the guaranteed form of above
 */
export function sanitizeDateString(date: string): string {
  return getDateString(getDateFromDateString(date));
}

/**
 * Sanitizes a time string by filling up missing components and returning a time string in the
 * format of HH:MM
 * @param time the time string to be sanitized
 * @return the time string with the guaranteed form of above
 */
export function sanitizeTimeString(time: string): string {
  return getTimeString(getDateFromTimeString(time));
}

/**
 * Sanitizes a date time string by filling up missing components and returning a date time string in the
 * format of YYYY-MM-DDTHH:MM
 * @param dateTime the time string to be sanitized
 * @return the time string with the guaranteed form of above
 */
export function sanitizeDateTimeString(dateTime: string): string {
  return getDateTimeString(getDateFromDateTimeString(dateTime));
}

/**
 * Get a date time string in the format of YYYY-MM-DDTHH:MM from an unsanitized date and time string
 * @param date the date string
 * @param time the time string
 * @return the date time string with the guaranteed form of above
 */
export function constructDateTimeString(date: string, time: string): string {
  return `${sanitizeDateString(date)}T${sanitizeTimeString(time)}`;
}

/**
 * Get a date string in the format of YYYY-MM-DD and a time string in the format of HH:MM
 * from an unsanitized date time string
 * @param dateTime the date time string
 * @return the date and time string with the guaranteed form of above as a tuple
 */
export function constructDateAndTimeString(dateTime: string): [string, string] {
  let [datePart, timePart] = dateTime.split("T").slice(0, 2);
  datePart ??= "";
  timePart ??= "";
  return [sanitizeDateString(datePart), sanitizeTimeString(timePart)];
}

/**
 * Returns a properly formatted csv table with correct escaping
 * @param csvRows the string that should represent the fields in the csv file
 * @return the csv table as a string
 */
export function getCsvTableString(csvRows: string[][]): string {
  let csvOutput = "";
  csvRows.forEach((csvRow) => {
    // const escapedAndQuotedCsvRow = csvRow.map((x) => `"${x.replaceAll('"', '""')}"`);
    const joinedCsvRow = `${csvRow.join(";")}\r\n`;
    csvOutput += joinedCsvRow;
  });
  return csvOutput;
}

/**
 * Returns the guessed timezone as zone abbreviation
 * @return the zone abbreviation
 */
export function getGuessedTimezoneAbbreviation(): string {
  return moment.tz.guess();
}

/**
 * Change the favicon of the website
 * @param link the
 */
export const changeFavicon = (link: string) => {
  const favicon = document.getElementById("favicon");
  favicon?.setAttribute("href", link);
};

/**
 * get the default locale and set moment
 * @returns locale
 */
export const getDefaultLocale = () => {
  if (typeof window === "undefined") return null;

  const { language } = window.navigator;
  const locale = (language || "en").substr(0, 2);
  moment.locale(locale);
  return locale;
};

/**
 * Defines what icon lib to use for navigation item
 * @param {string} icon icon name
 * @return {boolean} if true use Font-Awesome icon lib
 */
export const isCustomLib = (icon: string) => {
  const reg = /^fa-/g;
  if (!icon.length) return false;
  return reg.test(icon);
};

/** get the latest sha of the git repository
 * will only be correctly set in the pipelines
 */
export function getLatestSha(): string {
  return sha;
}

/**
 * pads the given number to 2 digits. e.g. pad(1) -> "01"
 * @param n number of occupancy
 * @return string of 2 digits
 * @private
 */
export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Convert date string to specific format
 * @param date date string
 * @return date in format MM.DD.YYYY - HH.MM.SS
 */
export function formatDate(date: Date) {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Convert bytes to string with bytes, KB, MB or GB at the end
 * @param bytes number number of bytes
 * @return string e.g.: 123KB or 12MB
 */
export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return bytes + "Bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + "KB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
}
