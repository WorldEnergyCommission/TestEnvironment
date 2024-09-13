<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="awning"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="control-awning">
        <div class="top">
          <ArrowInBase
            :small="true"
            :variable-data="deviceData.data.mappings"
            class="mr-2"
            instance="ArrowIn"
            :is-preview="isPreview"
          />
          <ArrowOutBase
            :small="true"
            :variable-data="deviceData.data.mappings"
            instance="ArrowOut"
            :is-preview="isPreview"
          />
        </div>
        <div class="bottom">
          <LabelUnitWrapper
            :variables-list-for-check="[
              deviceData.data.mappings.Slider_targetValue,
              deviceData.data.mappings.OutputField_actualValue,
            ]"
            view="column"
          >
            <template #label>
              <div class="text-center">
                {{ $t("devices.ControlAwning.mainView.sliderLabel") }}
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
                class="py-0"
                :is-preview="isPreview"
              />
              <div class="d-flex justify-center">
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
      <div class="control-awning-settings">
        <InputFieldBase
          :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan600]"
          :input-field-styles="{ flexGrow: '1' }"
          :max="600"
          :min="0"
          :step="1"
          :unit-styles="{ width: '80px' }"
          :variable-data="deviceData.data.mappings"
          instance="InputField2"
          :is-preview="isPreview"
        >
          <template #unit>
            {{ $t("uiComponents.form.sec") }}
          </template>
          <template #icon>
            <div class="d-flex flex-column pr-2" style="margin-top: -10px">
              <lynus-icon name="arrow_up" />
              <lynus-icon class="ml-1" name="time" size="20" />
            </div>
          </template>
        </InputFieldBase>
        <InputFieldBase
          :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan600]"
          :input-field-styles="{ flexGrow: '1' }"
          :max="600"
          :min="0"
          :step="1"
          :unit-styles="{ width: '80px' }"
          :variable-data="deviceData.data.mappings"
          class="pt-2"
          instance="InputField1"
          :is-preview="isPreview"
        >
          <template #unit>
            {{ $t("uiComponents.form.sec") }}
          </template>
          <template #icon>
            <div class="d-flex flex-column pr-2" style="margin-top: -10px">
              <lynus-icon name="arrow_down" />
              <lynus-icon class="ml-1" name="time" size="20" />
            </div>
          </template>
        </InputFieldBase>
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

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import ArrowInBase from "@/ui/components/devices/devices/base/ArrowInBase.vue";
import ArrowOutBase from "@/ui/components/devices/devices/base/ArrowOutBase.vue";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent ControlAwning device
 */
export default defineComponent({
  components: {
    SliderBase,
    OutputFieldBase,
    PushButtonBase,
    InputFieldBase,
    ArrowInBase,
    ArrowOutBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
  computed: {
    sliderActualValue() {
      return this.measurements.get(this.deviceData!.data.mappings.OutputField_actualValue);
    },
  },
});
</script>

<style lang="scss" scoped>
.control-awning {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .top {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .bottom {
    width: 100%;
    margin-top: 10px;

    .slider-actual-value {
      display: flex;
      justify-content: center;
      font-size: 20px;
      line-height: 1;
    }
  }
}

.control-awning-settings {
  font-size: 20px;
}
</style>
