import Highstock from "highcharts/highstock";
import moment from "moment";

import { addAggsToExpression, calculate, getScope, getVariableNames } from "./ChartMath";
import {
  getAbsoluteBounds,
  getAlternativeVariableName,
  getChartOptions,
  getRelativeBounds,
  getTooltipPosition,
  isView,
  isYAxisMergeable,
  langLoadingTexts,
  periodConfigurations,
  Periods,
} from "./ChartUtils";
import { getSeriesMockData } from "@/ui/components/devices/previews/charts/components/ChartVariableData";

const defaultChartColors = [
  "#6ca2d8",
  "#90ed7d",
  "#f7a35c",
  "#8085e9",
  "#f15c80",
  "#e4d354",
  "#2b908f",
  "#f45b5b",
  "#91e8e1",
];

/**
 * @returns {number} returns the timezone offset in minutes
 */
function getTimezoneOffset() {
  return -1 * moment().tz(moment.tz.guess()).utcOffset();
}

export default class LynusChart {
  constructor(
    device,
    projectId,
    baseURL,
    isDarkTheme,
    chartStart,
    initialBackgroundColor,
    stackingOP,
    periodConfigs = periodConfigurations,
    chartColors = defaultChartColors,
    timezoneAbbreviation = "UTC",
    isPreview = false,
  ) {
    this.chart; // holds the highcharts object
    this.projectId = projectId;
    this.baseURL = baseURL;
    this.device = device; // the device data we got from the API
    this.chartStart = chartStart; // contains the timestamp when the Project was created
    this.periodConfigs = periodConfigs;
    this.period = periodConfigs[Periods.DAY];
    this.countLines = 0;
    this.countColumns = 0;
    this.stackingOptions = stackingOP;
    this.calendarUsed = false;
    this.isDarkTheme = isDarkTheme;
    this.backgroundColor = initialBackgroundColor;
    this.chartColors = chartColors;
    this.isPreview = isPreview;

    const chartPeriod = this.period.period();
    this.start = chartPeriod.start;
    this.startTimestamp = null;
    this.end = chartPeriod.end;
    this.endTimestamp = null;
    this.endChart = chartPeriod.endChart;

    // store the current timezone of the chart
    this.timezoneAbbreviation = timezoneAbbreviation;

    // stores a mapping from "variable_agg" -> data, to "cache" data and
    // avoid multiple requests for same data
    this.loadedVariables = {};

    // store event listeners to remove them latter
  }

  /**
   * only switches the period to the given one
   * period: Periods (Periods.LIVE, Periods.DAY, ...) or simple string "live", "day", ...
   * @param {string} period current period
   */
  switchPeriod(period) {
    this.period = this.periodConfigs[period];
    const chartPeriod = this.period.period();
    this.start = chartPeriod.start;
    this.end = chartPeriod.end;
    this.endChart = chartPeriod.endChart;

    // clear loadedVariables
    this.loadedVariables = {};
  }

  /**
   * Main function for switching between periods (live, day, week, ...)
   * and loading according data.
   * Period: Periods (Periods.LIVE, Periods.DAY, ...)
   * or simple string "live", "day", ...
   * @param {string} period current period
   * @param {string} authToken auth token
   * @return {Promise<void>} chart data
   */
  async switchPeriodAndLoad(period, authToken) {
    this.switchPeriod(period);

    await this.loadChart(authToken);
  }

