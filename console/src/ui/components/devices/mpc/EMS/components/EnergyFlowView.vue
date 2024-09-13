<template>
  <div ref="canvas" style="width: 100%; height: 100%; position: relative">
    <!-- lines from system to center -->
    <EMSArrow
      v-for="(group, systemIndex) in arrowGroups"
      :key="`${renderKey}_${systemIndex}_${group.key}_line`"
      :center="canvasCenter!"
      :center-color="blueHex"
      :default-point-color="group.defaultColor"
      :alternative-point-color="group.alternativeColor"
      :from-point-to-center-default="group.defaultMovement"
      :point="canvasLines[systemIndex]"
      :canvas-size="canvasSize!"
      :system-data="group.systems.components"
      :all-systems-forecast-data="allSystemsForecastData"
      :group-slider-state="groupSliderState"
      :forecast="wrapperType === 'Forecast'"
      style="pointer-events: none"
      :connected="!group.disconnected"
      :is-preview="isPreview"
    />

    <!-- system instance -->
    <div
      v-for="(group, systemIndex) in systemsGroups"
      :key="`${renderKey}_${systemIndex}_${group.key}_system`"
      :style="styleForIndex(systemIndex)"
    >
      <component
        :is="wrappendComponent"
        :system="group"
        :system-name="group"
        :system-forcast-props="{
          systemForecastTargetPower: allSystemsForecastTargetPower,
          allSystemsForecastData: allSystemsForecastData,
          groupSliderState: groupSliderState,
          systemName: group.key,
          systemTypeString: group.key,
        }"
        :system-props="{
          systemData: group.systems.components,
          systemCount: group.systems.count,
          disableSystemSettings: !isEMS || wrapperType == 'Forecast',
          systemTypeString: group.key,
          systemTitle: group.key,
        }"
        :battery-predicted-s-o-c="batteryPredictedSOC"
        :overlay="group.disconnected"
        :from-point-to-center-default="group.defaultMovement"
        :is-preview="isPreview"
      >
        <template v-if="wrapperType == 'Actual'" #instanceView="slotProps">
          <component
            :is="instanceViewIs(group.key)"
            :instance-canvas-center="slotProps.instancesCanvasCenter"
            :instance-canvas-size="slotProps.instancesCanvasSize"
            :instance-data="slotProps.systemData[slotProps.systemInstance]"
            :instance-line-data="slotProps.instancesCanvasLines[slotProps.systemInstance]"
            :instance-line-ready="slotProps.isDataForInstancesAnimatedLineReady"
            :system-type-string="group.key"
            :is-preview="isPreview"
          />
        </template>
      </component>
    </div>

    <!-- system count -->
    <CoreButton
      v-for="(group, systemIndex) in systemsGroups"
      :key="`${renderKey}_${systemIndex}_${group.key}_count`"
      color="lynusText"
      variant="outlined"
      size="x-small"
      button-type="standardIcon"
      :style="styleForIndex(systemIndex, offsetDeviceCount, (Math.PI * 18) / 40)"
      style="cursor: default"
    >
      {{ group.systems.count }}
    </CoreButton>

    <!--- system info (detached)-->
    <CoreTooltip
      v-for="group in infoGroups"
      :key="`${renderKey}_${group.index}_${group.key}_info`"
      location="bottom"
    >
      <template #activator="{ props }">
        <CoreButton
          button-type="standardIcon"
          v-bind="props"
          :style="styleForIndex(group.index, offsetDeviceCount, (Math.PI * 22) / 40)"
        >
          <CoreIcon color="accent"> fas fa-info </CoreIcon>
        </CoreButton>
      </template>
      <span> {{ group.info && $t(group.info) }} </span>
    </CoreTooltip>
    <div
      ref="centralEndpoint"
      class="d-flex align-center flex-column"
      style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"
    >
      <CentralEndpoint />
    </div>
  </div>
</template>

<script lang="ts">
import { useElementSize } from "@vueuse/core";
import { defineComponent, PropType, ref } from "vue";

