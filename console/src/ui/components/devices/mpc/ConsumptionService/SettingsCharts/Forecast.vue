<template>
  <div>
    <BaseChart :key="rerenderKey" v-bind="{ ...chartData }" :is-preview="isPreview" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ChartColors from "@/ui/components/devices/charts/charts/ChartColors";
import BaseChart from "@/ui/components/devices/mpc/components/BaseChart.vue";

/**
 * Component that represent forecast chart.
 */
export default defineComponent({
  components: {
    BaseChart,
  },
  props: {
    mpcId: [Object, String],
    chartsScaling: [Object, Number, String],
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const mpc: any = null;
    const timer: any = null;

    return {
      timer,
      rerenderKey: 0,
      mpc,
    };
  },
  computed: {
    chartColors() {
      return ChartColors.colors(this.$vuetify.theme.current.dark);
    },
    charts() {
      if (this.mpc) {
        return this.mpc?.data?.meta.charts;
      }
      return null;
    },
    /**
     * Converts time to milliseconds for every item of predictedEnergy array
     */
    predictedEnergy() {
      if (this.charts?.predictedEnergy) {
        return this.charts.predictedEnergy.pv.map((el: any) => [el[0] * 1000, el[1]]);
      } else {
        return [];
      }
    },
    /**
     * Converts time to milliseconds for every item of predictedPower array
     */
    predictedPower() {
      if (this.charts?.predictedPower) {
        return this.charts.predictedPower.pv.map((el: any) => [el[0] * 1000, el[1]]);
      } else {
        return [];
      }
    },
    /**
     * Prepares series for chart
     */
    seriesForecast() {
      return [
        {
          name: this.$t(
            "mlModel.ConsumptionService.settingsView.chartLabels.forecast.predictedEnergy",
          ),
          type: "line",
          yAxis: 0,
          color: this.chartColors[0],
          data: this.predictedEnergy,
        },
        {
          name: this.$t(
            "mlModel.ConsumptionService.settingsView.chartLabels.forecast.predictedPower",
          ),
          type: "line",
          yAxis: 1,
          color: this.chartColors[1],
          data: this.predictedPower,
        },
      ];
    },
    /**
     * Prepares Y-axis for chart
     */
    yAxisForecast() {
      return [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 1,
          min: 0 - this.chartsScaling * 20,
          max: this.chartsScaling * 20,
          lineColor: this.chartColors[0],
          labels: {
            format: "{value} kWh",
            style: {
              color: this.chartColors[0],
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
          min: 0 - this.chartsScaling * 2,
          max: this.chartsScaling * 2,
          lineColor: this.chartColors[1],
          labels: {
            format: "{value} kW",
            style: {
              color: this.chartColors[1],
            },
          },
        },
      ];
    },
    chartData() {
      return {
        chartType: "line",
        chartWidth: null,
        chartHeight: 700,
        series: this.seriesForecast,
        yAxis: this.yAxisForecast,
      };
    },
  },
  async mounted() {
    if (!this.isPreview) {
      this.mpc = await this.fetchMPCData(this.mpcId);
      this.fetchChartData();
    }
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    /**
     * Updates chart data every 90 seconds
     */
    fetchChartData() {
      this.timer = setInterval(async () => {
        this.mpc = await this.fetchMPCData(this.mpcId);
        this.rerenderKey += 1;
      }, 900000);
    },
    fetchMPCData(payload: any): any {
      return this.$store.dispatch("mpc/fetchMPCData", payload);
    },
  },
});
</script>

<style lang="scss"></style>