  calculateBounds(startMoment) {
    let bounds;
    if (this.period.title === Periods.DAY) {
      bounds = getAbsoluteBounds(startMoment, "day");
    } else if (this.period.title === Periods.WEEK) {
      bounds = getAbsoluteBounds(startMoment, "week");
    } else if (this.period.title === Periods.MONTH) {
      bounds = getAbsoluteBounds(startMoment, "month");
    } else if (this.period.title === Periods.YEAR) {
      bounds = getAbsoluteBounds(startMoment, "year");
    } else if (this.period.title === Periods.HOUR) {
      bounds = getAbsoluteBounds(startMoment, "hour");
    } else if (this.period.title === Periods.LAST_HOUR) {
      bounds = getRelativeBounds(startMoment, 1, "hour");
    } else if (this.period.title === Periods.LAST_SIX_HOURS) {
      bounds = getRelativeBounds(startMoment, 6, "hour");
    } else if (this.period.title === Periods.LAST_TWENTYFOUR_HOURS) {
      bounds = getRelativeBounds(startMoment, 24, "hour");
    } else if (this.period.title === Periods.LAST_THREE_DAYS) {
      bounds = getRelativeBounds(startMoment, 3, "day");
    } else if (this.period.title === Periods.LAST_SEVEN_DAYS) {
      bounds = getRelativeBounds(startMoment, 7, "day");
    } else if (this.period.title === Periods.LAST_THIRTY_DAYS) {
      bounds = getRelativeBounds(startMoment, 30, "day");
    } else if (this.period.title === Periods.LAST_NINETY_DAYS) {
      bounds = getRelativeBounds(startMoment, 90, "day");
    } else if (this.period.title === Periods.LAST_YEAR) {
      bounds = getRelativeBounds(startMoment, 1, "year");
    } else if (this.period.title === Periods.LAST_FIVE_YEARS) {
      bounds = getRelativeBounds(startMoment, 5, "year");
    }
    return bounds;
  }

  /**
   * Main function for switching calendar range (selected using date picker).
   * The expected parameters are the year,month,day representing the start of the calendar range.
   * @param {moment} startMoment start
   * @param {string} authToken auth token
   * @return {Promise<void>} chart data
   */
  async loadCalendarRange(startMoment, authToken) {
    const bounds = this.calculateBounds(startMoment);

    this.start = bounds.start;
    this.end = bounds.end;
    this.endChart = bounds.endChart;

    this.calendarUsed = true;

    // clear loadedVariables
    this.loadedVariables = {};

    await this.loadChart(authToken);
  }

  /**
   * Main entrypoint for updating all variables at once.
   * Updates the variable at the given index with the new value within the chart
   * @param {array} values list of values
   */
  liveUpdateAllVariables(values) {
    if (!this.chart) return;
    const time = new Date().getTime();
    const options = getChartOptions(this.device);

    this.chart.xAxis[0].update({
      min: time - 900000, // update the min for live chart
    });

    // add each data point
    // TODO: maybe not loop over???
    values.forEach((value, index) => {
      const isThreshold = options[index].seriesType === "Threshold";
      if (!isThreshold) this.chart.series[index].addPoint([time, value]);

      // remove values after given time
      if (this.chart.series[index].data.length > 1100) {
        this.chart.series[index].data.shift();
      }
    });

    // hide no data found...
    this.checkDataAndToggleLoading();

    // load darkmode if during live event
    // takes really long, is it really needed here? - JP
    // this.updateTheme();
  }

