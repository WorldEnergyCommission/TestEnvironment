<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="thermostat"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="thermostat-analog">
        <div class="top">
          <InputFieldBase
            :description-styles="{ maxWidth: '80px', fontSize: '10px' }"
            :field-rules="[
              rules.fieldLessThan50,
              rules.fieldMoreThanNull,
              rules.required,
              rules.twoComas,
            ]"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="true"
            :max="50"
            :min="0"
            :small="true"
            :step="0.01"
            :unit-styles="{ width: '30px', fontSize: '15px', paddingTop: '2px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField1"
            :is-preview="isPreview"
          >
            <template #textDescription>
              {{ $t(`${langPath}.mainView.normalTemperature`) }}
            </template>
            <template #unit> &deg;C </template>
          </InputFieldBase>
        </div>
        <div class="bottom d-flex justify-space-around">
          <div class="d-flex align-center">
            <ShowEventDotBase
              :items="[[251, '#04adfa']]"
              :variable-data="deviceData.data.mappings"
              height="15"
              instance="ShowEventDot1"
              width="15"
              :is-preview="isPreview"
            />
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.ShowEventDot1_errorWarningState]"
            >
              <template #label>
                <span class="pl-1">{{ $t(`${langPath}.mainView.cooling`) }}</span>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex align-center">
            <ShowEventDotBase
              :items="[[251, '#ff0000']]"
              :variable-data="deviceData.data.mappings"
              height="15"
              instance="ShowEventDot2"
              width="15"
              :is-preview="isPreview"
            />
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.ShowEventDot2_errorWarningState]"
            >
              <template #label>
                <span class="pl-1">{{ $t(`${langPath}.mainView.heating`) }}</span>
              </template>
            </LabelUnitWrapper>
          </div>
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="thermostat-analog-settings">
        <div class="thermostat-analog-settings-field">
          <InputFieldBase
            :description-styles="{ width: '240px' }"
            :field-rules="[
              rules.fieldLessThan50,
              rules.fieldMoreThanNull,
              rules.required,
              rules.twoComas,
            ]"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="true"
            :max="50"
            :min="0"
            :step="1"
            :unit-styles="{ width: '100px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField2"
            :is-preview="isPreview"
          >
            <template #textDescription>
              {{ $t(`${langPath}.settingsView.loweringTemperature`) }}
            </template>
            <template #unit> °C </template>
          </InputFieldBase>
        </div>
        <div class="thermostat-analog-settings-field">
          <InputFieldBase
            :description-styles="{ width: '240px' }"
            :field-rules="[rules.fieldHours, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="23"
            :min="0"
            :step="1"
            :unit-styles="{ width: '60px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField3"
            :is-preview="isPreview"
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
        </div>
        <div class="thermostat-analog-settings-field">
          <InputFieldBase
            :description-styles="{ width: '240px' }"
            :field-rules="[rules.fieldMinutes, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="59"
            :min="0"
            :step="1"
            :unit-styles="{ width: '60px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField5"
            :is-preview="isPreview"
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
        </div>
        <div class="thermostat-analog-settings-field">
          <InputFieldBase
            :description-styles="{ width: '240px' }"
            :field-rules="[rules.fieldHours, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="23"
            :min="0"
            :step="1"
            :unit-styles="{ width: '60px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField4"
            :is-preview="isPreview"
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
        </div>
        <div class="thermostat-analog-settings-field">
          <InputFieldBase
            :description-styles="{ width: '240px' }"
            :field-rules="[rules.fieldMinutes, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="59"
            :min="0"
            :step="1"
            :unit-styles="{ width: '60px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField6"
            :is-preview="isPreview"
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
        </div>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch1_on,
            deviceData.data.mappings.Switch1_off,
            deviceData.data.mappings.Switch1_state,
          ]"
          class="pt-4"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.activateLoweringMode`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              instance="Switch1"
              style="margin: 0"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch2_on,
            deviceData.data.mappings.Switch2_off,
            deviceData.data.mappings.Switch2_state,
          ]"
          class="pt-4"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.changeHeatingCoolingMode`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              instance="Switch2"
              style="margin: 0"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch3_on,
            deviceData.data.mappings.Switch3_off,
            deviceData.data.mappings.Switch3_state,
          ]"
          class="pt-4"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.activateTimeControl`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              instance="Switch3"
              style="margin: 0"
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
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent ThermostatAnalog device
 */
export default defineComponent({
  components: {
    InputFieldBase,
    SwitchBase,
    ShowEventDotBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
});
</script>

<style lang="scss">
.thermostat-analog {
  width: 100%;

  .bottom {
    font-size: 12px;
  }
}

.thermostat-analog-settings {
  .input-field-base {
    &__unit {
      font-size: 20px;
      padding-top: 2px;
    }
  }

  .thermostat-analog-settings-field {
    margin-top: 10px;

    &:first-of-type {
      margin-top: 0;
    }
  }
}
</style>
