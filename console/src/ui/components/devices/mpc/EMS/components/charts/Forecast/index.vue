<template>
  <div>
    <CoreTabs :key="$i18n.locale" v-model="tab">
      <CoreTab v-for="(item, index) in items" :key="index">
        {{ item.title }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(item, index) in items" :key="`t-${index}`">
        <div v-if="index === tab">
          <component
            :is="item.component"
            :mpc-id="mpcId"
            :predicted-power="predictedPower"
            :predicted-target-power="predictedTargetPower"
            :predicted-s-o-c="predictedSOC"
            :scaling="scaling"
            :systems-mappings="systemsMappings"
            v-bind="{ ...item.data }"
          />
        </div>
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ChartColors from "@/ui/components/devices/charts/charts/ChartColors";
import BaseChart from "@/ui/components/devices/mpc/components/BaseChart.vue";
import TimeTable from "@/ui/components/devices/mpc/EMS/components/charts/Forecast/TimeTable.vue";

/**
 * Component that represent wrapper for forecast charts tabs navigation.
 * Used in EMS.
 */
export default defineComponent({
  components: {
    BaseChart,
    TimeTable,
  },
  props: {
    systemsMappings: Object as PropType<any>,
    predictedPower: Object as PropType<any>,
    predictedTargetPower: Object as PropType<any>,
    predictedEnergy: Object as PropType<any>,
    predictedSOC: Object as PropType<any>,
    mpcId: [Object, String],
    scaling: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  data() {
    const tab: any = null;

    return {
      tab,
    };
  },
  computed: {
    chartColors() {
      return ChartColors.colors(this.$vuetify.theme.current.dark);
    },
    pvScaling() {
      return this.scaling?.pv;
    },
    consumptionScaling() {
      return this.scaling?.consumption;
    },
    /**
     * Converts predictedEnergy data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    pvPredictedEnergy() {
      const pvInstancesList = Object.keys(this.systemsMappings.pv.components);
      const pvInstances = Object.entries(this.predictedEnergy)
        .filter((system: any) => pvInstancesList.some((el: any) => el === system[0]))
        .map((el: any) => el[1]);

      const res: any = !pvInstances.length
        ? []
        : pvInstances[0].map((el: any, inx: number) => {
            const sum: any = pvInstances
              .map((list: any) => list[inx][1])
              .reduce((a: number, b: number) => a + b);
            return [el[0] * 1000, +sum.toFixed(2)];
          });

      return res;
    },
    /**
     * Converts predictedPower data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    pvPredictedPower() {
      const pvInstancesList = Object.keys(this.systemsMappings.pv.components);
      const pvInstances = Object.entries(this.predictedPower)
        .filter((system: any) => pvInstancesList.some((el: any) => el === system[0]))
        .map((el: any) => el[1]);

      const res: any = !pvInstances.length
        ? []
        : pvInstances[0].map((el: any, inx: number) => {
            const sum: any = pvInstances
              .map((list: any) => list[inx][1])
              .reduce((a: number, b: number) => a + b);
            return [el[0] * 1000, +sum.toFixed(2)];
          });

      return res;
    },
    /**
     * Prepares series for chart
     */
    pvSeriesForecast() {
      return [
        {
          name: this.$t(
            "mlModel.PVProductionService.settingsView.chartLabels.forecast.predictedEnergy",
          ),
          type: "line",
          yAxis: 0,
          color: this.chartColors[0],
          data: this.pvPredictedEnergy,
        },
        {
          name: this.$t(
            "mlModel.PVProductionService.settingsView.chartLabels.forecast.predictedPower",
          ),
          type: "line",
          yAxis: 1,
          color: this.chartColors[1],
          data: this.pvPredictedPower,
        },
      ];
    },
    /**
     * Prepares Y-axis for chart
     */
    pvYAxisForecast() {
      return [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 1,
          min: 0,
          max: typeof this.pvScaling === "number" ? this.pvScaling * 12 : null,
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
          min: 0,
          max: typeof this.pvScaling === "number" ? this.pvScaling * 2 : null,
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
    /**
     * Combine all prepared data in chart options object
     */
    pvForecastData() {
      return {
        chartType: "line",
        chartWidth: null,
        chartHeight: 600,
        series: this.pvSeriesForecast,
        yAxis: this.pvYAxisForecast,
      };
    },
    /**
     * Converts predictedEnergy data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    consumptionPredictedEnergy() {
      if (this.predictedEnergy?.consumption) {
        return this.predictedEnergy.consumption.map((el: any) => [el[0] * 1000, el[1]]);
      } else {
        return [];
      }
    },
    /**
     * Converts predictedPower data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    consumptionPredictedPower() {
      if (this.predictedPower?.consumption) {
        return this.predictedPower.consumption.map((el: any) => [el[0] * 1000, el[1]]);
      } else {
        return [];
      }
    },
    /**
     * Prepares series for chart
     */
    consumptionSeriesForecast() {
      return [
        {
          name: this.$t(
            "mlModel.ConsumptionService.settingsView.chartLabels.forecast.predictedEnergy",
          ),
          type: "line",
          yAxis: 0,
          color: this.chartColors[0],
          data: this.consumptionPredictedEnergy,
        },
        {
          name: this.$t(
            "mlModel.ConsumptionService.settingsView.chartLabels.forecast.predictedPower",
          ),
          type: "line",
          yAxis: 1,
          color: this.chartColors[1],
          data: this.consumptionPredictedPower,
        },
      ];
    },
    /**
     * Prepares Y-axis for chart
     */
    consumptionYAxisForecast() {
      return [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 1,
          min:
            typeof this.consumptionScaling === "number" ? 0 - this.consumptionScaling * 20 : null,
          max: typeof this.consumptionScaling === "number" ? this.consumptionScaling * 20 : null,
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
          min: typeof this.consumptionScaling === "number" ? 0 - this.consumptionScaling * 2 : null,
          max: typeof this.consumptionScaling === "number" ? this.consumptionScaling * 2 : null,
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
    /**
     * Combine all prepared data in chart options object
     */
    consumptionForecastData() {
      return {
        chartType: "line",
        chartWidth: null,
        chartHeight: 600,
        series: this.consumptionSeriesForecast,
        yAxis: this.consumptionYAxisForecast,
      };
    },
    /**
     * Converts predictedPower data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    sumPredictedPVPower() {
      const pvInstancesList = Object.keys(this.systemsMappings.pv.components);
      const pvInstances = Object.entries(this.predictedPower)
        .filter((system: any) => pvInstancesList.some((el: any) => el === system[0]))
        .map((el: any) => el[1]);

      const res: any = !pvInstances.length
        ? []
        : pvInstances[0].map((el: any, inx: number) => {
            const sum: any = pvInstances
              .map((list: any) => list[inx][1])
              .reduce((a: number, b: number) => a + b);
            return [el[0] * 1000, +sum.toFixed(2)];
          });

      return res;
    },
    /**
     * Converts predictedPower data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    predictedConsumption() {
      const { consumption } = this.predictedPower;
      return consumption ? consumption.map((el: any) => [el[0] * 1000, el[1]]) : [];
    },
    /**
     * Converts predictedPower data to show in chart.
     * @return {array} [[timestamp, value], [timestamp, value]]
     */
    predictedGrid() {
      const gridInstancesList = Object.keys(this.systemsMappings.grid.components);
      const gridInstances = Object.entries(this.predictedPower)
        .filter((system: any) => gridInstancesList.some((el: any) => el === system[0]))
        .map((el: any) => el[1]);

      const res: any = gridInstances[0].map((el: any, inx: number) => {
        const sum: any = gridInstances
          .map((list: any) => list[inx][1])
          .reduce((a: number, b: number) => a + b);
        return [el[0] * 1000, +sum.toFixed(2)];
      });

      return res;
    },
    /**
     * Prepares series for chart
     */
    differenceSeriesForecast() {
      return [
        {
          name: this.$t("mlModel.EMS.charts.forecast.difference.predictedPVPower"),
          type: "area",
          yAxis: 0,
          color: this.chartColors[0],
          data: this.sumPredictedPVPower,
        },
        {
          name: this.$t("mlModel.EMS.charts.forecast.difference.predictedConsumption"),
          type: "area",
          yAxis: 1,
          color: this.chartColors[1],
          data: this.predictedConsumption,
        },
        {
          name: this.$t("mlModel.EMS.charts.forecast.difference.predictedGrid"),
          type: "area",
          yAxis: 2,
          color: this.chartColors[2],
          data: this.predictedGrid,
        },
      ];
    },
    /**
     * Prepares Y-axis for chart
     */
    differenceYAxisForecast() {
      return [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 1,
          min: typeof this.pvScaling === "number" ? 0 - this.consumptionScaling * 2 : null,
          max: typeof this.pvScaling === "number" ? this.consumptionScaling * 2 : null,
          lineColor: this.chartColors[0],
          labels: {
            format: "{value} kW",
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
          min: typeof this.pvScaling === "number" ? 0 - this.consumptionScaling * 2 : null,
          max: typeof this.pvScaling === "number" ? this.consumptionScaling * 2 : null,
          lineColor: this.chartColors[1],
          labels: {
            format: "{value} kW",
            style: {
              color: this.chartColors[1],
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
          min: typeof this.pvScaling === "number" ? 0 - this.consumptionScaling * 2 : null,
          max: typeof this.pvScaling === "number" ? this.consumptionScaling * 2 : null,
          lineColor: this.chartColors[2],
          labels: {
            format: "{value} kW",
            style: {
              color: this.chartColors[2],
            },
          },
        },
      ];
    },
    /**
     * Combine all prepared data in chart options object
     */
    differenceForecastData() {
      return {
        chartType: "line",
        chartWidth: null,
        chartHeight: 600,
        series: this.differenceSeriesForecast,
        yAxis: this.differenceYAxisForecast,
      };
    },
    /**
     * Tabs for navigation
     */
    items() {
      return [
        {
          title: this.$t("mlModel.EMS.charts.forecast.pv.title"),
          component: "BaseChart",
          data: this.pvForecastData,
        },
        {
          title: this.$t("mlModel.EMS.charts.forecast.consumption.title"),
          component: "BaseChart",
          data: this.consumptionForecastData,
        },
        {
          title: this.$t("mlModel.EMS.charts.forecast.difference.title"),
          component: "BaseChart",
          data: this.differenceForecastData,
        },
        {
          title: this.$t("mlModel.EMS.charts.forecast.timeTableConsumer.title"),
          component: "TimeTable",
        },
      ];
    },
  },
});
</script>

<style lang="scss" scoped></style>
