<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="thermostat"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="thermostat-digital">
        <CoreContainer class="pa-0" fluid>
          <CoreRow no-gutters>
            <CoreColumn class="d-flex justify-center">
              <MinusBase
                :variable-data="deviceData.data.mappings"
                instance="Minus"
                :is-preview="isPreview"
              />
            </CoreColumn>
            <CoreColumn class="d-flex justify-center">
              <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="50"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    instance="OutputField"
                    :is-preview="isPreview"
                  />
                  <span>°C</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn class="d-flex justify-center">
              <PlusBase
                :variable-data="deviceData.data.mappings"
                color="#ED5A24"
                instance="Plus"
                :is-preview="isPreview"
              />
            </CoreColumn>
          </CoreRow>
          <CoreRow no-gutters>
            <CoreColumn class="d-flex align-center justify-center pt-2">
              <ShowEventDotBase
                :items="[[251, '#04adfa']]"
                :variable-data="deviceData.data.mappings"
                height="15"
                instance="ShowEventDot1"
                width="15"
                :is-preview="isPreview"
              />
              <span class="pl-1">{{ $t(`${langPath}.mainView.cooling`) }}</span>
            </CoreColumn>
            <CoreColumn />
            <CoreColumn class="d-flex align-center justify-center pt-2">
              <ShowEventDotBase
                :items="[[251, '#ff0000']]"
                :variable-data="deviceData.data.mappings"
                height="15"
                instance="ShowEventDot2"
                width="15"
                :is-preview="isPreview"
              />
              <span class="pl-1">{{ $t(`${langPath}.mainView.heating`) }}</span>
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </div>
    </template>
    <template #settings-view>
      <div class="thermostat-digital-settings">
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :description-styles="{ width: '100px' }"
            :field-rules="[rules.fieldHours, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="23"
            :min="0"
            :step="1"
            :unit-styles="{ width: '50px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField1"
            :is-preview="isPreview"
          >
            <template #textDescription>
              {{ $t("uiComponents.form.on") }}
            </template>
            <template #unit>
              {{ $t("uiComponents.form.h") }}
            </template>
            <template #icon>
              <div class="icon-wrapper">
                <lynus-icon class="icon" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :description-styles="{ width: '100px' }"
            :field-rules="[rules.fieldMinutes, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="59"
            :min="0"
            :step="1"
            :unit-styles="{ width: '50px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField3"
            :is-preview="isPreview"
          >
            <template #textDescription>
              {{ $t("uiComponents.form.on") }}
            </template>
            <template #unit>
              {{ $t("uiComponents.form.min") }}
            </template>
            <template #icon>
              <div class="icon-wrapper">
                <lynus-icon class="icon" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :description-styles="{ width: '100px' }"
            :field-rules="[rules.fieldHours, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="23"
            :min="0"
            :step="1"
            :unit-styles="{ width: '50px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField2"
            :is-preview="isPreview"
          >
            <template #textDescription>
              {{ $t("uiComponents.form.off") }}
            </template>
            <template #unit>
              {{ $t("uiComponents.form.h") }}
            </template>
            <template #icon>
              <div class="icon-wrapper">
                <lynus-icon class="icon" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :description-styles="{ width: '100px' }"
            :field-rules="[rules.fieldMinutes, rules.fieldMoreThanNull, rules.required]"
            :icon-styles="{ width: '40px' }"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="59"
            :min="0"
            :step="1"
            :unit-styles="{ width: '50px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField4"
            :is-preview="isPreview"
          >
            <template #textDescription>
              {{ $t("uiComponents.form.off") }}
            </template>
            <template #unit>
              {{ $t("uiComponents.form.min") }}
            </template>
            <template #icon>
              <div class="icon-wrapper">
                <lynus-icon class="icon" name="time" size="20" />
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
          class="pt-2"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.activateLoweringMode`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              instance="Switch1"
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
          class="pt-2"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.changeHeatingCoolingMode`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              instance="Switch2"
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
          class="pt-2"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.activateTimeControl`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              instance="Switch3"
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
import MinusBase from "@/ui/components/devices/devices/base/MinusBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PlusBase from "@/ui/components/devices/devices/base/PlusBase.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent ThermostatDigital device
 */
export default defineComponent({
  components: {
    SwitchBase,
    OutputFieldBase,
    InputFieldBase,
    ShowEventDotBase,
    MinusBase,
    PlusBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
  computed: {
    isActualValueVariableFilled() {
      return !!this.deviceData!.data.mappings.OutputField_actualValue.length;
    },
  },
});
</script>

<style lang="scss">
.thermostat-digital {
  width: 100%;

  .row {
    font-size: 20px;

    &:last-of-type {
      font-size: 12px;
    }
  }
}

.thermostat-digital-settings {
  font-size: 20px;

  .control-blinds-settings-field {
    margin-top: 10px;

    &:first-of-type {
      margin-top: 0;
    }

    .icon-wrapper {
      display: flex;
      flex-direction: column;
      padding-right: 10px;
      margin-top: -10px;

      .icon {
        margin-top: 15px;
      }
    }
  }

  .switches-wrapper {
    .switch-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 20px;

      &:first-of-type {
        margin-top: 10px;
      }
    }
  }

  .v-input--selection-controls {
    margin-top: 0;
  }

  .v-input--selection-controls__input {
    margin-right: 0 !important;
  }
}
</style>
