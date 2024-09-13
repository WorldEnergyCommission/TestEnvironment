<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #basic-controls>
      <div class="ventilator-switch d-flex justify-space-between align-center">
        <lynus-icon color="theme" name="ventilator" size="30" />
        <SwitchBase
          :variable-data="deviceData.data.mappings"
          class="pa-0 ma-0"
          instance="Switch"
          :is-preview="isPreview"
        />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent VentilatorSwitch device
 */
export default defineComponent({
  components: {
    SwitchBase,
    DeviceLayout,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.ventilator-switch {
  width: 100%;
}
</style>