import EMSSystem from "./systems/EMSSystem.vue";
import EMSSystemForecast from "./systems/EMSSystemForecast.vue";
import { IMeasurementGetter } from "@/store/modules/measurements/types";
import { Point, Size } from "@/ui/components/devices/components/EnergyParts/AnimatedLine/LineUtils";
import CentralEndpoint from "@/ui/components/devices/components/EnergyParts/CentralEndpoint.vue";
import {
  EMSSystemKeys,
  EMSSystemType,
  DeviceTypeKeys,
  SystemTypeString,
  mlSystemMappings,
  systemComponentMappings,
  defaultArrowMovementFromPointToCenter,
  alternativeColor,
  defaultColor,
  SystemData,
} from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";
import EMSArrow from "@/ui/components/devices/mpc/EMS/components/EMSArrow.vue";

// EMS System Instance Views for Acutal EMS View
import Battery from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/BatterySystemInstance.vue";
import BigConsumerSystem from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/BigConsumerSystemInstance.vue";
import ChargeStationSystem from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/ChargeStationSystemInstance.vue";
import ElectricHeating from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/ElectricHeatingSystemInstance.vue";
import Generator from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/GeneratorSystemInstance.vue";
import GridSystem from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/GridInstance.vue";
import PumpSystem from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/HeatingPumpSystemInstance.vue";
import HeatMeter from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/HeatMeterInstance.vue";
import HeatProducer from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/HeatProducerInstance.vue";
import HouseSystem from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/HouseSystemInstance.vue";
import PVSystem from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/PVSystemInstance.vue";

type SystemGroup = {
  key: SystemTypeString | EMSSystemType;
  systems: any;
  defaultMovement: boolean;
  defaultColor: string;
  alternativeColor: string;
  disconnected: boolean;
  info?: string;
};

type WrapperType = "Actual" | "Forecast";

