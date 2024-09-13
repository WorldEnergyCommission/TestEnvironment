/**
 * @interface Properties
 * @property { name: string } Define the name of the linechart
 * @property { data: number[ ] } Define the data which is displayed
 * @property { categories: string[ ] } Define the values on the x axis of the chart
 * @property { min: number } Define the smallest value of the y axis
 * @property { max: number } Define the biggest value of the y axis
 */
export interface PropsApexLine {
  name: string;
  data: number[];
  categories: string[];
  min?: number;
  max?: number;
}

/**
 * @interface Properties
 * @property { nameLine: string } Define the name of the linechart
 * @property { nameArea: string } Define the name of the linechart
 * @property { dataLine: number[ ] } Define the data displayed by the line chart
 * @property { dataArea: number[ ] } Define the data displayed by the area chart
 * @property { categories: number[ ] } Define the values on the x axis of the chart
 * @property { min: number } Define the smallest value of the y axis
 * @property { max: number } Define the biggest value of the y axis
 */
export interface PropsBakingMonitorChart {
  namePowerConsumtion?: string;
  nameBakeTime?: string;
  nameBakeWindowAndOpeningHours?: string;
  dataPowerConsumption: number[];
  dataBakeTime: number[];
  dataBakeWindowAndOpeningHours?: number[];
  categories: number[];
  min?: number;
  max?: number;
}
