/**
 * @param {string} period Put Period for the right timerange to be inserted in the arrays
 * @param {number} start Put start in as UnixTimestamp
 * @param {number} end Put end in as UnixTimestamp
 * @param {any} generationOptions Parameter should contain an object like following {minValue: number, maxValue: number, seriescount: number}
 * @returns the mockdata for offline charts.
 */
export declare function getSeriesMockData(
  period: string,
  start: any,
  end: any,
  generationOptions: any,
): any;
