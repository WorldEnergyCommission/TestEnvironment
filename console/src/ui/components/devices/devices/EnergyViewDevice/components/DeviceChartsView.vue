<template>
  <div class="energy-device-charts-view deviceBackground">
    <!-- Menu Bar -->
    <div class="d-flex justify-center">
      <div class="d-flex flex-wrap py-2 justify-center">
        <div v-for="(item, index) in menuItems" :key="index">
          <CoreMenu max-height="35">
            <template #activator="{ props }">
              <NavigationTab
                :is-active="item === selectedMenuItem"
                :tab-title="$t(`devices.EnergyView.ChartsWindow.menuButtons.${item}`)"
                v-bind="props"
                @click="changeChartObject(item)"
              />
            </template>
          </CoreMenu>
        </div>
      </div>
    </div>
    <!-- Chart -->
    <div v-if="selectedMenuItem !== ''">
      <Chart
        :key="selectedMenuItem"
        :chart-data="getChartData"
        :show-device-actions="false"
        :is-preview="isPreview"
        class="deviceBackground"
        @handle-autarkiegrad="handleChange"
      />
    </div>
    <div v-if="selectedMenuItem === 'pvSystem' && autarchy">
      <span class="pr-2">{{ $t("mlModel.EMS.charts.autarchy") }}:</span>
      <span>{{ autarchyValid }}%</span>
    </div>
    <div v-if="selectedMenuItem === 'pvSystem' && !autarchy">
      <CircleSpinner :size="20" color="accent" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import Chart from "@/ui/components/devices/charts/charts/index.vue";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";

