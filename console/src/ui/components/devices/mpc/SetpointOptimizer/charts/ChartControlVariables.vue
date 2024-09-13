<template>
  <div class="deviceBackground">
    <SystemsNavigation
      :is-list-items-plural="false"
      :items="systemSchema"
      class="pt-2"
      @handle-current-chart="handleCurrentChart($event)"
    />

    <div v-if="currentChart.system" class="content pt-2">
      <MLModelLynusChartWrapper
        :key="reRenderKey"
        v-bind="{ ...currentChartData.data }"
        :is-preview="isPreview"
      />
    </div>
    <div v-else>
      {{ $t(`mlModel.EMS.charts.noDevicesConfigured`) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";
import { Utils } from "@/ui/components/devices/mpc/SetpointOptimizer/charts/utils";
import SystemsNavigation from "@/ui/components/devices/mpc/SetpointOptimizer/components/SystemsNavigation.vue";

/**
 * Component that represent chart System Temperatures.
 */
export default defineComponent({
  components: {
    MLModelLynusChartWrapper,
    SystemsNavigation,
  },
  mixins: [Utils],
  props: {
    systemsMappings: Object as PropType<any>,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const systemsUnits: any = {
      heating_air_systems: {
        flow_temperature: "°C",
        return_temperature: "°C",
      },
      heating_water_systems: {
        flow_temperature: "°C",
        return_temperature: "°C",
      },
      cooling_air_systems: {
        flow_temperature: "°C",
        return_temperature: "°C",
      },
      cooling_water_systems: {
        flow_temperature: "°C",
        return_temperature: "°C",
      },
      hybrid_water_systems: {
        flow_temperature: "°C",
        return_temperature: "°C",
      },
      hybrid_air_systems: {
        flow_temperature: "°C",
        return_temperature: "°C",
      },
    };
    // current systems
    const currentChart: any = {
      system: null,
      instances: [],
    };
    const systemsVars: any = {
      heating_air_systems: ["flow_temperature", "return_temperature"],
      heating_water_systems: ["flow_temperature", "return_temperature"],
      cooling_air_systems: ["flow_temperature", "return_temperature"],
      cooling_water_systems: ["flow_temperature", "return_temperature"],
      hybrid_water_systems: ["flow_temperature", "return_temperature"],
      hybrid_air_systems: ["flow_temperature", "return_temperature"],
    };

    return {
      reRenderKey: 0,
      systemsVars,
      currentChart,
      systemsUnits,
    };
  },
  computed: {
    /** getter define flow,
     * return temperatures for water systems and replace it on supply,
     * exhaust temperatures for air systems */
    systemsVarsTranslation(): any {
      const flow_temperature = this.$t(
        "mlModel.SetpointOptimizer.charts.variables.flow_temperature",
      );
      const return_temperature = this.$t(
        "mlModel.SetpointOptimizer.charts.variables.return_temperature",
      );
      const supply_air_temperature = this.$t(
        "mlModel.SetpointOptimizer.charts.variables.supply_air_temperature",
      );
      const exhaust_air_temperature = this.$t(
        "mlModel.SetpointOptimizer.charts.variables.exhaust_air_temperature",
      );
      return {
        heating_air_systems: {
          flow_temperature: supply_air_temperature,
          return_temperature: exhaust_air_temperature,
        },
        heating_water_systems: {
          flow_temperature,
          return_temperature,
        },
        cooling_air_systems: {
          flow_temperature: supply_air_temperature,
          return_temperature: exhaust_air_temperature,
        },
        cooling_water_systems: {
          flow_temperature,
          return_temperature,
        },
        hybrid_water_systems: {
          flow_temperature,
          return_temperature,
        },
        hybrid_air_systems: {
          flow_temperature: supply_air_temperature,
          return_temperature: exhaust_air_temperature,
        },
      };
    },
    /**
     * Collection of systems scaling
     */
    systemsScaling(): any {
      return {
        heating_air_systems: {
          flow_temperature: { min: 0, max: 100 },
          return_temperature: { min: 0, max: 100 },
        },
        heating_water_systems: {
          flow_temperature: { min: 0, max: 100 },
          return_temperature: { min: 0, max: 100 },
        },
        cooling_air_systems: {
          flow_temperature: { min: 0, max: 100 },
          return_temperature: { min: 0, max: 100 },
        },
        cooling_water_systems: {
          flow_temperature: { min: 0, max: 100 },
          return_temperature: { min: 0, max: 100 },
        },
        hybrid_water_systems: {
          flow_temperature: { min: 0, max: 100 },
          return_temperature: { min: 0, max: 100 },
        },
        hybrid_air_systems: {
          flow_temperature: { min: 0, max: 100 },
          return_temperature: { min: 0, max: 100 },
        },
      };
    },
    /**
     * Creates array of systems groups and system instances.
     * @return {array} list of system groups. Example: ['battery', [['battery1', 'battery2']]]
     */
    systemSchema() {
      const filteredSystems = Object.entries(this.systemsMappings).filter((system: any) =>
        this.systems.some((el: any) => el === system[0] && system[1].count),
      );
      return filteredSystems.map((el: any) =>
        this.divisionIntoEqualParts(el[0], el[1].components, 4),
      );
    },
    /**
     * Creates an understandable object for the graphs component
     */
    currentChartData() {
      const chartOptions = this.currentChart.instances.map((instance: any) => {
        return this.systemsVars[this.currentChart.system].map((variable: any) => {
          const getName = () => {
            const systemName =
              this.systemsMappings[this.currentChart.system].components[instance].name;
            const variableName = this.systemsVarsTranslation[this.currentChart.system][variable];
            return `${systemName}: ${variableName}`;
          };
          return {
            agg: "last",
            name: getName(),
            scaling: this.systemsScaling[this.currentChart.system][variable],
            seriesType: "View",
            type: "line",
            unit: this.systemsUnits[this.currentChart.system][variable],
            var: this.systemsMappings[this.currentChart.system].components[instance][variable],
          };
        });
      });

      return {
        title: null,
        data: {
          chartTitle: "Chart title",
          chartData: {
            name: "",
            data: {
              chartOptions: chartOptions.flat(),
              selectedStackingOptions: "normal",
              selectedWidth: "full",
              type: "chart",
            },
          },
          navigationItemsToExclude: [],
        },
      };
    },
  },
  mounted() {
    this.currentChart = this.initFirstSystemByDefault(this.systemSchema);
  },
  methods: {
    handleCurrentChart({ system, arr }: any) {
      this.currentChart = { system, instances: arr };
      this.reRenderKey += 1;
    },
  },
});
</script>

<style lang="scss" scoped></style>
