<template>
  <div>
    <EMSArrow
      v-if="instanceLineReady"
      :center="animatedLineProps.center"
      :default-point-color="defaultPointColor"
      :alternative-point-color="alternativePointColor"
      :canvas-size="animatedLineProps.size"
      :from-point-to-center-default="fromPointToCenterDefault"
      :point="animatedLineProps.point"
      style="pointer-events: none"
      :connected="!(isInIsland || isInBypass)"
      :system-data="{ component: instanceData }"
      :points-in-one-line="true"
    />
    <PreviewMQTTControls
      :actual-value="outputFieldActualPower"
      :actual-value-max="1000"
      :actual-value-min="-1000"
      :battery-s-o-c-value="batterySOCValue"
      :error-warning="showEvent"
      :is-battery-s-o-c="icon != null ? false : true"
      :no-data="!isNoData"
      :preview-title="instanceData?.title"
      :preview-title-position="previewTitlePosition"
      :rotating-backlight-color="pointColor"
      :preview-icon="icon"
      :overlay="isInIsland || isInBypass"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import EMSArrow from "../../EMSArrow.vue";
import { RootState } from "@/store/types";
import { AnimatedLineBaseProps } from "@/ui/components/devices/components/EnergyParts/AnimatedLine/index.vue";
import {
  EMSSystemType,
  SystemTypeString,
  alternativeColor,
  defaultArrowMovementFromPointToCenter,
  defaultColor,
  emsIcons,
} from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";
import PreviewMQTTControls from "@/ui/components/devices/mpc/EMS/components/PreviewMQTTControls.vue";

/**
 * Component that represent system instance view.
 */
export default defineComponent({
  components: { EMSArrow, PreviewMQTTControls },
  props: {
    systemTypeString: {
      default: "grid",
      type: String as PropType<SystemTypeString | EMSSystemType>,
    },
    previewActualValue: [Object, String, Number],
    outputFieldActualPower: [Object, String, Number],
    batterySOCValue: [Object, String, Number],
    instanceData: Object as PropType<any>,
    animatedLineProps: { default: null, type: Object as PropType<AnimatedLineBaseProps> },
    instanceLineReady: { default: false, type: Boolean },
    previewTitlePosition: { default: "top", type: String },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    defaultPointColor() {
      return defaultColor[this.systemTypeString];
    },
    alternativePointColor() {
      return alternativeColor[this.systemTypeString];
    },
    fromPointToCenterDefault() {
      return defaultArrowMovementFromPointToCenter[this.systemTypeString];
    },
    fromPointToCenter() {
      return this.fromPointToCenterDefault ? this.valueGTZero : !this.valueGTZero;
    },
    pointColor() {
      if (
        (this.fromPointToCenterDefault && this.fromPointToCenter) ||
        (!this.fromPointToCenterDefault && !this.fromPointToCenter)
      ) {
        return this.alternativePointColor;
      }

      return this.defaultPointColor;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    isNoData() {
      const type = typeof this.previewActualValue === "number";
      const zero = this.previewActualValue !== 0;
      return type && zero;
    },
    valueGTZero() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue > 0 : null;
    },
    showEvent() {
      if (!this.instanceData) {
        return false;
      }

      return {
        ShowEvent_errorWarningState: this.instanceData.error ?? false,
      };
    },
    icon() {
      return emsIcons[this.systemTypeString];
    },
    isInBypass() {
      if (!(this.systemTypeString === "battery")) return false;
      const bypassKey = this.instanceData.status_bypass;
      if (bypassKey === "") return false;
      const bypassValues = this.measurements.get(bypassKey);
      return bypassValues === 1;
    },
    isInIsland() {
      if (!(this.systemTypeString === "grid")) return false;
      const bypassKey = this.instanceData.status_island;
      if (bypassKey === "") return false;
      const bypassValues = this.measurements.get(bypassKey);
      return bypassValues === 1;
    },
  },
});
</script>
