<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="water_level"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="sensor-level">
        <FillLevelDisplayBase
          :is-decimal="true"
          :is-text="true"
          :max="100"
          :min="0"
          :variable-data="deviceData.data.mappings"
          :is-preview="isPreview"
          instance="OutputField"
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

import FillLevelDisplayBase from "@/ui/components/devices/devices/base/FillLevelDisplayBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent SensorLevel device
 */
export default defineComponent({
  components: {
    FillLevelDisplayBase,
    DeviceLayout,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.sensor-level {
  width: 100%;
}
</style>
