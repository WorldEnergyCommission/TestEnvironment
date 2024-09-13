<template>
  <div class="deviceBackground">
    <SystemsNavigation
      :is-list-items-plural="false"
      :items="systemSchema"
      class="pt-2"
      @handle-current-chart="handleCurrentChart($event)"
    />

    <div v-if="currentSystemInstanceRoomTemperaturesArray" class="d-flex justify-center">
      <div v-for="(item, index) in currentSystemInstanceRoomTemperaturesArray" :key="index">
        <CoreButton button-type="terciary" size="x-small" @click="handleRoomTemperature(index)">
          <span>{{ $t("mlModel.SetpointOptimizer.charts.navigation.temperatures") }}:</span>
          <span class="pl-1">{{ defineNameForRoomTemperaturesButton(index) }}</span>
        </CoreButton>
      </div>
    </div>

    <div v-if="currentSystemInstanceRoomTemperaturesArray" class="content pt-2">
      <MLModelLynusChartWrapper
        :key="currentRoomTemperatureIndex + reRenderKey"
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
 * Component that represent chart Room Temperatures.
 */
export default defineComponent({
  components: {
    SystemsNavigation,
    MLModelLynusChartWrapper,
  },
  mixins: [Utils],
  props: {
    systemsMappings: Object as PropType<any>,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const currentSystem: any = {
      system: null,
      instances: [],
    };

    return {
      reRenderKey: 0,
      currentRoomTemperatureIndex: 0,
      currentSystem,
    };
  },
  computed: {
    currentSystemInstanceRoomTemperatures() {
      const { system, instances } = this.currentSystem;
      if (system) {
        const instanceName = instances[0];
        const { room_temperatures } = this.systemsMappings[system].components[instanceName];

        return room_temperatures;
      }
      return null;
    },
    /**
     * Division of group systems into subgroups depending on the value of the separator.
     */
    currentSystemInstanceRoomTemperaturesArray() {
      if (this.currentSystemInstanceRoomTemperatures) {
        return this.divisionIntoEqualParts(
          "_",
          this.currentSystemInstanceRoomTemperatures,
          9,
          true,
        );
      }
      return null;
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
        this.divisionIntoEqualParts(el[0], el[1].components, 1),
      );
    },
    /**
     * Creates an understandable object for the graphs component
     */
    currentChartData() {
      const array =
        this.currentSystemInstanceRoomTemperaturesArray[this.currentRoomTemperatureIndex];
      const chartOptions = array.map((temp: any, inx: number) => {
        // define name for option
        const getName = () => {
          const systemInstance = this.currentSystem.instances[0];
          const systemName =
            this.systemsMappings[this.currentSystem.system].components[systemInstance].name;
          const variableName: any =
            this.currentSystemInstanceRoomTemperatures[temp]?.title ||
            this.currentSystemInstanceRoomTemperatures[temp]?.variable;
          return `${systemName}: ${variableName}`;
        };
        return {
          agg: "last",
          name: getName(),
          scaling: {
            min: 0,
            max: 60,
          },
          seriesType: "View",
          type: "line",
          unit: "°C",
          var: this.currentSystemInstanceRoomTemperatures[temp].variable,
        };
      });

      return {
        title: null,
        data: {
          chartTitle: "Chart title",
          chartData: {
            name: "",
            data: {
              chartOptions,
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
    this.currentSystem = this.initFirstSystemByDefault(this.systemSchema);
  },
  methods: {
    handleCurrentChart({ system, arr }: any) {
      this.currentRoomTemperatureIndex = 0;
      this.currentSystem = { system, instances: arr };
      this.reRenderKey += 1;
    },
    /**
     * Creates an understandable object for the graphs component
     */
    defineNameForRoomTemperaturesButton(inx: number) {
      const numberOfItems = this.currentSystemInstanceRoomTemperaturesArray[inx].length;
      const first = inx * 9 + 1;
      const last = first + numberOfItems - 1;
      return `${first}${last === first ? "" : `-${last}`}`;
    },
    handleRoomTemperature(inx: number) {
      this.currentRoomTemperatureIndex = inx;
    },
  },
});
</script>

<style lang="scss" scoped></style>
