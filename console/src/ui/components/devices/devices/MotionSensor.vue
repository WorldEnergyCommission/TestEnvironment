<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="motion-sensor"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="motion-sensor">
        <div class="basic-control-field">
          <InputFieldBase
            :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan1200]"
            :icon-styles="{ paddingTop: '7px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="1200"
            :min="0"
            :step="1"
            :unit-styles="{ width: '30px', paddingTop: '5px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField"
            :is-preview="isPreview"
          >
            <template #unit>
              {{ $t("uiComponents.form.sec") }}
            </template>
            <template #icon>
              <div class="d-flex flex-column pr-2">
                <lynus-icon class="icon" color="theme" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch_on,
            deviceData.data.mappings.Switch_off,
            deviceData.data.mappings.Switch_state,
          ]"
          class="pt-4"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.permanent`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              class="pa-0 ma-0"
              instance="Switch"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton_onOff,
            deviceData.data.mappings.PushButton_state,
          ]"
          class="pt-4"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.impulse`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              class="mr-3"
              instance="PushButton"
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
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent MotionSensor device
 */
export default defineComponent({
  components: {
    InputFieldBase,
    SwitchBase,
    PushButtonBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
});
</script>

<style lang="scss">
.motion-sensor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
