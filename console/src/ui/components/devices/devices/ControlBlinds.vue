<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="blinds"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="control-blinds">
        <DropDownBase
          :text-mapping="textMapping"
          :variable-data="deviceData.data.mappings"
          instance="DropDown"
          label="Slats Position"
          style="width: 100%"
          :is-preview="isPreview"
        />
        <div class="d-flex justify-center pt-4">
          <ArrowUpBase
            :variable-data="deviceData.data.mappings"
            class="mr-2"
            instance="ArrowUp"
            :is-preview="isPreview"
          />
          <ArrowDownBase
            :variable-data="deviceData.data.mappings"
            instance="ArrowDown"
            :is-preview="isPreview"
          />
        </div>
        <div class="pt-4" style="width: 100%">
          <LabelUnitWrapper
            :variables-list-for-check="[
              deviceData.data.mappings.Slider_targetValue,
              deviceData.data.mappings.OutputField_actualValue,
            ]"
            view="column"
          >
            <template #label>
              <div class="text-center">
                {{ $t("devices.ControlBlinds.mainView.sliderLabel") }}
              </div>
            </template>
            <template #value>
              <SliderBase
                :data="deviceData.data"
                :end-timeout="1000"
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
                <span>%</span>
              </div>
            </template>
          </LabelUnitWrapper>
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="control-blinds-settings">
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan600]"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="600"
            :min="0"
            :step="1"
            :unit-styles="{ width: '70px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField1"
            :is-preview="isPreview"
          >
            <template #unit> sec </template>
            <template #icon>
              <div class="icons">
                <lynus-icon class="icon1" name="arrow_up" />
                <lynus-icon class="icon2" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan600]"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="false"
            :max="600"
            :min="0"
            :step="1"
            :unit-styles="{ width: '70px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField2"
            :is-preview="isPreview"
          >
            <template #unit> sec </template>
            <template #icon>
              <div class="icons">
                <lynus-icon class="icon1" name="arrow_down" />
                <lynus-icon class="icon2" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <div class="control-blinds-settings-field">
          <InputFieldBase
            :field-rules="[
              rules.fieldMoreThanNull,
              rules.required,
              rules.fieldLessThan10,
              rules.twoComas,
            ]"
            :input-field-styles="{ flexGrow: '1' }"
            :is-decimal="true"
            :max="10"
            :min="0"
            :step="0.01"
            :unit-styles="{ width: '70px' }"
            :variable-data="deviceData.data.mappings"
            instance="InputField3"
            :is-preview="isPreview"
          >
            <template #unit> sec </template>
            <template #icon>
              <div class="icons icons3">
                <lynus-icon class="icon-shutter" name="shutter1" size="18" />
                <lynus-icon class="icon2" name="time" size="20" />
              </div>
            </template>
          </InputFieldBase>
        </div>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton_onOff,
            deviceData.data.mappings.PushButton_state,
          ]"
          view="column"
        >
          <template #label>
            <div class="text-center">
              {{ $t(`${langPath}.settingsView.homePosition`) }}
            </div>
          </template>
          <template #value>
            <div class="d-flex justify-center" style="width: 100%">
              <PushButtonBase
                :variable-data="deviceData.data.mappings"
                instance="PushButton"
                :is-preview="isPreview"
              />
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

import DeviceBase from "./DeviceBase";
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import ArrowDownBase from "@/ui/components/devices/devices/base/ArrowDownBase.vue";
import ArrowUpBase from "@/ui/components/devices/devices/base/ArrowUpBase.vue";
import DropDownBase from "@/ui/components/devices/devices/base/DropDown.vue";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent ControlBlinds device
 */
export default defineComponent({
  components: {
    SliderBase,
    OutputFieldBase,
    InputFieldBase,
    PushButtonBase,
    ArrowDownBase,
    ArrowUpBase,
    DropDownBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
  computed: {
    textMapping() {
      return {
        0: this.$t(`${this.langPath}.mainView.dropDown.fullyOpen`),
        1: this.$t(`${this.langPath}.mainView.dropDown.threeQuarterOpen`),
        2: this.$t(`${this.langPath}.mainView.dropDown.halfOpen`),
        3: this.$t(`${this.langPath}.mainView.dropDown.quarterOpen`),
        4: this.$t(`${this.langPath}.mainView.dropDown.closed`),
      };
    },
    sliderActualValue() {
      return this.measurements.get(this.deviceData!.data.mappings.OutputField_actualValue);
    },
  },
});
</script>

<style lang="scss" scoped>
.control-blinds {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.control-blinds-settings {
  font-size: 20px;

  .control-blinds-settings-field {
    .icons {
      display: flex;
      flex-direction: column;
      padding-right: 10px;
      margin-top: -10px;

      .icon2 {
        margin-left: 5px;
      }

      .icon-shutter {
        margin: 0 0 4px 5px;
      }
    }

    .icons3 {
      margin: 0 5px 0 0;
    }
  }

  .home-position {
    margin-bottom: 10px;
    font-size: 15px;
    color: rgb(var(--v-theme-lynusText));
  }
}
</style>
