<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="ventilator"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="ventilation">
        <div class="basic-control-field">
          <InputFieldBase
            :description-styles="{ paddingRight: '10px' }"
            :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="100"
            :min="0"
            :small="true"
            :step="1"
            :unit-styles="{ padding: '0 5px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField"
            :is-preview="isPreview"
          >
            <template #textDescription> Speed </template>
            <template #unit> % </template>
          </InputFieldBase>
        </div>
        <div class="basic-control-field d-flex align-center justify-space-between">
          <div class="d-flex filter-state">
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="3000"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField1"
                  :is-preview="isPreview"
                />
                <div class="pl-1">rpm</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex align-center filter-event">
            <ShowEventDotBase
              :variable-data="deviceData.data.mappings"
              height="15"
              instance="ShowEventDot1"
              width="15"
              :is-preview="isPreview"
            />
            <div class="filter-text">
              <LabelUnitWrapper
                :variables-list-for-check="[
                  deviceData.data.mappings.ShowEventDot1_errorWarningState,
                ]"
              >
                <template #label>
                  {{ $t(`${langPath}.mainView.changeSupplyFilter`) }}
                </template>
              </LabelUnitWrapper>
            </div>
          </div>
        </div>
        <div class="basic-control-field d-flex align-center justify-space-between">
          <div class="d-flex filter-state">
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="3000"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField2"
                  :is-preview="isPreview"
                />
                <div class="pl-1">rpm</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex align-center filter-event">
            <ShowEventDotBase
              :variable-data="deviceData.data.mappings"
              height="15"
              instance="ShowEventDot2"
              width="15"
              :is-preview="isPreview"
            />
            <div class="filter-text">
              <LabelUnitWrapper
                :variables-list-for-check="[
                  deviceData.data.mappings.ShowEventDot2_errorWarningState,
                ]"
              >
                <template #label>
                  {{ $t(`${langPath}.mainView.changeExhaustFilter`) }}
                </template>
              </LabelUnitWrapper>
            </div>
          </div>
        </div>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch_on,
            deviceData.data.mappings.Switch_off,
            deviceData.data.mappings.Switch_state,
          ]"
          class="pt-2"
        >
          <template #label>
            {{ $t(`${langPath}.mainView.manual`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              class="py-0 my-0"
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
          class=""
        >
          <template #label>
            {{ $t(`${langPath}.mainView.reset`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              button-size="35"
              class="mr-2"
              icon="push_reset"
              icon-size="25"
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
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent Ventilation device
 */
export default defineComponent({
  components: {
    SwitchBase,
    InputFieldBase,
    OutputFieldBase,
    ShowEventDotBase,
    PushButtonBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
});
</script>

<style lang="scss">
.ventilation {
  width: 100%;

  .basic-control-field {
    &:nth-of-type(3),
    &:nth-of-type(4) {
      margin-top: 0 !important;
    }

    margin-top: 9px;

    .filter-state {
      width: 40%;
      font-size: 20px;
    }

    .filter-event {
      width: 60%;

      .filter-text {
        margin-left: 10px;
        font-size: 11px;
      }
    }
  }

  .input-field-base {
    font-size: 20px;
    @media all and (min-width: 1264px) and (max-width: 1400px) {
      font-size: 14px;
    }
  }

  .v-input--selection-controls__input {
    margin-right: 0 !important;
  }
}
</style>