export default defineComponent({
  components: {
    CentralEndpoint,
    EMSArrow,
    EMSSystemForecast,
    EMSSystem,

    PVSystem,
    Generator,
    Battery,
    ElectricHeating,
    GridSystem,
    HouseSystem,
    ChargeStationSystem,
    PumpSystem,
    BigConsumerSystem,
    HeatProducer,
    HeatMeter,
  },
  props: {
    wrapperType: {
      default: "Actual",
      type: String as PropType<WrapperType>,
    },
    isEMS: { default: false, type: Boolean },
    allSystemsData: {
      default: null,
      type: Object as PropType<
        Record<
          SystemTypeString | EMSSystemType,
          { count: number; components: Record<string, SystemData> }
        >
      >,
    },
    allSystemsForecastData: { default: null, type: Object as PropType<Record<string, any[]>> },
    groupSliderState: { default: 0, type: Number },
    batteryPredictedSOC: Object as PropType<any>,
    allSystemsForecastTargetPower: Object as PropType<any>,
    isPreview: {
      default: false,
      type: Boolean,
    },
  },
  setup() {
    const canvas = ref(null);
    const centralEndpoint = ref(null);
    const { width, height } = useElementSize(canvas);
    const radius = 250;
    const startOffset = (Math.PI * 2) / 4;
    return {
      canvas,
      centralEndpoint,
      containerWidth: width,
      containerHeight: height,
      radius,
      startOffset,
    };
  },
  data() {
    const notBypassedBatteries: any = {};
    const bypassedBatteries: any = {};
    const systemsGroups: SystemGroup[] = [];
    const canvasLines: (Point | undefined)[] = [];
    const canvasCenter = null as Point | null;
    const canvasSize = null as Size | null;

    return {
      systemComponents: systemComponentMappings,
      mlMappings: mlSystemMappings,
      blueHex: "#2BAAE2",
      canvasSize,
      canvasCenter,
      canvasLines,
      // system groups as state to avoid unnecessary rendering
      systemsGroups,
      bypassedBatteries,
      notBypassedBatteries,
      renderKey: 0,
    };
  },
  computed: {
    measurementGetter(): IMeasurementGetter {
      return this.$store.getters["measurements/measurement"];
    },
    wrappendComponent() {
      if (this.wrapperType === "Forecast") {
        return "EMSSystemForecast";
      }
      return "EMSSystem";
    },
    div() {
      return 360 / this.systemsGroups.length;
    },
    offsetDeviceCount() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return 39;
        case "sm":
          return 39;
        case "md":
          return 50;
        case "lg":
          return 60;
        case "xl":
          return 60;
      }
      return 60;
    },
    deviceTypes() {
      return this.isEMS ? EMSSystemKeys : DeviceTypeKeys;
    },
    systemTypeStrings() {
      return (this.deviceTypes as string[]).filter(
        (system) => this.allSystemsData[system as SystemTypeString | EMSSystemType].count,
      ) as (SystemTypeString | EMSSystemType)[];
    },
    batteryGroup() {
      return this.allSystemsData.battery.components;
    },
    isInIsland() {
      if (
        !this.allSystemsData ||
        !this.allSystemsData?.grid ||
        !this.allSystemsData.grid.components ||
        this.wrapperType === "Forecast"
      ) {
        return false;
      }

      const bypassKeys = Object.values(this.allSystemsData.grid.components).map(
        (grid: any) => grid.status_island,
      ) as string[];
      const bypassValues = bypassKeys.map((key) => this.measurementGetter(key));
      return bypassValues.some((value) => value === 1);
    },
    isInBypass() {
      if (
        !this.allSystemsData ||
        !this.allSystemsData.battery ||
        !this.allSystemsData.battery.components ||
        this.wrapperType === "Forecast"
      ) {
        return false;
      }

      const bypassKeys = Object.values(this.allSystemsData.battery.components).map(
        (battery: any) => battery.status_bypass,
      ) as string[];
      const bypassValues = bypassKeys.map((key) => this.measurementGetter(key));
      return bypassValues.some((value) => value === 1);
    },
    /**
     * Load line if all coords and sizes ready
     * @return {boolean} load line status
     */
    loadLine() {
      return !!this.canvasSize && !!this.canvasCenter;
    },
    arrowGroups() {
      if (!this.loadLine) return [];
      return this.systemsGroups.filter((item, systemIndex) => !!this.canvasLines[systemIndex]);
    },
    infoGroups() {
      return this.systemsGroups
        .map((item, index) => ({
          info: item.info,
          index: index,
          key: item.key,
        }))
        .filter((group) => group.info);
    },
  },
  watch: {
    allSystemsData: [
      { deep: true, handler: "initBatteries" },
      { deep: true, handler: "initSystemsGroups" },
      { deep: true, handler: "handleMappingChanges" },
    ],
    isInIsland: [{ handler: "initBatteries" }, { handler: "initSystemsGroups" }],
    isInBypass: [{ handler: "initBatteries" }, { handler: "initSystemsGroups" }],
    bypassedBatteries: [{ handler: "initSystemsGroups" }],
    notBypassedBatteries: [{ handler: "initSystemsGroups" }],
    "systemsGroups.length": [{ handler: "handleMappingChanges" }],
    renderKey: [{ handler: "getCoords" }],
    containerWidth: [{ handler: "getCoords" }],
    containerHeight: [{ handler: "getCoords" }],
  },
  mounted() {
    this.initSystemsGroups();
    this.initBatteries();
    this.handleMappingChanges();
  },
  methods: {
    instanceViewIs(system: string) {
      return this.isEMS
        ? systemComponentMappings[mlSystemMappings[system] as SystemTypeString]
        : systemComponentMappings[system as SystemTypeString];
    },
    topOffestForIndex(index: number, offset: number, radius: number, startPoint = 0) {
      return Math.sin(this.div * index * (Math.PI / 180) - startPoint) * radius + offset;
    },
    leftOffestForIndex(index: number, offset: number, radius: number, startPoint = 0) {
      return Math.cos(this.div * index * (Math.PI / 180) - startPoint) * radius + offset;
    },
    styleForIndex(index: number, offsetRadius = 0, startPoint = 0) {
      const startOffset = startPoint !== 0 ? startPoint : this.startOffset;
      const offX = this.centralEndpoint ? (this.centralEndpoint as HTMLElement).offsetLeft : 0;
      const offY = this.centralEndpoint ? (this.centralEndpoint as HTMLElement).offsetTop : 0;
      const style = `
          top: ${this.topOffestForIndex(
            index,
            offY,
            this.radius + offsetRadius,
            startOffset,
          ).toString()}px !important;
          left: ${this.leftOffestForIndex(
            index,
            offX,
            this.radius + offsetRadius,
            startOffset,
          ).toString()}px !important;
          position: absolute;
          transform: translate(-50%, -50%);`;

      return style;
    },
    initBatteries() {
      if (!this.batteryGroup) return;
      this.bypassedBatteries = Object.keys(this.batteryGroup)
        .filter((battery) => {
          const key = this.batteryGroup[battery].status_bypass;
          if (key === "") {
            return false;
          }
          const measurement = this.measurementGetter(key);
          return measurement === 1;
        })
        .reduce((acc, key) => {
          return { ...acc, [key]: this.batteryGroup[key] };
        }, {});

      this.notBypassedBatteries = Object.keys(this.batteryGroup)
        .filter((battery) => {
          const key = this.batteryGroup[battery].status_bypass;
          if (key === "" || key === undefined || key === null) {
            return true;
          }
          const measurement = this.measurementGetter(key);
          return measurement === 0;
        })
        .reduce((acc, key) => {
          return { ...acc, [key]: this.batteryGroup[key] };
        }, {});
    },
    initSystemsGroups() {
      this.systemsGroups = this.systemTypeStrings.reduce((acc, key) => {
        const defaultGroup = {
          key,
          systems: this.allSystemsData[key],
          defaultMovement: defaultArrowMovementFromPointToCenter[key],
          defaultColor: defaultColor[key],
          alternativeColor: alternativeColor[key],
          disconnected: key === "grid" && this.isInIsland && this.wrapperType === "Actual",
          info: key === "grid" && this.isInIsland ? "mlModel.EMS.islandActive" : undefined,
        };

        if (key === "battery" && this.wrapperType === "Actual" && this.isEMS) {
          let arr = [...acc];
          if (this.bypassedBatteries && Object.entries(this.bypassedBatteries).length) {
            arr = [
              ...arr,
              {
                ...defaultGroup,
                systems: {
                  count: Object.entries(this.bypassedBatteries).length,
                  components: this.bypassedBatteries,
                },
                disconnected: true,
                info: "mlModel.EMS.bypassActive",
              },
            ];
          }
          if (this.notBypassedBatteries && Object.entries(this.notBypassedBatteries).length) {
            arr = [
              ...arr,
              {
                ...defaultGroup,
                systems: {
                  count: Object.entries(this.notBypassedBatteries).length,
                  components: this.notBypassedBatteries,
                },
              },
            ];
          }
          return arr;
        }
        return [...acc, defaultGroup];
      }, [] as SystemGroup[]);
    },
    handleMappingChanges() {
      this.$nextTick(() => this.renderKey++);
    },
    /**
     * Defines coordinates of systems, central endpoint.
     * Use vm.$refs to retrieve references to elements.
     * Then it goes through the list of references and creates an options object for each one.
     */
    async getCoords() {
      await this.$nextTick();

      if (!this.centralEndpoint || !this.canvas) {
        return;
      }
      const central = this.centralEndpoint as HTMLElement;
      const actualViewRef = this.canvas as HTMLElement;

      this.canvasSize = { width: actualViewRef?.clientWidth, height: actualViewRef?.clientHeight };
      this.canvasCenter = {
        x: central.offsetLeft,
        y: central.offsetTop,
      };

      this.radius = Math.min(actualViewRef?.clientWidth, actualViewRef?.clientHeight) * (1 / 3);

      this.systemsGroups.forEach((group, systemIndex) => {
        this.canvasLines[systemIndex] = {
          x: this.leftOffestForIndex(
            systemIndex,
            central.offsetLeft,
            this.radius,
            this.startOffset,
          ), // + (initial ? central.offsetLeft: 0),
          y: this.topOffestForIndex(systemIndex, central.offsetTop, this.radius, this.startOffset), // + (initial ? central.offsetTop : 0),
        };
      });
    },
  },
});
</script>

<style lang="scss"></style>
