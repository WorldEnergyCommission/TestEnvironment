<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="temperature"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="temperature-sensor">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :max="1500"
              :min="-100"
              :variable-data="deviceData.data.mappings"
              instance="OutputField"
              :is-preview="isPreview"
            />
            <div class="pl-2">&deg;C</div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent Temperature device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
  computed: {
    isActualValueVariableFilled() {
      return !!this.deviceData!.data.mappings.OutputField_actualValue.length;
    },
  },
});
</script>

<style lang="scss" scoped>
.temperature-sensor {
  font-size: 20px;
}
</style>
