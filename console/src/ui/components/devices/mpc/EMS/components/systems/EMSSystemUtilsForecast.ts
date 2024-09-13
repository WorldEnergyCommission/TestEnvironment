import { defineComponent, PropType } from "vue";

/**
 * Props for EMS Systems
 */
export interface CommonSystemForecastProps {
  systemName: string;
  systemForecastTargetPower: any;
  groupSliderState: number;
  allSystemsForecastData: any;
}

/**
 * Common logic for EMS forecast components. Can be reused by custom forecast components like battery.
 * Template is in EMSSystemForecast.vue
 */
export default defineComponent({
  props: {
    systemForcastProps: {
      /**
       * Additional Forecast props that are not used by EMSSystemUtils
       */
      type: Object as PropType<CommonSystemForecastProps>,
    },
  },
});
