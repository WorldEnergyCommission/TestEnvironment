<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="light-bulb"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="light-push-button">
        <PushButtonBase
          :variable-data="deviceData.data.mappings"
          instance="PushButton"
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

import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent LightPushButton device
 */
export default defineComponent({
  components: {
    PushButtonBase,
    DeviceLayout,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.light-push-button {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
