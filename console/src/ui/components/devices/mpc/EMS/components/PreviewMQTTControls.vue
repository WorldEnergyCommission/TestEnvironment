<template>
  <div class="ems-preview-circle ems-preview">
    <div v-if="systemCount" class="system-count">
      <CoreButton color="lynusText" button-type="standardIcon" variant="outlined" size="x-small">
        {{ systemCount }}
      </CoreButton>
    </div>
    <div v-if="previewTitle" :class="['ems-preview-circle-title', previewTitlePosition]">
      {{ previewTitle }}
    </div>
    <ShowEventBase :variable-data="errorWarning" instance="ShowEvent" />
    <RotatingBacklight v-if="!overlay" :color="rotatingBacklightColor" :no-data="noData" />
    <div class="ems-preview-circle-value">
      <CoreOverlay
        v-if="overlay"
        contained
        :model-value="overlay"
        style="position: absolute !important"
        persistent
        scroll-strategy="none"
      />
      <lynus-icon v-if="!isBatterySOC" :name="previewIcon" :size="previewIconSize" color="theme" />
      <BatteryLevel v-if="isBatterySOC" :battery-state="batterySOCValue" />
      <div v-if="showActualValue" class="d-flex">
        <OutputFieldBase
          :is-decimal="true"
          :max="actualValueMax"
          :min="actualValueMin"
          :variable-data="actualValue"
          instance="OutputField"
        />
        <span class="pl-1">{{ actualValueUnit }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BatteryLevel from "@/ui/components/devices/components/EnergyParts/BatteryLevel.vue";
import RotatingBacklight from "@/ui/components/devices/components/EnergyParts/RotatingBacklight.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import ShowEventBase from "@/ui/components/devices/devices/base/ShowEventBase.vue";

/**
 * Component that represent circle system view.
 * Used in EMS, EnergyView, Setpoint Optimizer.
 * Different from Preview.vue is has a flashing frame (ShowEventBase).
 */
export default defineComponent({
  components: {
    RotatingBacklight,
    BatteryLevel,
    OutputFieldBase,
    ShowEventBase,
  },
  props: {
    /** example: {'OutputField_actualValue': variable} */
    actualValue: Object as PropType<any>,
    actualValueMin: { default: null, type: Number },
    actualValueMax: { default: null, type: Number },
    actualValueUnit: { default: "kW", type: String },
    showActualValue: { default: true, type: Boolean },
    isBatterySOC: { default: false, type: Boolean },
    batterySOCValue: { default: null, type: Number },
    previewTitle: { default: null, type: String },
    /**  top, bottom */
    previewTitlePosition: { default: "top", type: String },
    previewIcon: { default: "photovoltaic", type: String },
    previewIconSize: { default: "30", type: [String, Number] },
    rotatingBacklightColor: { default: "#525252", type: String },
    systemCount: { default: null, type: Number },
    /** example: {'ShowEvent_errorWarningState': variable} */
    errorWarning: Object as PropType<any>,
    noData: { default: false, type: Boolean },
    overlay: { default: false, type: Boolean },
  },
});
</script>

<style lang="scss" scoped>
.show-event-base {
  border-radius: 50% !important;
  z-index: 3;
}
</style>
