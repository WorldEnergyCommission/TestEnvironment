<template>
  <CoreCard class="chart-rounded projectBackground column-chart-diff-preview">
    <div class="h-100">
      <div class="chart-wrapper__header">
        {{ chartTitle }}
      </div>
      <DeviceDescription v-bind="{ description }" />
    </div>
    <highcharts ref="hc" :constructor-type="'stockChart'" :options="chartOptionMod" />
  </CoreCard>
</template>

<script lang="ts">
import * as Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
import { Chart } from "highcharts-vue";
import { defineComponent, PropType } from "vue";

import DeviceDescription from "@/ui/components/devices/actions/DeviceDescription.vue";

stockInit(Highcharts);

export default defineComponent({
  components: {
    highcharts: Chart,
    DeviceDescription,
  },
  props: {
    chartWidth: Number,
    multipleLines: {
      type: Boolean,
    },
    columnViewType: {
      type: String,
    },
    chartTitle: {
      default: "Column chart",
      type: String,
    },
  },
  data() {
    return {
      series: [
        {
          name: "Temperature",
          type: "column",
          yAxis: 0,
          color: "#0037FF",
          data: [
            [951861600000, 1200],
            [951948000000, 2000],
            [952034400000, 900],
            [952120800000, 1950],
            [952207200000, 600],
            [952293600000, 600],
            [952380000000, 1900],
            [952466400000, 800],
            [952552800000, 1900],
            [952639200000, 800],
            [952725600000, 1750],
            [952812000000, 500],
            [952898400000, 500],
            [952984800000, 1700],
            [953071200000, 1000],
          ],
        },
        {
          name: "Temperature 2",
          type: "column",
          yAxis: 1,
          color: "#00ff73",
          data: [
            [951861600000, 1000],
            [951948000000, 2000],
            [952034400000, 800],
            [952120800000, 650],
            [952207200000, 800],
            [952293600000, 300],
            [952380000000, 800],
            [952466400000, 1500],
            [952552800000, 1600],
            [952639200000, 1100],
            [952725600000, 1650],
            [952812000000, 1500],
            [952898400000, 700],
            [952984800000, 1400],
            [953071200000, 1300],
          ],
        },
      ],
      yAxis: [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          min: 0,
          max: 2000,
          lineColor: "#0037FF",
          labels: {
            format: "{value} kW",
            style: {
              color: "#0037FF",
            },
          },
        },
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 0,
          min: 0,
          max: 2000,
          lineColor: "#00ff73",
          labels: {
            format: "{value} kW",
            style: {
              color: "#00ff73",
            },
          },
        },
      ],
    };
  },
  computed: {
    chartOptionMod() {
      return {
        chart: {
          animation: false,
          backgroundColor: this.$vuetify.theme.current.colors.projectBackground,
          width: this.chartWidth || null,
        },
        exporting: {
          enabled: false,
        },
        rangeSelector: {
          enabled: false,
        },
        navigator: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        plotOptions: {
          column: {
            stacking: this.columnViewType || null,
          },
        },
        legend: {
          enabled: true,
          itemStyle: {
            color: this.$vuetify.theme.current.dark ? "#ffffff" : "#000000",
          },
        },
        xAxis: {},
        yAxis: this.multipleLines ? this.yAxis : [this.yAxis[0]],
        series: this.multipleLines ? this.series : [this.series[0]],
      };
    },
    description() {
      return this.$tm("chartsDescription.ColumnChart2");
    },
  },
});
</script>

<style lang="scss">
.column-chart-diff-preview {
  background-color: rgba(0, 0, 0, 0) !important;
}
</style>