  /**
   * Expects string identifier of container
   * @param container HTML element where the chart will be drawn
   */
  buildChart(container) {
    const mergedYAxis = isYAxisMergeable(getChartOptions(this.device));
    const updatedYAxis = this.updateYAxis();
    // create chart instance
    this.chart = Highstock.chart({
      chart: {
        backgroundColor: this.backgroundColor,
        animation: false,
        renderTo: container,
        legend: {
          itemStyle: {
            color: this.defaultColorBasedOnTheme(),
          },
        },
        //TODO: needed ??? - JP 27/02/2024
        // events: {
        //   redraw: () => {
        //     if (this.chart !== undefined) {
        //       this.chart.pointer.chartPosition = null;

        //       // this.chart.render();
        //     }
        //   },
        // },
      },
      navigation: {
        buttonOptions: {
          enabled: false,
        },
      },
      // set Colors for series in Highcharts
      colors: this.chartColors,
      title: {
        text: "",
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: "datetime",
      },
      loading: {
        labelStyle: {
          color: "black",
        },
      },
      yAxis: updatedYAxis,
      series: getChartOptions(this.device).map((optionsItem, index) => {
        let { name } = optionsItem;

        if (!name || name.length === 0) {
          // name not set
          name = getAlternativeVariableName(index, this.device);
        }

        return {
          name,
          data: [],
          yAxis: mergedYAxis ? 0 : index,
          type: optionsItem.type,
          showInLegend: optionsItem.seriesType !== "Threshold",
        };
      }),
      tooltip: {
        shared: true,
        // xDateFormat now working...
        xDateFormat: "%Y-%m-%d",
        positioner: getTooltipPosition,
      },
      // https://stackoverflow.com/questions/51130861/how-do-i-get-remove-of-data-table-option-from-high-chart-export
      plotOptions: {
        series: {
          marker: {
            enabledThreshold: 2,
            radius: 4,
          },
        },
        area: {
          marker: {
            enabledThreshold: 2,
            radius: 4,
          },
        },
        column: {
          stacking: this.stackingOptions,
        },
      },
      time: {
        timezoneOffset: getTimezoneOffset(),
        useUTC: false,
      },
    });

    // load darkmode on area change
    this.updateTheme();

    // Add Title if Fullscreen is active
    document.addEventListener("fullscreenchange", this.onFullScreenChange);

    // watch ath zoom of browser or a resizing of the browser window
    window.addEventListener("resize", this.callUpdateThemeTimeout);
  }

  callUpdateThemeTimeout() {
    setTimeout(() => {
      this.updateTheme && this.updateTheme();
    }, 100);
  }

  /**
   * get default colors based on theme
   * @returns black if dark theme otherwise white
   */
  defaultColorBasedOnTheme() {
    return this.isDarkTheme ? "#ffffff" : "#000000";
  }

  /**
   * Clean up the compnent so that gc can do its magic
   */
  destroy() {
    window.removeEventListener("resize", this.callUpdateThemeTimeout);
    document.removeEventListener("fullscreenchange", this.onFullScreenChange);
    this.chart && this.chart.destroy();
    this.chart = undefined;
  }

  /**
   * Sets the global locale for Highcharts.
   * @param {*} locale the locale as a string, in format 'en', 'de' or 'it'
   */
  setLocale(locale) {
    // set locale and lang options
    moment.locale(locale);
    Highstock.setOptions({
      accessibility: {
        enabled: false,
      },
      lang: {
        loading: langLoadingTexts[locale],
        weekdays: moment.weekdays(),
        shortWeekdays: moment.weekdaysShort(),
        months: moment.months(),
        shortMonths: moment.monthsShort(),
      },
    });
  }

  setIsDarkTheme(isDarkTheme) {
    this.isDarkTheme = isDarkTheme;
  }

  setDevice(device) {
    this.device = device;
  }

  setChartColors(chartColors) {
    this.chartColors = chartColors;

    const updatedYAxis = this.updateYAxis();
    this.chart.update({
      colors: this.chartColors,
      yAxis: updatedYAxis,
    });

    this.updateTheme();
  }

  updateYAxis() {
    const mergedYAxis = isYAxisMergeable(getChartOptions(this.device));
    const chartOptions = getChartOptions(this.device);
    const yAxisArray = mergedYAxis ? chartOptions.slice(0, 1) : chartOptions;
    const initYAxis = (chartOptions) => {
      return chartOptions.map((data, index) => ({
        labels: {
          format: `{value} ${data.unit || ""}`,
          style: {
            color: mergedYAxis ? this.defaultColorBasedOnTheme() : this.chartColors[index],
          },
        },
        title: {
          text: undefined,
        },
        min: data.scaling.min ? Number(data.scaling.min) : null,
        max: data.scaling.max ? Number(data.scaling.max) : null,
        endOnTick: yAxisArray.length === 1 || !mergedYAxis,
        showEmpty: false,
      }));
    };
    return initYAxis(yAxisArray);
  }

  /**
   * Called when theme is changed. requires current theme background color to be passed.
   * @param {string} backgroundColor background color
   */
  onThemeChange(backgroundColor) {
    this.backgroundColor = backgroundColor;
    this.updateTheme();
  }

