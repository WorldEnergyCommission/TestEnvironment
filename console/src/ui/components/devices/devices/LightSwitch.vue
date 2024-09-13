<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #basic-controls>
      <div class="light-switch">
        <lynus-icon color="theme" name="light-bulb" size="35" />
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
 * Component that represent LightSwitch device
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
.light-switch {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
