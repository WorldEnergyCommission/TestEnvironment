<template>
  <div ref="canvas" class="setpoint-optimizer-main-view">
    <!--  Setpoint Optimizer systems grid  -->

    <div class="setpoint-optimizer-main-view__row">
      <div v-for="(system, systemIndex) in heatingGroup" :key="systemIndex" :ref="system">
        <System
          :canvas-center="canvasCenter"
          :canvas-size="canvasSize"
          :forecast-data="forecastData"
          :line-data="canvasLines[system]"
          :line-ready="loadLine"
          :mpc-id="mpcId"
          :system-colors="systemsSchemas[system].colors"
          :system-count="systemsData[system].count"
          :system-data="systemsData[system].components"
          :system-instance-type="system"
          :is-preview="isPreview"
          @handle-update-m-p-c="$emit('handleUpdateMPC')"
        />
      </div>
    </div>

    <div class="setpoint-optimizer-main-view__row">
      <div
        ref="hybrid_air_systems"
        :class="{ 'system-wrapper': !systemsData['hybrid_air_systems'].count }"
      >
        <System
          v-if="systemsData['hybrid_air_systems'].count"
          :canvas-center="canvasCenter"
          :canvas-size="canvasSize"
          :forecast-data="forecastData"
          :line-data="canvasLines['hybrid_air_systems']"
          :line-ready="loadLine"
          :mpc-id="mpcId"
          :system-colors="systemsSchemas['hybrid_air_systems'].colors"
          :system-count="systemsData['hybrid_air_systems'].count"
          :system-data="systemsData['hybrid_air_systems'].components"
          system-instance-type="hybrid_air_systems"
          :is-preview="isPreview"
          @handle-update-m-p-c="$emit('handleUpdateMPC')"
        />
      </div>
      <div ref="centralEndpoint">
        <CentralEndpoint
          :central-endpoint-title="$t('mlModel.SetpointOptimizer.centralEndpoint')"
          :is-preview="isPreview"
        />
      </div>
      <div
        ref="hybrid_water_systems"
        :class="{ 'system-wrapper': !systemsData['hybrid_water_systems'].count }"
      >
        <System
          v-if="systemsData['hybrid_water_systems'].count"
          :canvas-center="canvasCenter"
          :canvas-size="canvasSize"
          :forecast-data="forecastData"
          :line-data="canvasLines['hybrid_water_systems']"
          :line-ready="loadLine"
          :mpc-id="mpcId"
          :system-colors="systemsSchemas['hybrid_water_systems'].colors"
          :system-count="systemsData['hybrid_water_systems'].count"
          :system-data="systemsData['hybrid_water_systems'].components"
          system-instance-type="hybrid_water_systems"
          :is-preview="isPreview"
          @handle-update-m-p-c="$emit('handleUpdateMPC')"
        />
      </div>
    </div>

    <div class="setpoint-optimizer-main-view__row">
      <div v-for="(system, systemIndex) in collingGroup" :key="systemIndex" :ref="system">
        <System
          :canvas-center="canvasCenter"
          :canvas-size="canvasSize"
          :forecast-data="forecastData"
          :line-data="canvasLines[system]"
          :line-ready="loadLine"
          :mpc-id="mpcId"
          :system-colors="systemsSchemas[system].colors"
          :system-count="systemsData[system].count"
          :system-data="systemsData[system].components"
          :system-instance-type="system"
          :is-preview="isPreview"
          @handle-update-m-p-c="$emit('handleUpdateMPC')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useElementSize } from "@vueuse/core";
import { throttle } from "lodash";
import { defineComponent, PropType, ref } from "vue";

import { RootState } from "@/store/types";
import CentralEndpoint from "@/ui/components/devices/components/EnergyParts/CentralEndpoint.vue";
import System from "@/ui/components/devices/mpc/SetpointOptimizer/system/index.vue";

/**
 * Component that represent main view of Setpoint Optimizer
 */
export default defineComponent({
  components: {
    System,
    CentralEndpoint,
  },
  props: {
    systemsData: Object as PropType<any>,
    forecastData: Object as PropType<any>,
    mpcId: [Object, String],
    isPreview: { default: false, type: Boolean },
  },
  setup() {
    const canvas = ref(null);
    const centralEndpoint = ref(null);
    const { width, height } = useElementSize(canvas);

    return {
      canvas,
      centralEndpoint,
      containerWidth: width,
      containerHeight: height,
    };
  },
  data() {
    const canvasLines: any = {};
    const canvasCenter: any = null;
    const canvasSize: any = null;

    return {
      canvasSize,
      canvasCenter,
      canvasLines,
      systemsList: [
        "heating_air_systems",
        "heating_water_systems",
        "cooling_air_systems",
        "cooling_water_systems",
        "hybrid_water_systems",
        "hybrid_air_systems",
      ],
      getCoordsThrottle: throttle(() => this.getCoords(), 500),
    };
  },
  computed: {
    mpcState() {
      return (this.$store.state as RootState).mpc;
    },
    systemsSchemas() {
      return this.mpcState.mlModelTypes.SetpointOptimizer.systems;
    },
    groups() {
      return this.mpcState.mlModelTypes.SetpointOptimizer.groups;
    },
    heatingGroup() {
      const { systems } = this.groups.heating;
      return systems.filter((system: any) => this.systemsData[system].count);
    },
    collingGroup() {
      const { systems } = this.groups.cooling;
      return systems.filter((system: any) => this.systemsData[system].count);
    },
    /**
     * Load line if all coords and sizes ready
     * @return {boolean} load line status
     */
    loadLine() {
      return !!this.canvasSize && !!this.canvasCenter && !!Object.values(this.canvasLines);
    },
  },
  watch: {
    containerWidth: [{ handler: "getCoords" }],
    containerHeight: [{ handler: "getCoords" }],
  },
  mounted() {
    this.getCoords();
  },
  methods: {
    /**
     * Defines coordinates of systems, central endpoint.
     * Use vm.$refs to retrieve references to elements.
     * Then it goes through the list of references and creates an options object for each one.
     */
    async getCoords() {
      await this.$nextTick();
      const central: any = this.$refs.centralEndpoint;
      const actualViewRef: any = this.$refs.canvas;
      this.canvasSize = { width: actualViewRef?.clientWidth, height: actualViewRef?.clientHeight };
      this.canvasCenter = {
        x: central.offsetLeft + central.offsetWidth / 2,
        y: central.offsetTop + central.offsetHeight / 2,
        w: central.offsetWidth,
        h: central.offsetHeight,
      };
      this.systemsList.forEach((system: string) => {
        const target: any = this.$refs[system];
        if (!target) return;

        if (Array.isArray(target)) {
          this.canvasLines[system] = {
            key: system,
            x: target[0].offsetLeft + target[0].offsetWidth / 2,
            y: target[0].offsetTop + target[0].offsetHeight / 2,
            w: target[0].offsetWidth,
            h: target[0].offsetHeight,
          };
        } else {
          this.canvasLines[system] = {
            key: system,
            x: target.offsetLeft + target.offsetWidth / 2,
            y: target.offsetTop + target.offsetHeight / 2,
            w: target.offsetWidth,
            h: target.offsetHeight,
          };
        }
      });
    },
  },
});
</script>

<style lang="scss">
.setpoint-optimizer-main-view {
  height: 650px;
  display: flex;
  flex-direction: column;

  &__row {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;

    &:last-of-type {
      .system-count {
        top: 80px !important;
      }
    }
  }
}
</style>
