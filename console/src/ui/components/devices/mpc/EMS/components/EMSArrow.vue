<template>
  <AnimatedLine
    v-if="connected"
    :size="canvasSize"
    :point="point"
    :center="center"
    :color1="centerColor"
    :color2="pointColor"
    :from-point-to-center="fromPointToCenter"
    :is-line-active="sum && sum !== 0 ? true : false"
    :line-width="lineWidth"
    :points-in-one-line="pointsInOneLine"
  />
  <DisconnectedLine v-else :center="center" :point="point" :size="canvasSize" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import DisconnectedLine from "./DisconnectedLine.vue";
import { SystemData } from "../../../devices/EnergyViewDevice/EnergyViewSystems";
import { IVariablesState } from "@/store/modules/measurements/types";
import { RootState } from "@/store/types";
import AnimatedLine from "@/ui/components/devices/components/EnergyParts/AnimatedLine/index.vue";
import { Point, Size } from "@/ui/components/devices/components/EnergyParts/AnimatedLine/LineUtils";

export default defineComponent({
  components: {
    AnimatedLine,
    DisconnectedLine,
  },
  props: {
    connected: { default: true, type: Boolean },
    canvasSize: {
      type: Object as PropType<Size>,
    },
    center: {
      type: Object as PropType<Point>,
    },
    point: {
      type: Object as PropType<Point>,
    },
    fromPointToCenterDefault: {
      type: [Boolean, Number],
    },
    centerColor: {
      type: String,
    },
    defaultPointColor: {
      type: String,
    },
    alternativePointColor: {
      type: String,
    },
    active: {
      type: Boolean,
    },
    forecast: { default: false, type: Boolean },
    systemData: {
      type: Object as PropType<Record<string, SystemData>>,
    },
    //forecast props
    allSystemsForecastData: Object as PropType<any>,
    groupSliderState: { default: 0, type: Number },
    isPreview: {
      default: false,
      type: Boolean,
    },
    pointsInOneLine: { default: false, type: Boolean },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    pointColor() {
      if (
        (this.fromPointToCenterDefault && this.fromPointToCenter) ||
        (!this.fromPointToCenterDefault && !this.fromPointToCenter)
      ) {
        return this.alternativePointColor;
      }

      return this.defaultPointColor;
    },
    fromPointToCenter() {
      return this.fromPointToCenterDefault ? this.sum && this.sum > 0 : this.sum && this.sum < 0;
    },
    systemsForecastData() {
      // const currentSystemInstances = [...Array(this.systemCount).keys()].map();

      let obj = {};
      Object.keys(this.systemData!).forEach((system: string) => {
        obj = { ...obj, ...{ [system]: this.allSystemsForecastData[system] } };
      });
      return obj;
    },
    sumSystemsForecastDataFiltered() {
      return Object.values(this.systemsForecastData).map((system: any) => {
        if (!system || !system[this.groupSliderState]) {
          return [null, null];
        }
        return system[this.groupSliderState];
      });
    },
    sumForecast() {
      const values = Object.values(this.sumSystemsForecastDataFiltered).map((el: any) => el[1]);
      const checkEmpty = values.filter((el: any) => typeof el === "number");
      if (checkEmpty.length) {
        const num: any = values.reduce((a: number, b: number) => a + b);
        return +num.toFixed(2);
      } else {
        return 0;
      }
    },
    /**
     * Gets the total value of the systems power variable.
     * @return {number|null} sum of systems power
     */
    sumActual() {
      if (!this.systemData) return;
      const res = Object.values(this.systemData).map((item: any) => {
        if (this.isPreview) return Math.floor(Math.random() * 100);
        return this.measurementsState.measurements.get(item.power);
      });
      const filtered = res.filter((el: any) => typeof el === "number");
      return filtered.length ? (filtered.reduce((a: any, b: any) => a + b) as number) : null;
    },
    sum() {
      return this.forecast ? this.sumForecast : this.sumActual;
    },
    lineWidth() {
      return 2 + 10 * Math.min(1, Math.abs(this.sum ?? 0) / 100);
    },
  },
});
</script>
