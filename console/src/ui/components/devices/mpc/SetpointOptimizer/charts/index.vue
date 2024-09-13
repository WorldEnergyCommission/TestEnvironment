<template>
  <div class="setpoint-optimizer-charts">
    <CoreTabs :key="$i18n.locale" v-model="tab">
      <CoreTab v-for="(item, index) in items" :key="index">
        {{ item.title }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(item, index) in items" :key="`t-${index}`">
        <div v-if="index === tab">
          <component :is="item.view" v-bind="{ ...item.props }" :is-preview="isPreview" />
        </div>
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ChartControlVariables from "@/ui/components/devices/mpc/SetpointOptimizer/charts/ChartControlVariables.vue";
import ChartsRoomTemperatures from "@/ui/components/devices/mpc/SetpointOptimizer/charts/ChartsRoomTemperatures.vue";
import Forecast from "@/ui/components/devices/mpc/SetpointOptimizer/charts/Forecast.vue";

/**
 * Component that represent wrapper for charts tabs navigation.
 * Used in Setpoint Optimizer.
 */
export default defineComponent({
  name: "SetpointOptimizerCharts",
  components: {
    ChartControlVariables,
    ChartsRoomTemperatures,
    Forecast,
  },
  props: {
    allDeviceData: Object as PropType<any>,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const tab: any = null;

    return {
      tab,
    };
  },
  computed: {
    predictedSetpoint() {
      return this.allDeviceData.data.meta?.charts?.predictedSetpoint;
    },
    /**
     * Gets all systems from controllerMappings
     * @return {object} collection of systems
     */
    systemsMappings() {
      const {
        heating_air_systems,
        heating_water_systems,
        cooling_air_systems,
        cooling_water_systems,
        hybrid_water_systems,
        hybrid_air_systems,
      } = this.allDeviceData.data.meta.controllerMappings;
      return {
        heating_air_systems,
        heating_water_systems,
        cooling_air_systems,
        cooling_water_systems,
        hybrid_water_systems,
        hybrid_air_systems,
      };
    },
    /**
     * Tabs for navigation.
     */
    items() {
      return [
        {
          id: "chartsRoomTemperatures",
          title: this.$t("mlModel.SetpointOptimizer.charts.navigation.chartsRoomTemperatures"),
          view: "ChartsRoomTemperatures",
          props: {
            systemsMappings: this.systemsMappings,
          },
        },
        {
          id: "chartControlVariables",
          title: this.$t("mlModel.SetpointOptimizer.charts.navigation.chartControlVariables"),
          view: "ChartControlVariables",
          props: {
            systemsMappings: this.systemsMappings,
          },
        },
        {
          id: "forecast",
          title: this.$t("mlModel.SetpointOptimizer.charts.navigation.forecast"),
          view: "Forecast",
          props: {
            predictedSetpoint: this.predictedSetpoint,
            systemsMappings: this.systemsMappings,
          },
        },
      ];
    },
  },
});
</script>

<style lang="scss" scoped>
.setpoint-optimizer-charts {
  min-height: 650px;
}
</style>