export default defineComponent({
  components: {
    Chart,
    CircleSpinner,
    NavigationTab,
  },
  props: {
    mappingsList: {
      type: Object as PropType<Record<string, any>>,
    },
    systemsMappings: Object as PropType<any>,
    socMapping: Object as PropType<any>,
    metaData: Object as PropType<any>,
    isPreview: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    const chartObjectBase: any = {
      data: {
        // new chart mappings + options all at once
        chartOptions: [
          {
            name: "Sum History",
            seriesType: "Calculation",
            type: "line",
            agg: "avg",
            scaling: {
              max: undefined,
              min: undefined,
            },
            unit: "kW",
            calculation: {
              expression: "",
              aggregations: [],
            },
          },
        ],
        type: "chart",
        selectedStackingOptions: undefined,
        selectedWidth: "full",
      },
    };
    const autarchy = undefined as any;
    const chartPeriodConfig: any = undefined;
    const menuItems: string[] = [];

    return {
      menuItems,
      chartPeriodConfig,
      autarchy,
      selectedMenuItem: "",
      chartObjectBase,
    };
  },
  computed: {
    getChartData() {
      if (this.isPreview) {
        return this.mockChartData();
      } else {
        return this.chartObjectBase;
      }
    },
    autarchyValid() {
      if (!this.autarchy) return null;
      else {
        if (this.autarchy.autarchy_score > 100) return 100;
        if (this.autarchy.autarchy_score < 0) return 0;
        return this.autarchy.autarchy_score;
      }
    },
  },
  watch: {
    socMapping: [
      {
        handler: "handleMappingsListChange",
      },
    ],
    systemsMappings: [
      {
        handler: "handleMappingsListChange",
      },
    ],
    mappingsList: [
      {
        handler: "handleMappingsListChange",
      },
    ],
  },
  created() {
    this.getMenuItems();
    this.changeChartObject(this.menuItems[0]);
  },
  methods: {
    mockChartData() {
      let currentChartOptions: any = [];
      if (this.selectedMenuItem === "difference") {
        currentChartOptions = [
          {
            agg: "first",
            name: "PV Production",
            scaling: {
              max: "40",
              min: "0",
            },
            seriesType: "View",
            type: "line",
            unit: "kW",
            var: "",
          },
          {
            agg: "first",
            name: "Consumption",
            scaling: {
              max: "40",
              min: "0",
            },
            seriesType: "View",
            type: "line",
            unit: "kW",
            var: "",
          },
          {
            agg: "first",
            name: "Grid",
            scaling: {
              max: "40",
              min: "0",
            },
            seriesType: "View",
            type: "line",
            unit: "kW",
            var: "",
          },
        ];
      } else {
        currentChartOptions = [
          {
            agg: "first",
            name: "Sum History",
            scaling: {
              max: "40",
              min: "0",
            },
            seriesType: "View",
            type: "line",
            unit: "kW",
            var: "",
          },
        ];
      }
      const currentData = {
        data: {
          chartOptions: currentChartOptions,
          selectedStackingOptions: "normal",
          selectedWidth: "full",
          type: "chart",
        },
        created_at: "2024-02-01T07:43:33.554983Z",
      };
      return currentData;
    },
    handleChange(val: any) {
      this.chartPeriodConfig = val;
      const keysAuarkieGrad = ["pvSystem", "grid", "battery"];
      if (!this.isPreview) {
        this.loadAutarkieGrad(keysAuarkieGrad);
      }
    },
    /**
     * Loads the right Buttons for the Menu based on the MappingsList.
     */
    getMenuItems() {
      this.menuItems = Object.entries(this.mappingsList as Record<string, any>)
        // filter only items that should be shown
        .filter((element) => element[1] === true && element[0] !== "ShowEvent")
        // take the key of those items
        .map((element) => element[0]);

      // add default difference to MenuItems
      this.menuItems.push("difference");
    },
    changeChartObject(item: string) {
      if (item === "battery") {
        this.chartObjectBase.data.chartOptions[0] = {
          name: this.$t("devices.EnergyView.ChartsWindow.legendSum"),
          seriesType: "Calculation",
          type: "line",
          agg: "avg",
          scaling: {
            max: undefined,
            min: undefined,
          },
          unit: "kW",
          calculation: {
            expression: "",
            aggregations: [],
          },
        };
        this.chartObjectBase.data.chartOptions[1] = {
          name: this.$t("devices.EnergyView.ChartsWindow.legendBatterySoc"),
          seriesType: "Calculation",
          type: "line",
          agg: "avg",
          scaling: {
            max: 100,
            min: 0,
          },
          unit: "%",
          calculation: {
            expression: "",
            aggregations: [],
          },
        };
      } else if (item === "difference") {
        this.chartObjectBase.data.chartOptions[0] = {
          name: this.$t("devices.EnergyView.ChartsWindow.differencePV"),
          seriesType: "Calculation",
          type: "area",
          agg: "avg",
          scaling: {
            max:
              this.metaData.maxPerformanceProducer !== undefined
                ? this.metaData.maxPerformanceProducer
                : 20,
            min:
              this.metaData.maxPerformanceProducer !== undefined
                ? this.metaData.maxPerformanceProducer * -1
                : -20,
          },
          unit: "kW",
          calculation: {
            expression: "",
            aggregations: [],
          },
        };
        this.chartObjectBase.data.chartOptions[2] = {
          name: this.$t("devices.EnergyView.ChartsWindow.differenceGrid"),
          seriesType: "Calculation",
          type: "area",
          agg: "avg",
          scaling: {
            max:
              this.metaData.maxPowerConsumtion !== undefined
                ? this.metaData.maxPowerConsumtion
                : 20,
            min:
              this.metaData.maxPowerConsumtion !== undefined
                ? this.metaData.maxPowerConsumtion * -1
                : -20,
          },
          unit: "kW",
          calculation: {
            expression: "",
            aggregations: [],
          },
        };
        this.chartObjectBase.data.chartOptions[1] = {
          name: this.$t("devices.EnergyView.ChartsWindow.differenceBoth"),
          seriesType: "Calculation",
          type: "area",
          agg: "avg",
          scaling: {
            max:
              this.metaData.sizePowerConnection !== undefined
                ? this.metaData.sizePowerConnection
                : 20,
            min:
              this.metaData.sizePowerConnection !== undefined
                ? this.metaData.sizePowerConnection * -1
                : -20,
          },
          unit: "kW",
          calculation: {
            expression: "",
            aggregations: [],
          },
        };
      } else {
        this.chartObjectBase.data.chartOptions = [
          {
            name: this.$t("devices.EnergyView.ChartsWindow.legendSum"),
            seriesType: "Calculation",
            type: "line",
            agg: "avg",
            scaling: {
              max: undefined,
              min: undefined,
            },
            unit: "kW",
            calculation: {
              expression: "",
              aggregations: [],
            },
          },
        ];
      }

      if (item !== "difference") {
        this.fillAggregations(item);
        this.generateExpression(item);
      } else {
        this.aggregationsDifferenceBase("pvSystem", "grid");
        this.generateExpressionsDifferenceBase("pvSystem", "grid");

        const elementKeys = ["pvSystem", "generator", "battery", "grid"];

        this.generateAggDiffOverview(elementKeys);
        this.generateExpDiffOverview(elementKeys);

        const keysAuarkieGrad = ["pvSystem", "grid", "battery"];
        this.loadAutarkieGrad(keysAuarkieGrad);
      }
      this.selectedMenuItem = item;
    },
    async loadAutarkieGrad(keysAuarkieGrad: string[]) {
      this.autarchyScore = -1;
      let paramsString = "";
      let mappingsForKey;

      // load Params
      for (let i = 0; i < keysAuarkieGrad.length; i++) {
        mappingsForKey = false;
        if (
          keysAuarkieGrad[i] === "pvSystem" &&
          this.systemsMappings[keysAuarkieGrad[i]].length !== 0
        ) {
          // pv Part
          mappingsForKey = true;
        } else if (
          keysAuarkieGrad[i] === "grid" &&
          this.systemsMappings[keysAuarkieGrad[i]].length !== 0
        ) {
          // grid Part
          mappingsForKey = true;
        } else if (
          keysAuarkieGrad[i] === "battery" &&
          this.systemsMappings[keysAuarkieGrad[i]].length !== 0
        ) {
          // battery Part
          mappingsForKey = true;
        }

        if (mappingsForKey === true) {
          for (
            let arrIndex = 0;
            arrIndex < this.systemsMappings[keysAuarkieGrad[i]].length;
            arrIndex++
          ) {
            if (
              keysAuarkieGrad[i] === "pvSystem" &&
              this.systemsMappings[keysAuarkieGrad[i]].length !== 0
            ) {
              // pv Part
              paramsString = paramsString.concat("pv=");
            } else if (
              keysAuarkieGrad[i] === "grid" &&
              this.systemsMappings[keysAuarkieGrad[i]].length !== 0
            ) {
              // grid Part
              paramsString = paramsString.concat("grid=");
            } else if (
              keysAuarkieGrad[i] === "battery" &&
              this.systemsMappings[keysAuarkieGrad[i]].length !== 0
            ) {
              // battery Part
              paramsString = paramsString.concat("battery=");
            }
            paramsString = paramsString.concat(this.systemsMappings[keysAuarkieGrad[i]][arrIndex]);
            paramsString = paramsString.concat("&");
          }
        }
      }
      paramsString = paramsString.slice(0, -1);
      const params = paramsString;
      const { start, end } = this.chartPeriodConfig;
      try {
        this.autarchy = await this.$store.dispatch("mpc/fetchAutarkiegrad", {
          start,
          end,
          params,
        });
      } catch (error) {}
    },
    /**
     * Fills the aggregations Array with the right amount of Elements.
     * With the default Aggregation (last).
     */
    fillAggregations(mappingType: string) {
      // clears the aggregations Array so it allways has the right amount of entries
      if (this.chartObjectBase.data.chartOptions[0].calculation.aggregations.length !== 0) {
        this.chartObjectBase.data.chartOptions[0].calculation.aggregations = [];
      }

      Object.values(this.systemsMappings[mappingType]).forEach((element: any, index: number) => {
        this.chartObjectBase.data.chartOptions[0].calculation.aggregations.push("last");
      });

      if (mappingType === "battery") {
        Object.values(this.socMapping[mappingType]).forEach((element: any, index: number) => {
          this.chartObjectBase.data.chartOptions[1].calculation.aggregations.push("last");
        });
      }
    },
    /**
     * Fills the aggregations Array with the right amount of Elements. For PV and Grid
     * @param primaryMapping  string
     * @param secondaryMapping  string
     */
    aggregationsDifferenceBase(primaryMapping: string, secondaryMapping: string) {
      Object.values(this.systemsMappings[primaryMapping]).forEach((element: any, index: number) => {
        this.chartObjectBase.data.chartOptions[0].calculation.aggregations.push("last");
        // this.chartObjectBase.data.chartOptions[2].calculation.aggregations.push('last');
      });

      Object.values(this.systemsMappings[secondaryMapping]).forEach(
        (element: any, index: number) => {
          this.chartObjectBase.data.chartOptions[2].calculation.aggregations.push("last");
          // this.chartObjectBase.data.chartOptions[2].calculation.aggregations.push('last');
        },
      );
    },
    generateAggDiffOverview(elementKeys: string[]) {
      for (let i = 0; i < elementKeys.length; i++) {
        Object.values(this.systemsMappings[elementKeys[i]]).forEach(
          (element: any, index: number) => {
            this.chartObjectBase.data.chartOptions[1].calculation.aggregations.push("last");
          },
        );
      }
    },
    /**
     * Generates the Expression for the ChartObject based on the SystemMappings
     */
    generateExpression(mappingType: string) {
      let tempExpressionString = "";

      for (let i = 0; i < this.systemsMappings[mappingType].length; i++) {
        tempExpressionString = tempExpressionString.concat(this.systemsMappings[mappingType][i]);
        if (i !== this.systemsMappings[mappingType].length - 1) {
          tempExpressionString = tempExpressionString.concat(" + ");
        }
      }

      this.chartObjectBase.data.chartOptions[0].calculation.expression = tempExpressionString;

      if (mappingType === "battery") {
        tempExpressionString = "";
        for (let i = 0; i < this.socMapping[mappingType].length; i++) {
          tempExpressionString = tempExpressionString.concat(this.socMapping[mappingType][i]);
          if (i !== this.systemsMappings[mappingType].length - 1) {
            tempExpressionString = tempExpressionString.concat(" + ");
          }
        }
        this.chartObjectBase.data.chartOptions[1].calculation.expression = tempExpressionString;
      }
    },
    /**
     * Fills the aggregations Array with the right amount of Elements. And creates a third array with the sum of both Arrays
     * @param primaryMapping  string
     * @param secondaryMapping  string
     */
    generateExpressionsDifferenceBase(primaryMapping: string, secondaryMapping: string) {
      let tempExpressionString = "";
      // part primary Mapping
      for (let i = 0; i < this.systemsMappings[primaryMapping].length; i++) {
        tempExpressionString = tempExpressionString.concat(this.systemsMappings[primaryMapping][i]);
        if (i !== this.systemsMappings[primaryMapping].length - 1) {
          tempExpressionString = tempExpressionString.concat(" + ");
        }
      }
      this.chartObjectBase.data.chartOptions[0].calculation.expression = tempExpressionString;
      tempExpressionString = "";

      // part secondary Mapping
      for (let i = 0; i < this.systemsMappings[secondaryMapping].length; i++) {
        tempExpressionString = tempExpressionString.concat(
          this.systemsMappings[secondaryMapping][i],
        );
        if (i !== this.systemsMappings[secondaryMapping].length - 1) {
          tempExpressionString = tempExpressionString.concat(" + ");
        }
      }
      this.chartObjectBase.data.chartOptions[2].calculation.expression = tempExpressionString;
      tempExpressionString = "";
    },
    generateExpDiffOverview(elementKeys: string[]) {
      let tempExpressionString = "";

      for (let index = 0; index < elementKeys.length; index++) {
        if (index < elementKeys.length - 1) {
          for (let i = 0; i < this.systemsMappings[elementKeys[index]].length; i++) {
            tempExpressionString = tempExpressionString.concat(
              this.systemsMappings[elementKeys[index]][i],
            );
            tempExpressionString = tempExpressionString.concat(" + ");
          }
        } else {
          for (let i = 0; i < this.systemsMappings[elementKeys[index]].length; i++) {
            tempExpressionString = tempExpressionString.concat(
              this.systemsMappings[elementKeys[index]][i],
            );
            if (i !== this.systemsMappings[elementKeys[index]].length - 1) {
              tempExpressionString = tempExpressionString.concat(" + ");
            }
          }
        }
      }
      this.chartObjectBase.data.chartOptions[1].calculation.expression = tempExpressionString;
    },
    handleMappingsListChange() {
      this.selectedMenuItem = "";
      this.changeChartObject(this.menuItems[0]);
      // eslint-disable-next-line prefer-destructuring
      this.selectedMenuItem = this.menuItems[0];
    },
  },
});
</script>
