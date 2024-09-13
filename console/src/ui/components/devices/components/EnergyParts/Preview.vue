<template>
  <div class="ems-preview-circle ems-preview preview-border-radius">
    <div v-if="previewTitle" :class="['ems-preview-circle-title', previewTitlePosition]">
      {{ previewTitle }}
    </div>
    <div v-if="systemCount" class="system-count">
      <CoreButton
        color="lynusText"
        rounded="true"
        variant="outlined"
        size="x-small"
        button-type="standardIcon"
        style="cursor: default"
      >
        {{ systemCount }}
      </CoreButton>
    </div>
    <ShowEventBase
      v-if="errorWarningLocal"
      :warning-state="errorWarningLocal"
      class="preview-border-radius error-state"
    />
    <RotatingBacklight v-if="!overlay" :color="rotatingBacklightColor" :no-data="noData" />
    <div class="ems-preview-circle-value">
      <CoreOverlay
        v-if="overlay"
        :model-value="overlay"
        contained
        persistent
        scroll-strategy="none"
      />
      <lynus-icon
        v-if="!isBatterySOC"
        :name="previewIcon"
        :size="$vuetify.display.mobile ? previewIconSize - 5 : previewIconSize"
        color="theme"
      />
      <BatteryLevel v-else :battery-state="batterySOCValue" />
      <div v-if="showActualValue" class="pt-1">
        <span>{{ actualValue }}</span>
        <span class="pl-1">{{ actualValueUnit }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BatteryLevel from "@/ui/components/devices/components/EnergyParts/BatteryLevel.vue";
import RotatingBacklight from "@/ui/components/devices/components/EnergyParts/RotatingBacklight.vue";
import ShowEventBase from "@/ui/components/devices/devices/base/ShowEventBase.vue";

/**
 * Component that represent circle system view.
 * Used in EMS, EnergyView, Setpoint Optimizer
 */
export default defineComponent({
  components: {
    RotatingBacklight,
    BatteryLevel,
    ShowEventBase,
  },
  props: {
    actualValue: { default: 240, type: [Number, String] },
    previewTitle: { default: null, type: String },
    previewTitlePosition: { default: "top", type: String },
    showActualValue: { default: true, type: Boolean },
    actualValueUnit: { default: "kW", type: String },
    previewIcon: { default: "photovoltaic", type: String },
    previewIconSize: { default: "30", type: [String, Number] },
    isBatterySOC: { default: false, type: Boolean },
    batterySOCValue: { default: 0, type: Number },
    rotatingBacklightColor: { default: "#111616", type: String },
    systemCount: { default: null, type: Number },
    errorWarningLocal: { default: null, type: [String, Number, Object] }, // empty object
    noData: { default: false, type: Boolean },
    overlay: { default: false, type: Boolean },
  },
});
</script>

<style lang="scss">
.ems-preview {
  width: 80px;
  height: 80px;
  @media all and (max-width: 1450px) and (min-width: 1264px) {
    width: 80px;
    height: 80px;
  }
  @media all and (max-width: 900px) {
    width: 65px;
    height: 65px;
  }
  @media all and (max-width: 800px) {
    width: 55px;
    height: 55px;
  }
}

.preview-border-radius {
  border-radius: 24px !important;
}

.error-state {
  z-index: 3;
}

.ems-preview-circle {
  position: relative;
  opacity: 1;

  .ems-preview-circle-title {
    width: 100%;
    position: absolute;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    text-align: center;
  }

  .top {
    top: -20px;
  }

  .bottom {
    bottom: -20px;
  }

  .system-count {
    position: absolute;
    top: -5px;
    left: -35px;
    @media all and (max-width: 800px) {
      top: -25px;
      left: -15px;
    }
  }
}

.ems-preview-circle-value {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  transform: translate(2px, 2px);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  font-size: 12px;
  background: rgb(var(--v-theme-surface));
  border-top: 2px solid rgba(var(--v-theme-on-surface), 0.2);

  @media all and (max-width: 800px) {
    font-size: 8px;
    border-radius: 12px;
  }
}
</style>
