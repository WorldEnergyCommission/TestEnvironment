<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="pump"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="pump-without-vfd">
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
    <template #settings-view>
      <div class="pump-without-vfd-settings d-flex justify-center">
        <LabelUnitWrapper
          :variables-list-for-check="[deviceData.data.mappings.OutputField_actualValue]"
        >
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :max="1000"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField"
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
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent PumpWithoutVFD device
 */
export default defineComponent({
  components: {
    PushButtonBase,
    OutputFieldBase,
    ArrowDirectionLeftBase,
    ArrowDirectionRightBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.pump-without-vfd {
  width: 100%;
}

.pump-without-vfd-settings {
  font-size: 20px;
}
</style>
