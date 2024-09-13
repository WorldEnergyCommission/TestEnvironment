<template>
  <div>
    <CoreTabs :key="$i18n.locale" v-model="tab">
      <CoreTab v-for="(item, index) in items" :key="index">
        {{ item.title }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(item, index) in items" :key="`t-${index}`">
        <div v-if="index === tab" class="charts-prod-const-content-wrapper">
          <component
            :is="item.component"
            v-bind="{ ...item.data }"
            :is-preview="isPreview"
            @handle-autarkiegrad="handleAutarkiegrad"
          />
          <div v-if="item.id === 'pvPower'" class="autakiegrad">
            <div class="pr-2">
              {{ $t("mlModel.EMS.charts.autarchy") }}
            </div>
            <div v-if="autarchy">{{ autarchyValid }} %</div>
            <CircleSpinner v-else :size="20" color="accent" />
          </div>
        </div>
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";

/**
 * Component that represent chart Production/Consumption.
 */
export default defineComponent({
  components: {
    MLModelLynusChartWrapper,
    CircleSpinner,
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
  data() {
    const autarchy: any = null;

    return {
      tab: null,
      autarchy,
    };
  },
  computed: {
    autarchyValid() {
      if (!this.autarchy) return null;
      else {
        if (this.autarchy.autarchy_score > 100) return 100;
        if (this.autarchy.autarchy_score < 0) return 0;
        return this.autarchy.autarchy_score;
      }
    },
    /**
     * Prepares chart options for Actual Power
     */
    pvActualPower() {
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
     * Prepares chart options for Calculated Power
     */
    pvCalculatedPower() {
      const list: any = Object.keys(this.systemsMappings.pv.components);
      const aggregations: any = list.map((el: string) => "avg");
      const expression: any = list.map((el: string) => `${el}.${this.mpcId}.pow`).join(" + ");
      return {
        aggregations,
        expression,
      };
    },
    /**
     * Prepares chart options for consumption power
     */
    consumptionActualPower() {
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
    consumptionCalculatedPower() {
      return `con.${this.mpcId}.pow`;
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
     * List of charts.
     */
    items() {
      return [
        {
          title: this.$t("mlModel.EMS.charts.chartProdConst.powerPV.title"),
          id: "pvPower",
          component: "MLModelLynusChartWrapper",
          data: {
            chartTitle: "Power PV",
            chartHeight: 550,
            chartWrapperHeight: 700,
            chartData: {
              name: "",
              data: {
                chartOptions: [
                  {
                    calculation: this.pvActualPower,
                    name: this.$t("mlModel.EMS.charts.chartProdConst.powerPV.actualPVPower"),
                    scaling: {
                      min: 0,
                      max: typeof this.pvScaling === "number" ? this.pvScaling * 2 : null,
                    },
                    seriesType: "Calculation",
                    type: "line",
                    unit: "kW",
                  },
                  {
                    calculation: this.pvCalculatedPower,
                    name: this.$t("mlModel.EMS.charts.chartProdConst.powerPV.calculatedPVPower"),
                    scaling: {
                      min: 0,
                      max: typeof this.pvScaling === "number" ? this.pvScaling * 2 : null,
                    },
                    seriesType: "Calculation",
                    type: "line",
                    unit: "kW",
                  },
                ],
                selectedStackingOptions: "normal",
                selectedWidth: "full",
                type: "chart",
              },
            },
            navigationItemsToExclude: [],
          },
        },
        {
          title: this.$t("mlModel.EMS.charts.chartProdConst.powerConsumption.title"),
          id: "consumptionPower",
          component: "MLModelLynusChartWrapper",
          data: {
            chartTitle: "Power Consumption",
            chartHeight: 600,
            chartWrapperHeight: 750,
            chartData: {
              name: "",
              data: {
                chartOptions: [
                  {
                    calculation: this.consumptionActualPower,
                    name: this.$t("mlModel.EMS.charts.chartProdConst.powerConsumption.actualPower"),
                    scaling: {
                      min:
                        typeof this.consumptionScaling === "number"
                          ? 0 - this.consumptionScaling * 2
                          : null,
                      max:
                        typeof this.consumptionScaling === "number"
                          ? this.consumptionScaling * 2
                          : null,
                    },
                    seriesType: "Calculation",
                    type: "line",
                    unit: "kW",
                  },
                  {
                    agg: "avg",
                    name: this.$t(
                      "mlModel.EMS.charts.chartProdConst.powerConsumption.calculatedPower",
                    ),
                    scaling: {
                      min:
                        typeof this.consumptionScaling === "number"
                          ? 0 - this.consumptionScaling * 2
                          : null,
                      max:
                        typeof this.consumptionScaling === "number"
                          ? this.consumptionScaling * 2
                          : null,
                    },
                    seriesType: "View",
                    type: "line",
                    unit: "kW",
                    var: this.consumptionCalculatedPower,
                  },
                ],
                selectedStackingOptions: "normal",
                selectedWidth: "full",
                type: "chart",
              },
            },
            navigationItemsToExclude: [],
          },
        },
      ];
    },
    /**
     * Define parameters for Autarkiegrad request.
     * @return {string} params for request. Example: grid=1&grid=2
     */
    paramsForAutarkiegrad() {
      const systems = ["grid", "battery", "pv"];
      const filteredByNeededSystems: any = Object.entries(this.systemsMappings).filter(
        (group: any) => systems.some((el: any) => el === group[0]),
      );
      const allVariables: any = filteredByNeededSystems.map((system: any) =>
        Object.values(system[1].components).map((el: any) => `${system[0]}=${el.power}`),
      );
      const allVarsFlat: any = allVariables.reduce((acc: any, el: any) => acc.concat(el), []);
      return allVarsFlat.length ? allVarsFlat.join("&") : null;
    },
  },
  methods: {
    /**
     * Define parameters for Autarkiegrad request.
     * @return {string} params for request. Example: grid=1&grid=2
     */
    async handleAutarkiegrad(period: any) {
      if (period && !this.isPreview) {
        this.autarchy = null;
        const { start, end } = period;
        const params = this.paramsForAutarkiegrad;
        this.autarchy = await this.$store.dispatch("mpc/fetchAutarkiegrad", { start, end, params });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.charts-prod-const-content-wrapper {
  position: relative;

  .autakiegrad {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex;
    align-items: center;
  }
}
</style>
