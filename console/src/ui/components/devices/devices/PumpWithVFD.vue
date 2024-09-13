<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="pump"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="pump-with-vfd">
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
              button-size="32"
              icon="auto-mode"
              icon-size="20"
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
              button-size="32"
              icon="manual-mode"
              icon-size="20"
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
              button-size="32"
              icon="inactive-mode"
              icon-size="20"
              instance="PushButton3"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <div class="basic-control-field d-flex align-center justify-center">
          <div class="pr-2">
            <ArrowDirectionLeftBase
              :variable-data="deviceData.data.mappings"
              instance="ArrowLeft"
              :is-preview="isPreview"
            />
          </div>
          <div>
            <ArrowDirectionRightBase
              :variable-data="deviceData.data.mappings"
              instance="ArrowRight"
              :is-preview="isPreview"
            />
          </div>
        </div>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Slider_targetValue,
            deviceData.data.mappings.OutputField_actualValue,
          ]"
          class="pt-2"
          view="column"
        >
          <template #label>
            <div class="text-center" style="line-height: 1">
              {{ $t("devices.PumpWithVFD.mainView.sliderLabel") }}
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
            <div class="d-flex">
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
              button-size="32"
              icon="push_reset"
              icon-size="24"
              instance="PushButton4"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #settings-view>
      <div class="pump-with-vfd-settings d-flex justify-center">
        <LabelUnitWrapper
          :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
        >
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :max="1000"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField1"
              :is-preview="isPreview"
            />
            <div class="pl-2">A</div>
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
import ArrowDirectionLeftBase from "@/ui/components/devices/devices/base/ArrowDirectionLeftBase.vue";
import ArrowDirectionRightBase from "@/ui/components/devices/devices/base/ArrowDirectionRightBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent PumpWithVFD device
 */
export default defineComponent({
  components: {
    PushButtonBase,
    OutputFieldBase,
    ArrowDirectionLeftBase,
    ArrowDirectionRightBase,
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
.pump-with-vfd {
  width: 100%;
}

.pump-with-vfd-settings {
  font-size: 20px;
}
</style>
