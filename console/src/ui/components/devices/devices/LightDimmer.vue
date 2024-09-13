<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #basic-controls>
      <div class="d-flex align-center light-dimmer">
        <div class="slider d-flex align-center">
          <SliderBase
            :data="deviceData.data"
            :is-active="isActive"
            :state="sliderActualValue"
            :variable-data="deviceData.data.mappings"
            append-icon="icon-light-switch_on"
            instance="Slider"
            prepend-icon="icon-light-switch_off"
            :is-preview="isPreview"
          />
          <div class="d-flex align-center pl-2 pr-4">
            <OutputFieldBase
              :variable-data="deviceData.data.mappings"
              instance="OutputField"
              :is-preview="isPreview"
            />
            <div>%</div>
          </div>
        </div>
        <div class="switch">
          <SwitchBase
            :variable-data="deviceData.data.mappings"
            class="pa-0 ma-0"
            instance="Switch"
            :is-preview="isPreview"
          />
        </div>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent LightDimmer device
 */
export default defineComponent({
  components: {
    SliderBase,
    SwitchBase,
    OutputFieldBase,
    DeviceLayout,
  },
  extends: DeviceBase,
  computed: {
    isActive() {
      return !!this.measurements.get(this.deviceData!.data.mappings.Switch_state);
    },
    sliderActualValue() {
      return this.measurements.get(this.deviceData!.data.mappings.OutputField_actualValue);
    },
  },
});
</script>

<style lang="scss">
.light-dimmer {
  width: 100%;
  overflow: visible;
  .slider {
    width: 100%;
  }
}
</style>
