<template>
  <div v-resize="getInstancesCoordsThrottle" class="setpoint-optimizer-forecast-view">
    <div class="setpoint-optimizer-forecast-view__title">
      {{ $t("mlModel.SetpointOptimizer.mainView.forecastView") }}
    </div>
    <div v-if="numberOfPages.length > 1" class="d-flex justify-center">
      <NavigationTab
        v-for="page in numberOfPages.length"
        :key="page"
        :is-active="tab === page - 1"
        :tab-title="defineTabTitle(page, numberOfPages.length)"
        @click="tab = page - 1"
      />
    </div>

    <div :key="tab">
      <div ref="instancesCanvas" class="setpoint-optimizer-system-instances-grid">
        <div class="setpoint-optimizer-system-instances-grid__row">
          <div
            v-for="(systemInstance, systemInstanceIndex) in instancesTopLine"
            :key="systemInstanceIndex"
            :ref="systemInstance"
          >
            <SystemInstanceForecast
              v-if="isTabContentVisible"
              :actual-value="systemsForecastDataFiltered[systemInstance]"
              :current-preview-icon="currentPreviewIcon"
              :instance-canvas-center="instancesCanvasCenter"
              :instance-canvas-size="instancesCanvasSize"
              :instance-line-data="instancesCanvasLines[systemInstance]"
              :instance-line-ready="isDataForInstancesAnimatedLineReady"
              :system-colors="systemColors"
              :system-instance-data="systemData[systemInstance]"
              :system-instance-id="systemInstance"
              :system-instance-type="systemInstanceType"
              :points-in-one-line="true"
            />
          </div>
        </div>
        <div ref="instancesCentralEndpoint" class="setpoint-optimizer-system-instances-grid__row">
          <CentralEndpoint
            :central-endpoint-title="$t('mlModel.SetpointOptimizer.centralEndpoint')"
          />
        </div>
        <div
          v-if="instancesBottomLine.length > 0"
          class="setpoint-optimizer-system-instances-grid__row"
        >
          <div
            v-for="(systemInstance, systemInstanceIndex) in instancesBottomLine"
            :key="systemInstanceIndex"
            :ref="systemInstance"
          >
            <SystemInstanceForecast
              v-if="isTabContentVisible"
              :actual-value="systemsForecastDataFiltered[systemInstance]"
              :current-preview-icon="currentPreviewIcon"
              :instance-canvas-center="instancesCanvasCenter"
              :instance-canvas-size="instancesCanvasSize"
              :instance-line-data="instancesCanvasLines[systemInstance]"
              :instance-line-ready="isDataForInstancesAnimatedLineReady"
              :system-colors="systemColors"
              :system-instance-data="systemData[systemInstance]"
              :system-instance-id="systemInstance"
              :system-instance-type="systemInstanceType"
              preview-title-position="bottom"
              :points-in-one-line="true"
            />
          </div>
        </div>
      </div>
    </div>

    <div>
      <TimeSlider v-model="systemSlider" :items="timeSliderInitArr" />
    </div>
  </div>
</template>

<script lang="ts">
import { throttle } from "lodash";
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";
import CentralEndpoint from "@/ui/components/devices/components/EnergyParts/CentralEndpoint.vue";
import TimeSlider from "@/ui/components/devices/components/EnergyParts/TimeSlider.vue";
import SystemInstanceForecast from "@/ui/components/devices/mpc/SetpointOptimizer/system/components/SystemInstanceForecast.vue";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";

/**
 * Component that represent forecast view of setpoint optimizer system
 */
