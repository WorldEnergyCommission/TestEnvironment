<template>
  <div class="setpoint-optimizer-system">
    <FormModal
      :system-title="$t(`mlModel.SetpointOptimizer.systems.${systemInstanceType}.title`)"
      :window-width="1500"
    >
      <!-- Circle system representation -->
      <template #activator>
        <AnimatedLine
          v-if="lineReady"
          :key="`${canvasSize.width}`"
          :center="canvasCenter"
          :color2="systemColors.animatedLine.main"
          :color2-reverse="systemColors.animatedLine.reversed"
          :is-line-active="isSystemActive"
          :is-movement-reverse="lineMovement"
          :is-reverse-movement-default="true"
          :point="lineData"
          :size="canvasSize"
        />
        <Preview
          :actual-value="null"
          :error-warning-local="{}"
          :no-data="!isSystemActive"
          :preview-icon="currentPreviewIcon"
          :rotating-backlight-color="
            !lineMovement
              ? systemColors.rotatingBacklightColor.main
              : systemColors.rotatingBacklightColor.reversed
          "
          :show-actual-value="false"
          :system-count="systemCount"
          preview-icon-size="40"
        />
      </template>
      <!-- Representation of the Actual, Forecast grids of systems -->
      <template #content>
        <div class="setpoint-optimizer-system-content-view">
          <div class="setpoint-optimizer-system-content-view-wrapper">
            <ActualView
              :canvas-center="canvasCenter"
              :canvas-size="canvasSize"
              :is-line-movement-reversed="isLineMovementReversed"
              :line-data="lineData"
              :line-ready="lineReady"
              :mpc-id="mpcId"
              :system-colors="systemColors"
              :system-count="systemCount"
              :system-data="systemData"
              :system-instance-type="systemInstanceType"
              :is-preview="isPreview"
              @handle-update-m-p-c="$emit('handleUpdateMPC')"
            />
          </div>
          <div class="setpoint-optimizer-system-content-view-wrapper">
            <ForecastView
              :canvas-center="canvasCenter"
              :canvas-size="canvasSize"
              :forecast-data="forecastData"
              :is-line-movement-reversed="isLineMovementReversed"
              :line-data="lineData"
              :line-ready="lineReady"
              :system-colors="systemColors"
              :system-count="systemCount"
              :system-data="systemData"
              :system-instance-type="systemInstanceType"
            />
          </div>
        </div>
      </template>
    </FormModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";
import AnimatedLine from "@/ui/components/devices/components/EnergyParts/AnimatedLine/index.vue";
import Preview from "@/ui/components/devices/components/EnergyParts/Preview.vue";
import ActualView from "@/ui/components/devices/mpc/SetpointOptimizer/system/components/ActualView.vue";
import ForecastView from "@/ui/components/devices/mpc/SetpointOptimizer/system/components/ForecastView.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent system Actual, Forecast views of Setpoint Optimizer.
 */
export default defineComponent({
  name: "SetpointOptimizerSystem",
  components: {
    ActualView,
    ForecastView,
    FormModal,
    Preview,
    AnimatedLine,
  },
  props: {
    mpcId: [Object, String],
    systemInstanceType: { default: null, type: String },
    systemData: Object as PropType<any>,
    systemCount: { default: null, type: Number },
    canvasSize: Object as PropType<any>,
    canvasCenter: Object as PropType<any>,
    lineData: Object as PropType<any>,
    lineReady: { default: false, type: Boolean },
    systemColors: Object as PropType<any>,
    isLineMovementReversed: { default: false, type: Boolean },
    forecastData: Object as PropType<any>,
    isPreview: { default: false, type: Boolean },
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
  },
});
</script>

<style lang="scss">
.setpoint-optimizer-system-content-view {
  display: flex;
  @media all and (max-width: 1100px) {
    flex-direction: column;
  }

  .setpoint-optimizer-system-content-view-wrapper {
    width: 50%;
    @media all and (max-width: 1100px) {
      width: 100%;
    }
  }
}
</style>
