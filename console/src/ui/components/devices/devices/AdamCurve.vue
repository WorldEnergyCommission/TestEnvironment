<template>
  <div class="adam-curve">
    <DeviceCardWrapper>
      <template #title>
        {{ deviceData?.name }}
      </template>
      <template #actions>
        <DeviceActions :device="deviceData" @chart-change="onChange" />
      </template>
      <template #content>
        <BaseChart
          :chart-data="chartData"
          :chart-height="423"
          :threshold-value="deviceData?.data?.threshold"
          :min-number-of-series-for-wide-chart="4"
          :show-total-of-series="true"
          :show-time-selection="false"
          :show-device-actions="false"
          :post-processor="postprocessor"
          :show-header="false"
        />
      </template>
    </DeviceCardWrapper>
    <div class="device-dnd-button">
      <slot name="dnd" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import BaseChart from "@/ui/components/devices/charts/charts/BaseChart.vue";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";

export default defineComponent({
  components: {
    BaseChart,
    DeviceCardWrapper,
    DeviceActions,
  },
  props: {
    deviceData: Object as PropType<IDevice>,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    return {
      backgroundColors: ["transparent", "transparent"],
      borderColors: ["red", "green"],
      names: ["regular", "savings"],
    };
  },
  computed: {
    chartOptions() {
      return Object.keys(this.deviceData.data.mappings)
        .map((key) => this.deviceData.data.mappings[key])
        .map((item, i) => {
          return {
            agg: "last",
            calculation: {
              aggregations: ["last"],
              expression: `${item} * ${i == 0 ? 1 : 0.8}`,
            },
            miss: "locf",
            name: this.names[i],
            scaling: {
              max: null,
              min: null,
            },
            unit: this.deviceData.data?.meta.unit || "",
            borderWidth: 8,
            pointRadius: -1,
            backgroundColor: this.backgroundColors[i],
            borderColor: this.borderColors[i],
            seriesType: "Calculation",
            type: "area",
          };
        })
        .filter((i) => !!i);
    },
    chartData() {
      return {
        ...this.deviceData,
        data: {
          interval: "15m",
          periodName: "day",
          selectedStackingOptions: "",
          selectedWidth: "full",
          type: "chart",
          chartOptions: this.chartOptions,
          scaleXMax: new Date().toISOString(),
        },
      };
    },
  },
  methods: {
    postprocessor(data: any[][]) {
      return data;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";
</style>
