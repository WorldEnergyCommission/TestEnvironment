<template>
  <div class="chart-difference">
    <MLModelLynusChartWrapper
      :chart-data="chartData.chartOptions"
      :chart-height="chartData.chartHeight"
      :chart-title="chartData.title"
      :chart-wrapper-height="740"
      :navigation-items-to-exclude="chartData.navigationItemsToExclude"
      :is-preview="isPreview"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";

/**
 * Component that represent chart Self Consumption.
 */
export default defineComponent({
  components: {
    MLModelLynusChartWrapper,
  },
  props: {
    systemsMappings: Object as PropType<any>,
    mpcId: [Object, String],
    scaling: {
      type: Object as PropType<any>,
      required: true,
    },
    isPreview: { default: false, type: Boolean },
  },
  computed: {
    /**
     * Prepares chart options for PV Power
     */
    sumPVPower() {
      const list: any = Object.keys(this.systemsMappings.pv.components);
      const aggregations: any = list.map((el: string) => "avg");
      const expression: any = list
        .map((el: string) => this.systemsMappings.pv.components[el].power)
        .join(" + ");

      return {
        aggregations,
        expression,
      };
    },
    /**
     * Prepares chart options for Power Consumption
     */
    sumOfAllPowerConsumption() {
      const systems = ["grid", "battery", "pv", "generator"];
      const filteredByNeededSystems: any = Object.entries(this.systemsMappings).filter(
        (group: any) => systems.some((el: any) => el === group[0]),
      );
      const allVariables: any = filteredByNeededSystems.map((system: any) =>
        Object.values(system[1].components).map((el: any) => el.power),
      );
      const allVarsFlat: any = allVariables.reduce((acc: any, el: any) => acc.concat(el), []);
      const aggregations: any = allVarsFlat.map((el: any) => "avg");
      const expression: any = allVarsFlat.length ? allVarsFlat.join(" + ") : null;
      return {
        aggregations,
        expression,
      };
    },
    /**
     * Prepares chart options for Grid
     */
    sumGrid() {
      const list: any = Object.keys(this.systemsMappings.grid.components);
      const aggregations: any = list.map((el: string) => "avg");
      const expression: any = list
        .map((el: string) => this.systemsMappings.grid.components[el].power)
        .join(" + ");

      return {
        aggregations,
        expression,
      };
    },
    pvScaling() {
      if (this.scaling?.pv) {
        return +this.scaling.pv;
      }
      return null;
    },
    consumptionScaling() {
      if (this.scaling?.consumption) {
        return +this.scaling.consumption;
      }
      return null;
    },
    /**
     * Prepares an option object understandable for the chart component.
     */
    chartOptions() {
      return {
        name: "",
        data: {
          chartOptions: [
            {
              calculation: this.sumPVPower,
              name: this.$t("mlModel.EMS.charts.chartDifference.pvProduction"),
              scaling: {
                min:
                  typeof this.consumptionScaling === "number"
                    ? 0 - this.consumptionScaling * 2
                    : null,
                max:
                  typeof this.consumptionScaling === "number" ? this.consumptionScaling * 2 : null,
              },
              seriesType: "Calculation",
              type: "area",
              unit: "kW",
            },
            {
              calculation: this.sumOfAllPowerConsumption,
              name: this.$t("mlModel.EMS.charts.chartDifference.consumption"),
              scaling: {
                min:
                  typeof this.consumptionScaling === "number"
                    ? 0 - this.consumptionScaling * 2
                    : null,
                max:
                  typeof this.consumptionScaling === "number" ? this.consumptionScaling * 2 : null,
              },
              seriesType: "Calculation",
              type: "area",
              unit: "kW",
            },
            {
              calculation: this.sumGrid,
              name: this.$t("mlModel.EMS.charts.chartDifference.grid"),
              scaling: {
                min:
                  typeof this.consumptionScaling === "number"
                    ? 0 - this.consumptionScaling * 2
                    : null,
                max:
                  typeof this.consumptionScaling === "number" ? this.consumptionScaling * 2 : null,
              },
              seriesType: "Calculation",
              type: "area",
              unit: "kW",
            },
          ],
          selectedStackingOptions: "normal",
          selectedWidth: "full",
          type: "chart",
        },
      };
    },
    chartData() {
      return {
        title: "difference",
        // locale: `${this.langPath}.chartMQTTTabs`,
        component: "chart",
        chartHeight: 600,
        chartOptions: this.chartOptions,
        navigationItemsToExclude: [],
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.chart-difference {
  background: rgb(var(--v-theme-deviceBackground));
}
</style>
