<template>
  <FormModal :system-title="systemInstanceData.name" :window-width="modalWindowWidth ? 1200 : 1000">
    <!-- Circle system instance representation -->
    <template #activator>
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
      <PreviewMQTTControls
        :actual-value="flowTemperature"
        :actual-value-max="1000"
        :actual-value-min="-1000"
        :error-warning="{}"
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
    </template>
    <!-- Representation of system instance form -->
    <template #content>
      <div class="setpoint-optimizer-system-instance-content-wrapper">
        <component
          :is="currentControlsComponent"
          :controls="systemInstanceData"
          :mpc-id="mpcId"
          :system-instance-id="systemInstanceId"
          :is-preview="isPreview"
          @handle-update-m-p-c="$emit('handleUpdateMPC')"
        />
      </div>
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";
import AnimatedLine from "@/ui/components/devices/components/EnergyParts/AnimatedLine/index.vue";
import PreviewMQTTControls from "@/ui/components/devices/mpc/EMS/components/PreviewMQTTControls.vue";
import CoolingAirControls from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/CoolingAirControls.vue";
import CoolingWaterControls from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/CoolingWaterControls.vue";
import HeatingAirControls from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/HeatingAirControls.vue";
import HeatingWaterControls from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/HeatingWaterControls.vue";
import HybridAirControls from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/HybridAirControls.vue";
import HybridWaterControls from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/HybridWaterControls.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent setpoint optimizer system instance actual value
 */
export default defineComponent({
  components: {
    FormModal,
    AnimatedLine,
    PreviewMQTTControls,
    CoolingAirControls,
    CoolingWaterControls,
    HeatingAirControls,
    HeatingWaterControls,
    HybridAirControls,
    HybridWaterControls,
  },
  props: {
    mpcId: [Object, String],
    systemInstanceType: { default: null, type: String },
    systemInstanceId: { default: null, type: String },
    previewTitlePosition: { default: "top", type: String },
    systemInstanceData: Object as PropType<any>,
    instanceCanvasSize: Object as PropType<any>,
    instanceCanvasCenter: Object as PropType<any>,
    instanceLineData: Object as PropType<any>,
    instanceLineReady: { default: false, type: Boolean },
    systemColors: Object as PropType<any>,
    isLineMovementReversed: { default: true, type: Boolean },
    currentPreviewIcon: String,
    isPreview: { default: false, type: Boolean },
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
    flowTemperature() {
      return {
        OutputField_actualValue: this.systemInstanceData.flow_temperature,
      };
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
     * Defines current system
     */
    currentControlsComponent() {
      const nameSpace: any = {
        heating_air_systems: "HeatingAirControls",
        heating_water_systems: "HeatingWaterControls",
        hybrid_air_systems: "HybridAirControls",
        hybrid_water_systems: "HybridWaterControls",
        cooling_air_systems: "CoolingAirControls",
        cooling_water_systems: "CoolingWaterControls",
      };
      return nameSpace[this.systemInstanceType];
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
    modalWindowWidth() {
      const hybrid: string[] = ["hybrid_water_systems", "hybrid_air_systems"];
      return hybrid.includes(this.systemInstanceType);
    },
  },
});
</script>

<style lang="scss">
.setpoint-optimizer-system-instance-content-wrapper {
  max-height: 70dvh;
  overflow-y: scroll;
}
</style>