  onFullScreenChange() {
    this.chart.update({
      title: {
        text: document.fullscreenElement !== null ? this.device.name : undefined,
      },
    });
    // set Tilte color based on darkmode "on" or "off"
    this.chart.title.update({
      style: {
        color: this.isDarkTheme ? "#fff" : "#000000",
      },
    });

    // set darktheme on toggle fullscreen (timeout is needed)
    setTimeout(() => {
      this.updateTheme && this.updateTheme();
    }, 10);
  }

  updateColumnLineCounts() {
    getChartOptions(this.device).forEach((variable) => {
      if (variable.type === "column" || variable.type === "diff") {
        this.countColumns++;
      } else {
        this.countLines++;
      }
    });
  }

  /**
   * Relies on this.isDarkTheme to be already set correctly
   */
  updateTheme() {
    if (!this.chart) return;
    // set Legend Text Color
    this.chart.legend.update(
      {
        itemStyle: {
          color: this.defaultColorBasedOnTheme(),
        },
      },
      false,
    );

    this.chart.xAxis[0].update({
      labels: {
        style: {
          color: this.defaultColorBasedOnTheme(),
        },
      },
      lineColor: this.defaultColorBasedOnTheme(),
      tickColor: this.defaultColorBasedOnTheme(),
    });
    // set background of Chart
    this.chart.chartBackground.attr({
      fill: this.backgroundColor,
    });
    // bugfix for darkmode when scrolling
    this.chart.options.chart.backgroundColor = this.backgroundColor;
  }

  handleFullScreen() {
    this.chart && this.chart.fullscreen.open();
  }

  setWidth(width) {
    if (this.chart) {
      this.chart.chartWidth = width;
    }
  }

  showLoading() {
    this.chart && this.chart.showLoading();
  }

  /**
   * Toggle stacking options
   */
  toggleStacking() {
    if (this.stackingOptions === "normal") {
      this.stackingOptions = ""; // disable stacking
    } else {
      this.stackingOptions = "normal"; // stack columns
    }
    this.chart.update({ plotOptions: { column: { stacking: this.stackingOptions } } });

    // update theme because otherwise it switches back to light theme
    this.updateTheme();
  }

  /**
   * Add threshold line(0-100%), used only on anomaly detection devices
   * @param {number} value threshold value
   */
  drawThreshold(value) {
    if (typeof value === "number") {
      this.chart.yAxis[this.chart.yAxis.length - 1].addPlotLine({
        value,
        color: "green",
        dashStyle: "Dash",
        width: 3,
        label: {
          text: "Threshold",
          align: "right",
          x: -10,
          y: -5,
        },
        zIndex: 1,
      });
    }
  }

  /**
   * Return the first and last timestamp used in the displayed chart
   * @return the first and last timestamp as array of size 2
   */
  getChartStartAndEndTimestamps() {
    if (!this.chart) return [];
    const seriesData = this.chart.series.map((series) => {
      return series.data.map((point) => point.x);
    });
    const allTimestamps = seriesData.flat(1);
    return [Math.min(...allTimestamps), Math.max(...allTimestamps)];
  }

  /**
   * Main entrypoint for loading chart
   * @param {string} authToken auth token
   * @return {Promise<void>}
   */
  async loadChart(authToken) {
    this.showLoading();

    try {
      let res;

      if (this.isPreview) {
        const chartOptions = getChartOptions(this.device);

        res = await Promise.all(
          chartOptions.map(async (options) => {
            return await getSeriesMockData(this.period.title, this.start, this.endChart, {
              minValue: parseInt(options.scaling.min),
              maxValue: parseInt(options.scaling.max),
              seriesCount: 1,
            })[0];
          }),
        );
      } else {
        res = await this.loadData(this.baseURL, authToken);
      }

      // always gets the given Start Value (format of the xAxis)
      await this.load(res);
    } catch (e) {
      this.chart &&
        this.chart.showLoading(
          `Error loading data<br/>Please reload the page<br><small>${e}</small>`,
        );
    }
  }

