<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="photovoltaic"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="d-flex pv-system">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :max="1000"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField"
              :is-preview="isPreview"
            />
            <div class="pl-2">kW</div>
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
 * Component that represent PVSystem device
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
@import "./src/ui/scss/mixins";

.pv-system {
  @include mediumText;
}
</style>
