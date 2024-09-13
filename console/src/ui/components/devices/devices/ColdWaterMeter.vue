<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="cold-water"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="cold-water-meter">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :variable-data="deviceData.data.mappings"
              instance="OutputField1"
              :is-preview="isPreview"
            />
            <div class="pl-2">m³</div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #settings-view>
      <div class="cold-water-meter-settings">
        <div class="d-flex align-center">
          <lynus-icon name="humidity" size="30" />
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
          >
            <template #value>
              <OutputFieldBase
                :is-decimal="true"
                :variable-data="deviceData.data.mappings"
                instance="OutputField2"
                :is-preview="isPreview"
              />
              <div class="pl-2">m³/h</div>
            </template>
          </LabelUnitWrapper>
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

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent ColdWaterMeter device
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
      return !!this.deviceData!.data.mappings.OutputField1_actualValue.length;
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/mixins";

.cold-water-meter {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  @include mediumText;
}

.cold-water-meter-settings {
  display: flex;
  justify-content: center;
  font-size: 20px;
  color: rgb(var(--v-theme-lynusText));
}
</style>
