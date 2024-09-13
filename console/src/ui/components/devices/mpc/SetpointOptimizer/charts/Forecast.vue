<template>
  <div class="deviceBackground">
    <SystemsNavigation
      :is-list-items-plural="false"
      :items="systemsInstancesArrayList"
      class="pt-2"
      @handle-current-chart="handleCurrentChart($event)"
    />

    <div v-if="currentChart.system" class="content pt-2">
      <BaseChart :key="reRenderKey" v-bind="{ ...currentChartData }" :is-preview="isPreview" />
    </div>
    <div v-else>
      {{ $t(`mlModel.EMS.charts.noDevicesConfigured`) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ChartColors from "@/ui/components/devices/charts/charts/ChartColors";
import BaseChart from "@/ui/components/devices/mpc/components/BaseChart.vue";
import { Utils } from "@/ui/components/devices/mpc/SetpointOptimizer/charts/utils";
import SystemsNavigation from "@/ui/components/devices/mpc/SetpointOptimizer/components/SystemsNavigation.vue";

/**
 * Component that represent forecast charts.
 */
export default defineComponent({
  components: {
    BaseChart,
    SystemsNavigation,
  },
  mixins: [Utils],
  props: {
    predictedSetpoint: Object as PropType<any>,
    systemsMappings: Object as PropType<any>,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const systemsUnits: any = {
      heating_air_systems: {
        predicted_setpoint: "°C",
      },
      heating_water_systems: {
        predicted_setpoint: "°C",
      },
      cooling_air_systems: {
        predicted_setpoint: "°C",
      },
      cooling_water_systems: {
        predicted_setpoint: "°C",
      },
      hybrid_water_systems: {
        predicted_setpoint: "°C",
      },
      hybrid_air_systems: {
        predicted_setpoint: "°C",
      },
    };
    const currentChart: any = {
      system: null,
      instances: [],
    };
    const variablesContainers: any = {
      predicted_setpoint: "predictedSetpoint",
    };
    const systemsVars: any = {
      heating_air_systems: ["predicted_setpoint"],
      heating_water_systems: ["predicted_setpoint"],
      cooling_air_systems: ["predicted_setpoint"],
      cooling_water_systems: ["predicted_setpoint"],
      hybrid_water_systems: ["predicted_setpoint"],
      hybrid_air_systems: ["predicted_setpoint"],
    };

    return {
      reRenderKey: 0,
      systemsVars,
      variablesContainers,
      currentChart,
      systemsUnits,
    };
  },
  computed: {
    /**
     * Collection of systems scaling
     */
    systemsScaling(): any {
      return {
        heating_air_systems: {
          predicted_setpoint: { min: 0, max: 100 },
        },
        heating_water_systems: {
          predicted_setpoint: { min: 0, max: 100 },
        },
        cooling_air_systems: {
          predicted_setpoint: { min: 0, max: 100 },
        },
        cooling_water_systems: {
          predicted_setpoint: { min: 0, max: 100 },
        },
        hybrid_water_systems: {
          predicted_setpoint: { min: 0, max: 100 },
        },
        hybrid_air_systems: {
          predicted_setpoint: { min: 0, max: 100 },
        },
      };
    },
    themeChartColors() {
      return ChartColors.colors(this.$vuetify.theme.current.dark);
    },
    /**
     * Creates series, Y-axis for chart
     */
    currentChartData() {
      const series: any = this.currentChart.instances.map((instance: any, inx: number) => {
        return this.systemsVars[this.currentChart.system].map((variable: any) => {
          const data: any = (this as any)[this.variablesContainers[variable]][instance].map(
            (d: any) => [d[0] * 1000, d[1]],
          );

          const systemInstanceName: string =
            this.systemsMappings[this.currentChart.system].components[instance].name;
          const getName = () => {
            const variableName: any = this.$t(
              "mlModel.SetpointOptimizer.charts.variables.predicted_setpoint",
            );
            return `${systemInstanceName}: ${variableName}`;
          };
          return {
            name: getName(),
            type: "line",
            yAxis: 0,
            color: null, // will add later
            data,
          };
        });
      });
      const seriesColors = series.flat().map((serie: any, inx: number) => {
        serie.color = this.themeChartColors[inx];
        return serie;
      });

      const yAxis: any = this.currentChart.instances
        .slice(0, 1)
        .map((instance: any, inx: number) => {
          return this.systemsVars[this.currentChart.system].map((variable: any) => {
            return {
              title: null,
              opposite: false,
              showFirstLabel: true,
              showLastLabel: true,
              endOnTick: false,
              gridLineWidth: 0,
              ...this.systemsScaling[this.currentChart.system][variable],
              lineColor: this.themeChartColors[inx], // will added later
              labels: {
                format: `{value} ${this.systemsUnits[this.currentChart.system][variable]}`,
                style: {
                  color: "#949494",
                },
              },
            };
          });
        });
      const yAxisColors = yAxis.flat().map((axis: any, inx: number) => {
        axis.lineColor = this.themeChartColors[inx];
        axis.gridLineWidth = !inx ? 1 : 0;
        return axis;
      });
      return {
        chartType: "line",
        chartWidth: null,
        chartHeight: 400,
        series: seriesColors,
        yAxis: yAxisColors,
      };
    },
    /**
     * Creates array of systems groups and system instances.
     * @return {array} list of system groups. Example: ['system', [['system1', 'system2']]]
     */
    systemsInstancesArrayList() {
      const filteredSystems = Object.entries(this.systemsMappings).filter((system: any) =>
        this.systems.some((el: any) => el === system[0] && system[1].count),
      );
      return filteredSystems.map((el: any) =>
        this.divisionIntoEqualParts(el[0], el[1].components, 9),
      );
    },
  },
  mounted() {
    this.currentChart = this.initFirstSystemByDefault(this.systemsInstancesArrayList);
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
