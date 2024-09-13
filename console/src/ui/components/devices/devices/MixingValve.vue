<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="mixing-valve"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="mixing-valve">
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton1_onOff,
            deviceData.data.mappings.PushButton1_state,
          ]"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.autoMode`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              button-size="35"
              icon="auto-mode"
              icon-size="23"
              instance="PushButton1"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton2_onOff,
            deviceData.data.mappings.PushButton2_state,
          ]"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.manualMode`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              button-size="35"
              icon="manual-mode"
              icon-size="23"
              instance="PushButton2"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton3_onOff,
            deviceData.data.mappings.PushButton3_state,
          ]"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.inactiveMode`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              button-size="35"
              icon="inactive-mode"
              icon-size="23"
              instance="PushButton3"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Slider_targetValue,
            deviceData.data.mappings.OutputField_actualValue,
          ]"
          view="column"
        >
          <template #label>
            <div class="text-center" style="line-height: 1">
              {{ $t("devices.MixingValve.mainView.sliderLabel") }}
            </div>
          </template>
          <template #value>
            <SliderBase
              :data="deviceData.data"
              :end-timeout="10000"
              :is-active="true"
              :sending-timeout="250"
              :state="sliderActualValue"
              :variable-data="deviceData.data.mappings"
              instance="Slider"
              :is-preview="isPreview"
            />
            <div class="d-flex pt-1">
              <OutputFieldBase
                :variable-data="deviceData.data.mappings"
                instance="OutputField"
                :is-preview="isPreview"
              />
              <span class="pl-1">%</span>
            </div>
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton4_onOff,
            deviceData.data.mappings.PushButton4_state,
          ]"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.reset`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              button-size="35"
              icon="push_reset"
              icon-size="25"
              instance="PushButton4"
              :is-preview="isPreview"
            />
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
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent MixingValve device
 */
export default defineComponent({
  components: {
    PushButtonBase,
    OutputFieldBase,
    SliderBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
  computed: {
    sliderActualValue() {
      return this.measurements.get(this.deviceData!.data.mappings.OutputField_actualValue);
    },
  },
});
</script>

<style lang="scss" scoped>
.mixing-valve {
  width: 100%;
}
</style>
