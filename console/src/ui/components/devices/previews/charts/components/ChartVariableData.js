import { periodConfigurations } from "@/ui/components/devices/charts/charts/ChartUtils";

/**
 * @param {string} period Put Period for the right timerange to be inserted in the arrays
 * @param {number} start Put start in as UnixTimestamp
 * @param {number} end Put end in as UnixTimestamp
 * @param {any} generationOptions Parameter should contain an object like following {minValue: number, maxValue: number, seriescount: number}
 * @returns the mockdata for offline charts.
 */
export function getSeriesMockData(period, start, end, generationOptions) {
  const seriesArray = [];
  let seriesWithMockValues = [];
  const timeDiffForValues = periodConfigurations[period].intervalInSeconds;
  const countValues = Math.trunc((end - start) / timeDiffForValues);
  const rangeFactor = (generationOptions.maxValue - generationOptions.minValue) / 70;

  for (let i = 0; i < generationOptions.seriesCount; i++) {
    for (let x = 0; x < countValues; x++) {
      const timeValue = start + timeDiffForValues * x;
      let newValue =
        Math.random() * (generationOptions.maxValue - generationOptions.minValue) +
        generationOptions.minValue;

      if (x !== 0) {
        const previousValue = seriesWithMockValues[x - 1][1];
        let difference = Math.random() * (rangeFactor - rangeFactor * -1) + rangeFactor * -1;
        difference = parseFloat(difference.toFixed(2));
        newValue = previousValue + difference;
        if (newValue > generationOptions.maxValue) {
          // new Value cant get out of max bound
          newValue = generationOptions.maxValue - rangeFactor;
        }
        if (newValue < generationOptions.minValue) {
          // new Value cant get out of min bound
          newValue = generationOptions.minValue + rangeFactor;
        }
      }

      newValue = newValue.toFixed(2);
      seriesWithMockValues.push([timeValue * 1000, parseFloat(newValue, 10)]);
    }
    seriesArray.push(seriesWithMockValues);
    seriesWithMockValues = [];
  }

  return seriesArray;
}
