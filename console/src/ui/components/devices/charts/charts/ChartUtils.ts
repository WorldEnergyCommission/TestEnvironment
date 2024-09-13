import Highstock from "highcharts/highstock";
import moment from "moment";
import { computed, Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { addAggsToExpression, calculate, getScope, getVariableNames } from "./ChartMath";
import { ChartData, ChartOption } from "./types";
import API from "@/store/api";
import { getGuessedTimezoneAbbreviation } from "@/utils/utilsFunctions";
import { TooltipItem } from "chart.js";
import { CanceledError } from "axios";

export function isDot(method: string) {
  return method === "*" || method === "/";
}

export function isVariable(calculationElement: { agg: any }) {
  return calculationElement.agg !== undefined && calculationElement.agg !== null;
}

export function isView(chartOptions: ChartOption) {
  return chartOptions?.seriesType !== "Calculation";
}

export function isCalculation(chartOptions: ChartOption) {
  return chartOptions?.seriesType === "Calculation";
}

export function isNumber(number: any) {
  return !Number.isNaN(number);
}

export function calc(val1: number, val2: number, method: "+" | "-" | "/" | "*") {
  switch (method) {
    case "+":
      return val1 + val2;
    case "-":
      return val1 - val2;
    case "*":
      return val1 * val2;
    case "/":
      return val1 / val2;
    default:
      return 0;
  }
}

/**
 * Returns an alternative name for the series to display in the chart legend.
 * @param {number} index
 * @param {object} device device data
 * @return {string|unknown}
 */
export function getAlternativeVariableName(index: number, device: ChartData) {
  if (device.data.mappings) {
    // old chart mappings -> return mapped variable as name
    return Object.values(device.data.mappings)[index];
  }

  if (isView(device.data.chartOptions[index])) {
    // dealing with new chartoptions and type is view -> return mapped variable name
    return device.data.chartOptions[index].var;
  }

  // dealing with new chartoptions and type is calc -> return "calc_{index}"
  return `Calculation_${index}`;
}

/**
 * Returns the respective object containing the chart options.
 * For older charts, this is the data.options object's values (an array).
 * For newer charts, it is data.chartOptions (an array).
 * @param {object} device device data
 * @return {unknown[]|*}
 */
export function getChartOptions(device: ChartData): ChartOption[] {
  return device.data.options ? Object.values(device.data.options) : device.data.chartOptions;
}

/**
 * Returns the current timestamp if the timestamp is in the future
 * @param {number} timestamp unix timestamp
 * @return {number}
 */
function correctTimestamp(timestamp: number) {
  const now = Math.trunc(new Date().getTime() / 1000);
  if (timestamp > now) {
    return now;
  } else {
    return timestamp;
  }
}

/**
 * Returns the bounds in absolute time mode.
 * @param {moment.Moment} startMoment start moment
 * @param {moment.unitOfTime.StartOf} interval the time frame
 * @return {{start: number, end: number, endChart: number}}
 */
export function getAbsoluteBounds(startMoment: moment.Moment, interval: moment.unitOfTime.StartOf) {
  const from = startMoment.clone().startOf(interval).unix();
  const to = startMoment.clone().endOf(interval).unix();

  return {
    start: from,
    end: correctTimestamp(to),
    endChart: to,
  };
}

/**
 * Returns the bounds in relative time mode.
 * @param {moment.Moment} startMoment start moment
 * @param {moment.DurationInputArg1} amount the time frame amount
 * @param {moment.DurationInputArg2} unit the time frame unit
 * @return {{start: number, end: number, endChart: number}}
 */
export function getRelativeBounds(
  startMoment: moment.Moment,
  amount: moment.DurationInputArg1,
  unit: moment.DurationInputArg2,
) {
  const from = startMoment.clone().subtract(amount, unit).unix();
  const to = startMoment.clone().unix();

  return {
    start: from,
    end: correctTimestamp(to),
    endChart: to,
  };
}

/**
 * Returns the bounds for forecasts.
 * @param {moment.Moment} startMoment start moment
 * @param {moment.DurationInputArg1} amount the time frame amount
 * @param {moment.DurationInputArg2} unit the time frame unit
 * @return {{start: number, end: number, endChart: number}}
 */
export function getFutureBounds(
  startMoment: moment.Moment,
  amount: moment.DurationInputArg1,
  unit: moment.DurationInputArg2,
) {
  const from = startMoment.clone().unix();
  const to = startMoment.clone().add(amount, unit).unix();

  return {
    start: from,
    end: to,
    endChart: to,
  };
}

export function getRoundedDate(minutes: number, d: Date) {
  const ms = 1000 * 60 * minutes; // convert minutes to ms
  const roundedDate = new Date(Math.round(d.getTime() / ms) * ms);

  return roundedDate;
}

/**
 * Returns if only one y-axis can be displayed for the chart
 * this is possible if all units match and if either all manual scaling options match or
 * if all scaling options are set to automatic
 * @param chartOptions the options of the chart that should eventually get the merged y-axis
 * @return the result if the y-axis can be merged
 */
export function isYAxisMergeable(chartOptions: ChartOption[]) {
  if (chartOptions.length < 2) return false;
  const allMinScalings = chartOptions.map((e) => e.scaling.min);
  const allMaxScalings = chartOptions.map((e) => e.scaling.max);
  const allUnits = chartOptions.map((e) => e.unit ?? "");
  const allElementsEqual = (array: (number | undefined | string)[]) =>
    array.every((val) => val === array[0]);

  return (
    allElementsEqual(allMinScalings) &&
    allElementsEqual(allMaxScalings) &&
    allElementsEqual(allUnits)
  );
}

export const Periods = {
  LIVE: "live",
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
  FORECAST6H: "forecast6h",
  FORECAST24H: "forecast24h",
  LAST_HOUR: "last_hour",
  LAST_SIX_HOURS: "last_six_hours",
  LAST_TWENTYFOUR_HOURS: "last_twentyfour_hours",
  LAST_THREE_DAYS: "last_three_days",
  LAST_SEVEN_DAYS: "last_seven_days",
  LAST_THIRTY_DAYS: "last_thirty_days",
  LAST_NINETY_DAYS: "last_ninety_days",
  LAST_YEAR: "last_year",
  LAST_FIVE_YEARS: "last_five_years",
};

export const ChartMode = {
  LIVE: "LIVE",
  ABSOLUTE: "ABSOLUTE",
  RELATIVE: "RELATIVE",
};

export const intervalsInSeconds = {
  "5s": 5,
  "15s": 15,
  "1m": 60,
  "15m": 60 * 15,
  "1h": 3600,
  "1d": 3600 * 24,
  "1w": 3600 * 24 * 7,
  "1month": 3600 * 24 * 30,
  "1y": 3600 * 24 * 365,
};

/**
 * Dict of periodConfigurations. Access with periodConfigurations["day"] etc.
 */
export const periodConfigurations = {
  live: {
    title: Periods.LIVE,
    interval: "1s",
    intervalInSeconds: 1,
    period: () => {
      return getRelativeBounds(moment(), 15, "m");
    },
    tickInterval: 60 * 1000,
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    format: "%k:%M",
    maxTicksLimit: 15,
  },
  hour: {
    calendarType: "date",
    title: Periods.HOUR,
    interval: "15s",
    intervalInSeconds: 15,
    period: () => {
      return getAbsoluteBounds(moment(), "hour");
    },
    tickInterval: 5 * 60 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 6,
  },
  day: {
    calendarType: "date",
    title: Periods.DAY,
    interval: "15m",
    intervalInSeconds: 900,
    period: () => {
      return getAbsoluteBounds(moment(), "day");
    },
    tickInterval: 3600 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 24,
  },
  week: {
    calendarType: "date",
    title: Periods.WEEK,
    interval: "1h",
    intervalInSeconds: 3600,
    period: () => {
      return getAbsoluteBounds(moment(), "week");
    },
    tickInterval: 24 * 3600 * 1000,
    format: "%a, %e. %b",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 7,
  },
  month: {
    calendarType: "month",
    title: Periods.MONTH,
    interval: "1d",
    intervalInSeconds: 86400,
    period: () => {
      return getAbsoluteBounds(moment(), "month");
    },
    tickInterval: 24 * 3600 * 1000,
    format: "%e. %b",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 31,
  },
  year: {
    title: Periods.YEAR,
    interval: "1d",
    intervalInSeconds: 86400,
    period: () => {
      return getAbsoluteBounds(moment(), "year");
    },
    format: "%b %y",
    tickInterval: 30 * 24 * 3600 * 1000,
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 12,
  },
  forecast6h: {
    title: Periods.FORECAST6H,
    interval: "1m",
    intervalInSeconds: 60,
    period: () => {
      return getFutureBounds(moment(), 6, "hour");
    },
    tickInterval: 3600 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 6,
  },
  forecast24h: {
    title: Periods.FORECAST24H,
    interval: "1m",
    intervalInSeconds: 60,
    period: () => {
      return getFutureBounds(moment(), 24, "hour");
    },
    tickInterval: 3600 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 24,
  },
  last_hour: {
    title: Periods.LAST_HOUR,
    interval: "15s",
    intervalInSeconds: 15,
    period: () => {
      return getRelativeBounds(moment(), 1, "hour");
    },
    tickInterval: 5 * 60 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 6,
  },
  last_six_hours: {
    title: Periods.LAST_SIX_HOURS,
    interval: "1m",
    intervalInSeconds: 60,
    period: () => {
      return getRelativeBounds(moment(), 6, "hour");
    },
    tickInterval: 30 * 60 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 12,
  },
  last_twentyfour_hours: {
    title: Periods.LAST_TWENTYFOUR_HOURS,
    interval: "1m",
    intervalInSeconds: 60,
    period: () => {
      return getRelativeBounds(moment(), 24, "hour");
    },
    tickInterval: 4 * 60 * 60 * 1000,
    format: "%k:%M",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 6,
  },
  last_three_days: {
    title: Periods.LAST_THREE_DAYS,
    interval: "15m",
    intervalInSeconds: 900,
    period: () => {
      return getRelativeBounds(moment(), 3, "day");
    },
    tickInterval: 24 * 3600 * 1000,
    format: "%a, %e. %b",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 6,
  },
  last_seven_days: {
    title: Periods.LAST_SEVEN_DAYS,
    interval: "1h",
    intervalInSeconds: 3600,
    period: () => {
      return getRelativeBounds(moment(), 7, "day");
    },
    tickInterval: 24 * 3600 * 1000,
    format: "%a, %e. %b",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 7,
  },
  last_thirty_days: {
    title: Periods.LAST_THIRTY_DAYS,
    interval: "1d",
    intervalInSeconds: 86400,
    period: () => {
      return getRelativeBounds(moment(), 30, "day");
    },
    tickInterval: 7 * 24 * 3600 * 1000,
    format: "%a, %e. %b",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 5,
  },
  last_ninety_days: {
    title: Periods.LAST_NINETY_DAYS,
    interval: "1d",
    intervalInSeconds: 86400,
    period: () => {
      return getRelativeBounds(moment(), 90, "day");
    },
    tickInterval: 30 * 24 * 3600 * 1000,
    format: "%a, %e. %b",
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 3,
  },
  last_year: {
    title: Periods.LAST_YEAR,
    interval: "1d",
    intervalInSeconds: 86400,
    period: () => {
      return getRelativeBounds(moment(), 1, "year");
    },
    format: "%b %y",
    tickInterval: 30 * 24 * 3600 * 1000,
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 12,
  },
  last_five_years: {
    title: Periods.LAST_FIVE_YEARS,
    interval: "1month",
    intervalInSeconds: 2592000,
    period: () => {
      return getRelativeBounds(moment(), 5, "year");
    },
    format: "%b %y",
    tickInterval: 6 * 30 * 24 * 3600 * 1000,
    tooltipFormat: "%a, %e. %b %y @ %k:%M:%S",
    maxTicksLimit: 10,
  },
};

export const langLoadingTexts = {
  de: "Laden...",
  en: "Loading...",
  it: "Caricamento...",
};

/**
 * Place the tooltip in a chart without spilling over and not covering the point itself.
 * It uses the default implementation with some value corrections.
 * @param boxWidth width of the tooltip box.
 * @param boxHeight height of the tooltip box.
 * @param point tooltip related point.
 * @return recommended position of the tooltip.
 */
export function getTooltipPosition(
  boxWidth: number,
  boxHeight: number,
  point: Highstock.Point,
): Highstock.PositionObject {
  // @ts-ignore
  const tooltipInstance = this as Highstock.Tooltip;
  const defaultPosition = tooltipInstance.getPosition(boxWidth, boxHeight, point);
  // make corrections and fill in defaults for x position
  defaultPosition.x ??= 1;
  if (defaultPosition.x === 0) defaultPosition.x = 1;
  // make corrections and fill in defaults for y position
  defaultPosition.y ??= 1;
  if (defaultPosition.y === 0) defaultPosition.y = 1;
  // return the corrected positioning object
  return defaultPosition;
}

export function isAbsolutePeriod(period: string): boolean {
  return !isLivePeriod(period) && !isRelativePeriod(period);
}

export function isRelativePeriod(period: string): boolean {
  return period.startsWith("last_");
}

export function isLivePeriod(period: string): boolean {
  return period === Periods.LIVE;
}

export function useDefaultPeriods() {
  const { t } = useI18n();

  const defaultItems = computed<{ id: string; name: string }[]>(() => [
    {
      id: Periods.LIVE,
      name: t("uiComponents.chartNavigation.LIVE"),
    },
    {
      id: Periods.HOUR,
      name: t("uiComponents.chartNavigation.HOUR"),
    },
    {
      id: Periods.DAY,
      name: t("uiComponents.chartNavigation.DAY"),
    },
    {
      id: Periods.WEEK,
      name: t("uiComponents.chartNavigation.WEEK"),
    },
    {
      id: Periods.MONTH,
      name: t("uiComponents.chartNavigation.MONTH"),
    },
    {
      id: Periods.YEAR,
      name: t("uiComponents.chartNavigation.YEAR"),
    },
    {
      id: Periods.LAST_HOUR,
      name: t("uiComponents.chartNavigation.LAST_HOUR"),
    },
    {
      id: Periods.LAST_SIX_HOURS,
      name: t("uiComponents.chartNavigation.LAST_SIX_HOURS"),
    },
    {
      id: Periods.LAST_TWENTYFOUR_HOURS,
      name: t("uiComponents.chartNavigation.LAST_TWENTYFOUR_HOURS"),
    },
    {
      id: Periods.LAST_THREE_DAYS,
      name: t("uiComponents.chartNavigation.LAST_THREE_DAYS"),
    },
    {
      id: Periods.LAST_SEVEN_DAYS,
      name: t("uiComponents.chartNavigation.LAST_SEVEN_DAYS"),
    },
    {
      id: Periods.LAST_THIRTY_DAYS,
      name: t("uiComponents.chartNavigation.LAST_THIRTY_DAYS"),
    },
    {
      id: Periods.LAST_NINETY_DAYS,
      name: t("uiComponents.chartNavigation.LAST_NINETY_DAYS"),
    },
    {
      id: Periods.LAST_YEAR,
      name: t("uiComponents.chartNavigation.LAST_YEAR"),
    },
    {
      id: Periods.LAST_FIVE_YEARS,
      name: t("uiComponents.chartNavigation.LAST_FIVE_YEARS"),
    },
  ]);

  return defaultItems;
}

/**
 * Returns a list of all available intervals
 * @return object of routes to i18n translations
 */
export function useIntervalOptions(period: string | Ref<string>) {
  const { t } = useI18n();
  const _period = ref(period);
  return computed(() => {
    const allIntervalOptions = [
      { name: t("modals.manageCharts.form.intervalOptions.1y"), id: "1y" },
      { name: t("modals.manageCharts.form.intervalOptions.1month"), id: "1month" },
      { name: t("modals.manageCharts.form.intervalOptions.1w"), id: "1w" },
      { name: t("modals.manageCharts.form.intervalOptions.1d"), id: "1d" },
      { name: t("modals.manageCharts.form.intervalOptions.1h"), id: "1h" },
      { name: t("modals.manageCharts.form.intervalOptions.15m"), id: "15m" },
      { name: t("modals.manageCharts.form.intervalOptions.1m"), id: "1m" },
      { name: t("modals.manageCharts.form.intervalOptions.15s"), id: "15s" },
      { name: t("modals.manageCharts.form.intervalOptions.1s"), id: "1s" },
    ];

    return allIntervalOptions.filter((element) => {
      if (_period.value === Periods.LIVE) {
        return ["5s"].includes(element.id);
      } else if (_period.value === Periods.HOUR) {
        return ["15s", "1m", "15m"].includes(element.id);
      } else if (_period.value === Periods.DAY) {
        return ["1m", "15m", "1h"].includes(element.id);
      } else if (_period.value === Periods.WEEK) {
        return ["1h", "1d"].includes(element.id);
      } else if (_period.value === Periods.MONTH) {
        return ["1d", "1w"].includes(element.id);
      } else if (_period.value === Periods.YEAR) {
        return ["1d", "1w", "1month", "1y"].includes(element.id);
      } else if (_period.value === Periods.LAST_HOUR) {
        return ["15s", "1m", "15m"].includes(element.id);
      } else if (_period.value === Periods.LAST_SIX_HOURS) {
        return ["1m", "15m", "1h"].includes(element.id);
      } else if (_period.value === Periods.LAST_TWENTYFOUR_HOURS) {
        return ["1m", "15m", "1h"].includes(element.id);
      } else if (_period.value === Periods.LAST_THREE_DAYS) {
        return ["15m", "1h", "1d"].includes(element.id);
      } else if (_period.value === Periods.LAST_SEVEN_DAYS) {
        return ["1h", "1d"].includes(element.id);
      } else if (_period.value === Periods.LAST_THIRTY_DAYS) {
        return ["1d", "1w"].includes(element.id);
      } else if (_period.value === Periods.LAST_NINETY_DAYS) {
        return ["1d", "1w", "1month"].includes(element.id);
      } else if (_period.value === Periods.LAST_YEAR) {
        return ["1d", "1w", "1month", "1y"].includes(element.id);
      } else if (_period.value === Periods.LAST_FIVE_YEARS) {
        return ["1month", "1y"].includes(element.id);
      }
    });
  });
}

/**
 * This function returns the default interval based on the period
 * @param period Pass a period string
 * @returns The default interval based on the period
 */
export function getDefaultInterval(period: string): string {
  switch (period) {
    case Periods.LIVE:
      return "5s";
    case Periods.HOUR:
      return "1m";
    case Periods.DAY:
      return "15m";
    case Periods.WEEK:
      return "1h";
    case Periods.MONTH:
      return "1d";
    case Periods.YEAR:
      return "1w";
    case Periods.LAST_HOUR:
      return "1m";
    case Periods.LAST_SIX_HOURS:
      return "15m";
    case Periods.LAST_TWENTYFOUR_HOURS:
      return "15m";
    case Periods.LAST_THREE_DAYS:
      return "1h";
    case Periods.LAST_SEVEN_DAYS:
      return "1h";
    case Periods.LAST_THIRTY_DAYS:
      return "1d";
    case Periods.LAST_NINETY_DAYS:
      return "1w";
    case Periods.LAST_YEAR:
      return "1w";
    case Periods.LAST_FIVE_YEARS:
      return "1M";
    default:
      return "";
  }
}

/**
 * This function returns the default period based on the mode
 * @param mode Pass one of the modes "Live", "Absolute" or "Relative"
 * @returns The default period based on the mode
 */
export function getDefaultPeriod(mode: string): string {
  switch (mode) {
    case ChartMode.LIVE:
      return Periods.LIVE;
    case ChartMode.ABSOLUTE:
      return Periods.DAY;
    case ChartMode.RELATIVE:
      return Periods.LAST_SEVEN_DAYS;
    default:
      return "";
  }
}

export function useChartOptions(defaultPeriod?: string, defaultInterval?: string) {
  const _period = ref(defaultPeriod ?? Periods.DAY);
  const _interval = ref(defaultInterval ?? getDefaultInterval(defaultPeriod ?? Periods.DAY));

  watch(
    _period,
    (newV, old) => {
      _interval.value = getDefaultInterval(newV);
    },
    { immediate: true },
  );

  return { period: _period, interval: _interval };
}

export function useChartData(
  device: Ref<ChartData> | ChartData,
  startDate: Ref<Date> | Date,
  projectId: Ref<string> | string, // ID of the project, need for the API fetch call
  period: Ref<string> | string, // timeperiod of the chart like "day", "week", "month"
  interval: Ref<string> | string, // timeinterval of the chart like "1m", "15m", "1h"
  isPreview: Ref<boolean> | boolean, // if true, dummy data is fetched
) {
  // Return value
  const measurementData = ref<[][]>([]);
  const loading = ref(false);

  // Composable Constants
  const _device = ref(device);
  const _period = ref(period);
  const _startDate = ref(startDate);
  const _projectId = ref(projectId);
  const _interval = ref(interval);
  const _isPreview = ref(isPreview);
  const _abort = ref(new AbortController());

  // Calculates the start, end and chartend timestamps for each chart based on the period provided
  const _bounds = computed(() => {
    const startMoment = moment(_startDate.value);
    let bounds;

    if (_period.value === Periods.DAY) {
      bounds = getAbsoluteBounds(startMoment, "day");
    } else if (_period.value === Periods.WEEK) {
      bounds = getAbsoluteBounds(startMoment, "week");
    } else if (_period.value === Periods.MONTH) {
      bounds = getAbsoluteBounds(startMoment, "month");
    } else if (_period.value === Periods.YEAR) {
      bounds = getAbsoluteBounds(startMoment, "year");
    } else if (_period.value === Periods.HOUR) {
      bounds = getAbsoluteBounds(startMoment, "hour");
    } else if (_period.value === Periods.LAST_HOUR) {
      bounds = getRelativeBounds(startMoment, 1, "hour");
    } else if (_period.value === Periods.LAST_SIX_HOURS) {
      bounds = getRelativeBounds(startMoment, 6, "hour");
    } else if (_period.value === Periods.LAST_TWENTYFOUR_HOURS) {
      bounds = getRelativeBounds(startMoment, 24, "hour");
    } else if (_period.value === Periods.LAST_THREE_DAYS) {
      bounds = getRelativeBounds(startMoment, 3, "day");
    } else if (_period.value === Periods.LAST_SEVEN_DAYS) {
      bounds = getRelativeBounds(startMoment, 7, "day");
    } else if (_period.value === Periods.LAST_THIRTY_DAYS) {
      bounds = getRelativeBounds(startMoment, 30, "day");
    } else if (_period.value === Periods.LAST_NINETY_DAYS) {
      bounds = getRelativeBounds(startMoment, 90, "day");
    } else if (_period.value === Periods.LAST_YEAR) {
      bounds = getRelativeBounds(startMoment, 1, "year");
    } else if (_period.value === Periods.LAST_FIVE_YEARS) {
      bounds = getRelativeBounds(startMoment, 5, "year");
    } else if (_period.value === Periods.LIVE) {
      bounds = getRelativeBounds(moment(), 15, "m");
    }

    return bounds;
  });

  const _endDate = computed(() => {
    return _bounds.value?.end;
  });

  const _endChart = computed(() => {
    return _bounds.value?.endChart;
  });

  // Everytime the timeperiod, date or intervale changes the data should be reloaded
  watch(
    _period,
    (newV, old) => {
      loadData();
    },
    { immediate: true },
  );

  watch(_startDate, (newV, old) => {
    loadData();
  });

  watch(_interval, (newV, old) => {
    loadData();
  });

  watch(_device, (newV, old) => {
    loadData();
  });

  /**
   * Creates a random measurement data for the preview chart
   * @param start start timestamp
   * @param end end timestamp
   * @param period period like "day"
   * @returns dummyData: [number, number][][]
   */
  function getDummyData(start: number, end: number, period: string) {
    const dummyData: [number, number][][] = [];
    const dummyChart: [number, number][] = [];

    const interval = intervalsInSeconds[_interval.value as string] ?? 60;
    const ticks = Math.trunc((end - start) / interval);

    for (let i = 0; i < ticks; i++) {
      const newTimestamp = start * 1000 + i * interval * 1000;
      const randomValue = Math.round(Math.random() * 10);
      dummyChart.push([newTimestamp, randomValue]);
    }

    dummyData.push(dummyChart);

    return {
      measurement: dummyData,
    };
  }

  /**
   * loads chart data for all variables from the API and returns it as a Promise.
   * @return {Promise<unknown>}
   */
  async function loadData(): Promise<unknown> {
    loading.value = true;
    _abort.value && _abort.value.abort();
    _abort.value = new AbortController();
    return new Promise((resolve, reject) => {
      // Watch for 'abort' signals
      _abort.value.signal.addEventListener("abort", () => {
        // Stop the main operation
        // Reject the promise with the abort reason.
        resolve([]);
      });
      const requests: Promise<any>[] = [];
      let chartOptionsArray: ChartOption[] = [];

      // Get the chart options
      chartOptionsArray = getChartOptions(_device.value);

      // Iterate over all chart options and load the data
      chartOptionsArray.forEach((optionsItem, index) => {
        if (_isPreview.value) {
          const { measurement } = getDummyData(
            _bounds.value!.start,
            _bounds.value!.endChart,
            _period.value,
          );
          requests.push(new Promise((resolve) => resolve(measurement[0])));
        } else if (_device.value.data.mappings || isView(optionsItem)) {
          // Either old chart, or new chart of type view
          const variable = _device.value.data.mappings
            ? Object.values(_device.value.data.mappings)[index]
            : optionsItem.var;

          const { agg, miss } = optionsItem;

          requests.push(loadFromAPI(variable!, agg!, miss));
        } else {
          // Calculation
          requests.push(calculateSeries(optionsItem));
        }
      });
      if (_abort.value.signal.aborted) {
        resolve([]);
      }
      Promise.all(requests)
        .then((res) => {
          let converted = res;
          // convert data to milliseconds [[date_in_unix * 1000, value]]
          if (!_isPreview.value) {
            converted = res.map((list) => {
              if (Array.isArray(list)) {
                return list.map((dataPoint: [number, number]) => [
                  dataPoint[0] * 1000,
                  dataPoint[1],
                ]);
              }
              return reject(list.message);
            });
          }

          measurementData.value = converted;
          resolve(converted);
        })
        .catch((err) => {
          if (!(err instanceof CanceledError)) reject(err);
        })
        .finally(() => {
          loading.value = false;
        });
    });
  }

  /**
   * loads the data from the API. corresponds to api.fetch in ts.
   * @param {string} baseURL base URL
   * @param {string} projectId project id
   * @param {string} variable variable
   * @param {string} agg aggregation method
   * @param {string} int the interval string
   * @param {string} miss missing value strategy
   * @param {string} authToken auth token
   * @return {Promise<any>|*[]|*}
   */
  function loadFromAPI(
    variable: string,
    agg: string,
    miss: string | undefined,
  ): Promise<any> | any[] | any {
    const projectId = _projectId.value;

    if (!projectId || !variable?.length || !_bounds.value) {
      return Promise.resolve([]);
    }

    const startTimestamp = Math.max(_bounds.value?.start ?? 0, 0);

    const endTimestamp = _bounds.value?.end;

    // default missing value strategy is locf
    miss = miss ?? "locf";
    // for live data the aggregation options do not make any sense as the current values are shown, furthermore always fill up missing values
    if (_period.value === "live") {
      agg = "last";
      miss = "locf";
    }

    agg = agg ?? "avg";
    agg = agg !== "" ? agg : "avg";

    const url = `/projects/${projectId}/measurements/${variable}/chart?start=${startTimestamp}&end=${endTimestamp}&agg=${agg}&int=${_interval.value}&miss=${miss}&tz=${getGuessedTimezoneAbbreviation()}`;

    const response = API.fetch(url, "GET", undefined, undefined, undefined, _abort.value.signal);

    return response;
  }

  /**
   * Calculates the series for the given calculation optionsItem.
   * @param {string} baseURL
   * @param {Object} optionsItem
   * @param {string} authToken
   * @returns a Promise containing the resulting series.
   */
  async function calculateSeries(optionsItem: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const { expression } = optionsItem.calculation;
        const variableNames = getVariableNames(expression);
        const { aggregations } = optionsItem.calculation;
        const { miss } = optionsItem;

        // fetch all variable values that are contained in calculationElements
        const variableValues = await fetchCalculationVariableValues(
          variableNames,
          aggregations,
          miss,
        );

        // start with first variable, to have an array with [timestamp, value] of correct length
        const firstVariable = Object.values(variableValues)[0];

        if (!Array.isArray(firstVariable)) {
          throw Error(`No data found for variable ${variableNames}`);
        }

        // loop over entries [timestamp, value] and calculate the values according to the expression
        const result = firstVariable.map((element, i) => {
          const timestamp = element[0];
          const scope = getScope(i, variableNames, aggregations, variableValues);

          // check if there is a null value present in the current timestamp
          const scopeValues = Object.values(scope);
          const isNullValuePresent = scopeValues.some((x) => x == null);
          let value = null;

          // only do the calculation if no null values are present
          if (!isNullValuePresent) {
            value = calculate(addAggsToExpression(expression, aggregations), scope);
          }

          return [timestamp, value];
        });
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Returns a promise with all the variable values loaded from the backend.
   * @param {string} baseURL
   * @param {string[]} variableNames
   * @param {string[]} aggregations
   * @param {string} missingValueStrategy
   * @param {string} authToken
   * @returns a promise containing an object of the structure {"<variablename>_<agg>": <data>, ...}
   */
  async function fetchCalculationVariableValues(variableNames, aggregations, missingValueStrategy) {
    return new Promise((resolve, reject) => {
      const requests = variableNames.map((variableName, index) => {
        // variable
        return loadFromAPI(variableName, aggregations[index], missingValueStrategy);
      });

      Promise.all(requests)
        .then((res) => {
          // create a object with the structure {"<variablename>_<agg>": <data>, ...}
          const variableData = {};
          res.forEach((d, i) => (variableData[`${variableNames[i]}_${aggregations[i]}`] = d));
          resolve(variableData);
        })
        .catch((err) => reject(err));
    });
  }

  return {
    measurementData,
    loading,
    startDate: _startDate,
    endDate: _endDate,
    endChart: _endChart,
  };
}

export function useTooltipTitleCallback() {
  const i18nLocale = useI18n();

  return computed(
    () =>
      function (context: TooltipItem<"line">[]) {
        // format day of week and also timezone
        return Intl.DateTimeFormat(i18nLocale.locale.value, {
          weekday: "short",
          timeZoneName: "short",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(context[0].parsed.x));
      },
  );
}

export function useTooltipFooterCallback() {
  const { t, locale } = useI18n();

  return computed(() => {
    return function (items: TooltipItem<"line">[]) {
      const sum = items.reduce((a, b) => a + b.parsed.y, 0);

      return `${t("uiComponents.chartsTotalView.tableHeaders.sum")}: ${new Intl.NumberFormat(locale.value).format(sum)}`;
    };
  });
}