export default defineComponent({
  components: {
    SystemInstanceForecast,
    CentralEndpoint,
    NavigationTab,
    TimeSlider,
  },
  props: {
    forecastData: Object as PropType<any>,
    systemInstanceType: { default: null, type: String },
    systemData: Object as PropType<any>,
    systemCount: { default: null, type: Number },
    canvasSize: Object as PropType<any>,
    canvasCenter: Object as PropType<any>,
    lineData: Object as PropType<any>,
    lineReady: { default: false, type: Boolean },
    systemColors: Object as PropType<any>,
    isLineMovementReversed: { default: false, type: Boolean },
  },
  data() {
    const instancesCanvasLines: any = {};
    const instancesCanvasCenter: any = null;
    const instancesCanvasSize: any = null;

    return {
      systemSlider: 0,
      instancesCanvasSize,
      instancesCanvasCenter,
      instancesCanvasLines,
      tab: 0,
      isTabContentVisible: false,
      getInstancesCoordsThrottle: throttle(() => this.getInstancesCoords(), 500),
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    /**
     * Defines current system icon
     * @return {string} current icon
     */
    currentPreviewIcon() {
      return (
        {
          heating_air_systems: "heating_air",
          heating_water_systems: "hot-water",
          cooling_air_systems: "cooling_air",
          cooling_water_systems: "cold-water",
          hybrid_water_systems: "hybrid_water",
          hybrid_air_systems: "hybrid_air",
        } as any
      )[this.systemInstanceType];
    },
    /**
     * Collection of systems line movement directions
     */
    lineMovementSystems(): any {
      return {
        heating_air_systems: false,
        heating_water_systems: false,
        cooling_air_systems: false,
        cooling_water_systems: false,
        hybrid_water_systems: false, // value will be getter
        hybrid_air_systems: false, // value will be getter
      };
    },
    /**
     * Defines line movement direction for current system
     * @return {boolean} if true arrows moves in default direction else in opposite direction
     */
    lineMovement() {
      return this.lineMovementSystems[this.systemInstanceType];
    },
    /**
     * Checks all system instances and define general active status for system
     * @return {boolean} is system active status
     */
    isSystemActive() {
      const arr: any = Object.values(this.systemData).map((instance: any) => instance.status);
      const vars: any = arr.map((variable: string) => this.measurements.get(variable));
      return vars.some((el: any) => el);
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    allSystemsArray() {
      return Object.keys(this.systemData);
    },
    /**
     * Groups the number of items in a group of 10
     * @return {array} [[1, 2, ... 10], [1, 2, 3, 4]]
     */
    numberOfPages() {
      if (this.allSystemsArray.length > 10) {
        const clone: any = [...this.allSystemsArray];
        const arr: any = [];
        while (clone.length) {
          arr.push(clone.splice(0, 10));
        }
        return arr;
      } else {
        return [this.allSystemsArray];
      }
    },
    instancesTopLine() {
      return this.numberOfPages[this.tab].slice(0, 5);
    },
    instancesBottomLine() {
      return this.numberOfPages[this.tab].slice(5, 10);
    },
    /**
     * Load line if all coords and sizes ready
     * @return {boolean} load line status
     */
    isDataForInstancesAnimatedLineReady() {
      return (
        !!this.instancesCanvasSize &&
        !!this.instancesCanvasCenter &&
        !!Object.values(this.instancesCanvasLines)
      );
    },
    timeSliderInitArr() {
      if (this.forecastData) {
        return Object.values(this.forecastData)[0];
      }
      return [];
    },
    /**
     * Return system instance values relative to the selected value on the slider
     * @return {object} Example: { "heating_air_systems1": [ 1649856600, 0 ], "hybrid_water_systems1": [ 1649856600, 0 ] }
     */
    systemsForecastDataFiltered() {
      let obj = {};
      Object.entries(this.forecastData).forEach((system: any) => {
        const res = system[1][this.systemSlider] || [null, null];
        obj = { ...obj, ...{ [system[0]]: res } };
      });
      return obj;
    },
  },
  watch: {
    tab: [
      {
        handler: "onTabChange",
      },
    ],
  },
  async created() {
    this.tab = 0;
    this.isTabContentVisible = true;
    await this.$nextTick();
    this.getInstancesCoords();
  },
  methods: {
    /**
     * Creates range for navigation tab name
     * @param {number} page index of current page
     * @param {number} lastPage index of last page in list
     */
    defineTabTitle(page: number, lastPage: number) {
      const start: any = page * 10 - 9;
      const end: any = page * 10;
      const isCurrentPageLast: boolean = page === lastPage;
      const allSystemsCount: any = this.allSystemsArray?.length;
      return `${start} - ${isCurrentPageLast ? allSystemsCount : end}`;
    },
    /**
     * Defines coordinates of systems, central endpoint.
     * Use vm.$refs to retrieve references to elements.
     * Then it goes through the list of references and creates an options object for each one.
     */
    getInstancesCoords() {
      const central: any = this.$refs.instancesCentralEndpoint;
      const actualViewRef: any = this.$refs.instancesCanvas;
      this.instancesCanvasSize = {
        width: actualViewRef?.clientWidth,
        height: actualViewRef?.clientHeight,
      };
      this.instancesCanvasCenter = {
        x: central.offsetLeft + central.offsetWidth / 2,
        y: central.offsetTop + central.offsetHeight / 2,
        w: central.offsetWidth,
        h: central.offsetHeight,
      };

      [...this.instancesTopLine, ...this.instancesBottomLine].forEach((system: any) => {
        const target: any = this.$refs[system];
        if (!target.length) return;

        this.instancesCanvasLines[system] = {
          key: system,
          x: target[0].offsetLeft + target[0].offsetWidth / 2,
          y: target[0].offsetTop + target[0].offsetHeight / 2,
          w: target[0].offsetWidth,
          h: target[0].offsetHeight,
        };
      });
    },
    async onTabChange(val: number) {
      this.isTabContentVisible = false;
      await this.$nextTick();
      this.getInstancesCoords();
      this.isTabContentVisible = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.setpoint-optimizer-forecast-view {
  &__title {
    text-align: center;
    font-size: 20px;
  }

  .setpoint-optimizer-system-instances-grid {
    display: flex;
    flex-direction: column;
    position: relative;

    &__row {
      min-height: 150px;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }
}
</style>
