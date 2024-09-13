<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="general_switch"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="d-flex justify-end" style="width: 100%">
        <Switch2VBase
          :variable-data="deviceData.data.mappings"
          class="pa-0 ma-0"
          instance="Switch2V"
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

import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent GeneralSwitchV2 device
 */
export default defineComponent({
  components: {
    Switch2VBase,
    DeviceLayout,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.light-switch-v2 {
  .device-basic-controls {
    display: flex;
    align-items: center;
    height: 110px;
    padding: 0 20px;

    .switch,
    .icon {
      width: 50%;
    }

    .switch {
      display: flex;
      justify-content: flex-end;
    }

    .v-input {
      margin: 0 !important;
      padding: 0 !important;
    }
  }
}
</style>