  getChartStart() {
    return Math.max(this.start, 0);
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
  loadFromAPI(baseURL, projectId, variable, agg, int, miss, authToken) {
    this.startTimestamp = this.getChartStart();

    if (!variable?.length) return [];

    const key = `${variable}_${agg}`;
    if (this.loadedVariables.hasOwnProperty(key)) {
      // data already loaded -> simply return it
      return this.loadedVariables[key];
    }

    this.endTimestamp = this.end;
    if (this.countLines === 0 && this.countColumns > 0) {
      // subtract 1 second to not get into the subsequent interval
      this.endTimestamp -= 1;
    }

    // default missing value strategy is locf
    miss = miss ?? "locf";
    // default interval is the one from the period configurations
    int = int ?? this.period.interval;
    // for live data the aggregation options do not make any sense as the current values are shown, furthermore always fill up missing values
    if (this.period.title === "live") {
      agg = "last";
      miss = "locf";
    }
    const url = `/projects/${projectId}/measurements/${variable}/chart?start=${this.startTimestamp}&end=${this.endTimestamp}&agg=${agg}&int=${int}&miss=${miss}&tz=${this.timezoneAbbreviation}`;

    const response = fetch(baseURL + url, {
      headers: { "Content-Type": "application/json", authorization: authToken },
    }).then((res) => res.json());

    // store data for given variable
    this.loadedVariables[key] = response;

    return response;
  }

  /**
   * loads chart data for all variables from the API and returns it as a Promise.
   * @param {string} baseURL base URL
   * @param {string} authToken auth token
   * @return {Promise<unknown>}
   */
  loadData(baseURL, authToken) {
    return new Promise((resolve, reject) => {
      const requests = [];

      getChartOptions(this.device).forEach((optionsItem, index) => {
        if (this.device.data.mappings || isView(optionsItem)) {
          // either old chart, or new chart of type view
          const variable = this.device.data.mappings
            ? Object.values(this.device.data.mappings)[index]
            : optionsItem.var;
          const { agg, miss } = optionsItem;
          requests.push(
            this.loadFromAPI(
              baseURL,
              this.projectId,
              variable,
              agg,
              this.device.data.interval,
              miss,
              authToken,
            ),
          );
        } else {
          // calculation
          requests.push(this.calculateSeries(baseURL, optionsItem, authToken));
        }
      });

      Promise.all(requests)
        .then((res) => {
          // convert data to milliseconds [[date_in_unix * 1000, value]]
          const converted = res.map((list) => {
            if (Array.isArray(list)) {
              return list.map((dataPoint) => [dataPoint[0] * 1000, dataPoint[1]]);
            }
            return reject(list.message);
          });

          this.dataToExport = converted;
          resolve(converted);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Calculates the series for the given calculation optionsItem.
   * @param {string} baseURL
   * @param {Object} optionsItem
   * @param {string} authToken
   * @returns a Promise containing the resulting series.
   */
  async calculateSeries(baseURL, optionsItem, authToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const { expression } = optionsItem.calculation;
        const variableNames = getVariableNames(expression);
        const { aggregations } = optionsItem.calculation;
        const { miss } = optionsItem;

        // fetch all variable values that are contained in calculationElements
        const variableValues = await this.fetchCalculationVariableValues(
          baseURL,
          variableNames,
          aggregations,
          this.device.data.interval,
          miss,
          authToken,
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
   * @param {string} interval
   * @param {string} missingValueStrategy
   * @param {string} authToken
   * @returns a promise containing an object of the structure {"<variablename>_<agg>": <data>, ...}
   */
  async fetchCalculationVariableValues(
    baseURL,
    variableNames,
    aggregations,
    interval,
    missingValueStrategy,
    authToken,
  ) {
    return new Promise((resolve, reject) => {
      const requests = variableNames.map((variableName, index) => {
        // variable
        return this.loadFromAPI(
          baseURL,
          this.projectId,
          variableName,
          aggregations[index],
          interval,
          missingValueStrategy,
          authToken,
        );
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

  /**
   * Returns the date string for the passed unix timestamp
   * @param format the date format string
   * @param timestamp the unix timestamp
   * @return the formatted date string
   */
  formatUnixTimestamp(format, timestamp) {
    const date = new Date(timestamp);
    const utcDate = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    );
    return Highstock.dateFormat(format, utcDate);
  }

  /**
   * loads the passed loadedData into the chart.
   * @param {object} loadedData loaded data
   * @return {Promise<void>}
   */
  async load(loadedData) {
    // see: https://stackoverflow.com/a/53530070
    const s = this.chart.series;
    // set data to each chart series
    loadedData.forEach((data, index) => {
      s[index].setData(data, false);
    });

    // set tooltip options for highcharts
    const chartOptions = getChartOptions(this.device);
    const { tooltipFormat } = this.period;
    const formatterFunction = this.formatUnixTimestamp;
    this.chart.tooltip.update({
      useHTML: true,
      formatter() {
        // get timestamp of next point in the series to show the end of the interval
        const currentPointIndex = this.points[0].point.index;
        const seriesData = this.points[0].series.data;
        const nextTimestamp = seriesData[currentPointIndex + 1]?.x;
        const currentFormattedTimestamp = formatterFunction(tooltipFormat, this.x);
        const nextFormattedTimestamp = formatterFunction(tooltipFormat, nextTimestamp - 1);
        const formattedPeriodInterval =
          currentFormattedTimestamp +
          (nextTimestamp ? `&nbsp;-&nbsp;${nextFormattedTimestamp}` : "");
        const headerFormat = `<table><tr style="font-size: 10px; color: rgb(51, 51, 51);"><td colspan="3">${formattedPeriodInterval}</td></tr>`;
        const pointFormats = this.points.map((element) => {
          const seriesUnit = chartOptions[element.series.index].unit ?? "";
          return (
            `<tr><td><span style="color: ${element.series.color};">&nbsp;●&nbsp;</span>&nbsp;${element.series.name}&nbsp;</td>` +
            `<td style="text-align: right;"><b>&nbsp;${element.y.toFixed(2)}&nbsp;</b></td>` +
            `<td style="text-align: left;"><b>&nbsp;${seriesUnit}&nbsp;</b></td></tr>`
          );
        });
        const footerFormat = "</table>";
        return headerFormat + pointFormats.join("") + footerFormat;
      },
    });

    // disable data grouping for all series in the chart
    getChartOptions(this.device).forEach((variable, index) => {
      this.chart.series[index].update(
        {
          dataGrouping: {
            enabled: false,
          },
        },
        false,
      );
    });

    // Load Options & set zIndex for Chart
    getChartOptions(this.device).forEach((variable, index) => {
      this.chart.series[index].update(
        {
          zIndex: variable.type === "column" ? 2 : 4,
        },
        false,
      );
    });

    let endChart = this.endChart * 1000;
    if (this.period.title === Periods.LIVE) {
      endChart = undefined;
    }

    // set the min and max values of the xAxis (xAxis[0])
    this.chart.xAxis[0].update(
      {
        min: this.start * 1000,
        max: endChart,
        labels: {
          formatter: (e) => {
            return this.formatUnixTimestamp(this.period.format, +e.value);
          },
        },
        tickInterval: this.period.tickInterval,
      },
      false,
    );

    // load darkmode if selected
    this.updateTheme();

    // clear those values for Calendar usage
    this.calendarUsed = false;

    this.checkDataAndToggleLoading();
  }

  checkDataAndToggleLoading() {
    const gotData = [];
    // check if data contains value and pushes true or false into array
    // usefull if a Chart Contains no data to show a different Text on the Loading Screen
    this.chart.series.forEach((series) => {
      let countValues = 0;
      for (let index = 0; index < series.options.data.length; index++) {
        if (series.options.data[index][1] !== null) {
          countValues++;
        }
      }
      gotData.push(!!countValues);
    });

    // comparison function to check if element is true
    const isTrue = (element) => element === true;

    if (gotData.some(isTrue)) {
      this.chart.hideLoading();
    } else {
      this.chart.showLoading("No Data found.");
    }
  }
}
