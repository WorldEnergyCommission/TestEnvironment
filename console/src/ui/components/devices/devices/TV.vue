<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="television"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="tv d-flex flex-wrap align-center justify-space-around">
        <div class="wrapper d-flex mt-1">
          <ReverseBase
            :variable-data="deviceData.data.mappings"
            button-size-class="x-small"
            class="mr-1"
            instance="Reverse"
          />
          <MinusBase
            :is-push-button-behavior="true"
            :variable-data="deviceData.data.mappings"
            button-size-class="x-small"
            class="mr-2"
            icon="volume-minus"
            instance="Minus"
          />
          <PlusBase
            :is-push-button-behavior="true"
            :variable-data="deviceData.data.mappings"
            button-size-class="x-small"
            icon="volume-plus"
            instance="Plus"
          />
          <ForwardBase
            :variable-data="deviceData.data.mappings"
            button-size-class="x-small"
            class="ml-1"
            instance="Forward"
          />
        </div>
        <SwitchBase
          :variable-data="deviceData.data.mappings"
          class="pa-0 ma-0 mt-1"
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

import ForwardBase from "@/ui/components/devices/devices/base/ForwardBase.vue";
import MinusBase from "@/ui/components/devices/devices/base/MinusBase.vue";
import PlusBase from "@/ui/components/devices/devices/base/PlusBase.vue";
import ReverseBase from "@/ui/components/devices/devices/base/ReverseBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent TV device
 */
export default defineComponent({
  components: {
    PlusBase,
    MinusBase,
    ForwardBase,
    ReverseBase,
    SwitchBase,
    DeviceLayout,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.tv {
  width: 100%;
}
</style>
