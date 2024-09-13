<template>
  <div class="system-instance-forecast">
    <AnimatedLine
      v-if="instanceLineReady"
      :key="`${instanceCanvasSize.width}${isSystemActive}${lineMovement}${defaultLineMovement}`"
      :center="instanceCanvasCenter"
      :color2="systemColors.animatedLine.main"
      :color2-reverse="systemColors.animatedLine.reversed"
      :size="instanceCanvasSize"
      :is-line-active="isSystemActive"
      :is-movement-reverse="lineMovement"
      :is-reverse-movement-default="defaultLineMovement"
      :point="instanceLineData"
      :points-in-one-line="pointsInOneLine"
    />
    <Preview
      :actual-value="actualValue[1]"
      :error-warning-local="{}"
      :no-data="!isSystemActive"
      :preview-icon="currentPreviewIcon"
      :preview-title="systemInstanceData.name"
      :preview-title-position="previewTitlePosition"
      :rotating-backlight-color="
        !lineMovement
          ? systemColors.rotatingBacklightColor.main
          : systemColors.rotatingBacklightColor.reversed
      "
      actual-value-unit="°C"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";
import AnimatedLine from "@/ui/components/devices/components/EnergyParts/AnimatedLine/index.vue";
import Preview from "@/ui/components/devices/components/EnergyParts/Preview.vue";

/**
 * Component that represent setpoint optimizer system instance forecast
 */
export default defineComponent({
  components: {
    Preview,
    AnimatedLine,
  },
  props: {
    actualValue: [Array],
    systemInstanceType: { default: null, type: String },
    systemInstanceData: Object as PropType<any>,
    previewTitlePosition: { default: "top", type: String },
    instanceCanvasSize: Object as PropType<any>,
    instanceCanvasCenter: Object as PropType<any>,
    instanceLineData: Object as PropType<any>,
    instanceLineReady: { default: false, type: Boolean },
    systemColors: Object as PropType<any>,
    isLineMovementReversed: { default: true, type: Boolean },
    currentPreviewIcon: String,
    pointsInOneLine: { default: false, type: Boolean },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    status() {
      return this.measurements.get(this.systemInstanceData.status);
    },
    isSystemActive() {
      return !!this.status;
    },
    currentHybridMode() {
      if (this.status === 1) return false;
      if (this.status === 2) return true;
      else return null;
    },
    /**
     * Defines default line movement direction for current system
     * @return {boolean} if true arrows moves in default direction else in opposite direction
     */
    defaultLineMovement() {
      return (
        {
          heating_air_systems: false,
          heating_water_systems: false,
          cooling_air_systems: false,
          cooling_water_systems: false,
          hybrid_water_systems: !this.currentHybridMode, // switch between hating and cooling
          hybrid_air_systems: !this.currentHybridMode, // switch between hating and cooling
        } as any
      )[this.systemInstanceType];
    },
    /**
     * Collection of systems line movement directions
     */
    lineMovementSystems(): any {
      return {
        heating_air_systems: true,
        heating_water_systems: true,
        cooling_air_systems: true,
        cooling_water_systems: true,
        hybrid_water_systems: this.currentHybridMode, // switch between hating and cooling
        hybrid_air_systems: this.currentHybridMode, // switch between hating and cooling
      };
    },
    /**
     * Defines line movement direction for current system
     * @return {boolean} if true arrows moves in default direction else in opposite direction
     */
    lineMovement() {
      return this.lineMovementSystems[this.systemInstanceType];
    },
  },
});
</script>

<style lang="scss" scoped></style>
