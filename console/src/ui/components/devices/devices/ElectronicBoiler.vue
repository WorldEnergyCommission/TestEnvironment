<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="electric-charging-boiler"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="electric-boiler">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :max="1000"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField1"
              :is-preview="isPreview"
            />
            <div class="pl-2">kW</div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #settings-view>
      <div class="electric-boiler-settings">
        <InputFieldBase
          :description-styles="{ width: '100px' }"
          :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldHours]"
          :icon-styles="{ width: '50px' }"
          :input-field-styles="{ flexGrow: '1' }"
          :is-decimal="false"
          :max="23"
          :min="0"
          :step="1"
          :unit-styles="{ width: '50px' }"
          :variable-data="deviceData.data.mappings"
          instance="InputField1"
        >
          <template #textDescription>
            {{ $t("uiComponents.form.on") }}
          </template>
          <template #unit>
            {{ $t("uiComponents.form.h") }}
          </template>
          <template #icon>
            <div class="d-flex flex-column pr-2">
              <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
            </div>
          </template>
        </InputFieldBase>
        <InputFieldBase
          :description-styles="{ width: '100px' }"
          :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldMinutes]"
          :icon-styles="{ width: '50px' }"
          :input-field-styles="{ flexGrow: '1' }"
          :is-decimal="false"
          :max="59"
          :min="0"
          :step="1"
          :unit-styles="{ width: '50px' }"
          :variable-data="deviceData.data.mappings"
          class="pt-2"
          instance="InputField3"
        >
          <template #textDescription>
            {{ $t("uiComponents.form.on") }}
          </template>
          <template #unit>
            {{ $t("uiComponents.form.min") }}
          </template>
          <template #icon>
            <div class="d-flex flex-column pr-2">
              <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
            </div>
          </template>
        </InputFieldBase>
        <InputFieldBase
          :description-styles="{ width: '100px' }"
          :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldHours]"
          :icon-styles="{ width: '50px' }"
          :input-field-styles="{ flexGrow: '1' }"
          :is-decimal="false"
          :max="23"
          :min="0"
          :step="1"
          :unit-styles="{ width: '50px' }"
          :variable-data="deviceData.data.mappings"
          class="pt-2"
          instance="InputField2"
        >
          <template #textDescription>
            {{ $t("uiComponents.form.off") }}
          </template>
          <template #unit>
            {{ $t("uiComponents.form.h") }}
          </template>
          <template #icon>
            <div class="d-flex flex-column pr-2">
              <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
            </div>
          </template>
        </InputFieldBase>
        <InputFieldBase
          :description-styles="{ width: '100px' }"
          :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldMinutes]"
          :icon-styles="{ width: '50px' }"
          :input-field-styles="{ flexGrow: '1' }"
          :is-decimal="false"
          :max="59"
          :min="0"
          :step="1"
          :unit-styles="{ width: '50px' }"
          :variable-data="deviceData.data.mappings"
          class="pt-2"
          instance="InputField4"
        >
          <template #textDescription>
            {{ $t("uiComponents.form.off") }}
          </template>
          <template #unit>
            {{ $t("uiComponents.form.min") }}
          </template>
          <template #icon>
            <div class="d-flex flex-column pr-2">
              <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
            </div>
          </template>
        </InputFieldBase>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch1_off,
            deviceData.data.mappings.Switch1_on,
            deviceData.data.mappings.Switch1_state,
          ]"
          class="pt-2"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.manual`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              class="py-0 my-0"
              instance="Switch1"
              style="margin-left: 10px"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch2_off,
            deviceData.data.mappings.Switch2_on,
            deviceData.data.mappings.Switch2_state,
          ]"
          class="pt-2"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.activateTimeControl`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              class="py-0 my-0"
              instance="Switch2"
              style="margin-left: 10px"
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
            <div class="text-center">
              {{ $t("devices.ElectronicBoiler.settingsView.sliderLabel") }}
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
            <div class="d-flex justify-center">
              <OutputFieldBase
                :variable-data="deviceData.data.mappings"
                instance="OutputField"
                :is-preview="isPreview"
              />
              <span class="pl-2">%</span>
            </div>
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
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent ElectronicBoiler device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    InputFieldBase,
    SwitchBase,
    SliderBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
  computed: {
    sliderActualValue() {
      return this.measurements.get(this.deviceData!.data.mappings.OutputField_actualValue);
    },
    isActualValueVariableFilled() {
      return !!this.deviceData!.data.mappings.OutputField1_actualValue.length;
    },
  },
});
</script>

<style lang="scss">
.electric-boiler {
  font-size: 20px;
}

.electric-boiler-settings {
  font-size: 20px;
}
</style>
