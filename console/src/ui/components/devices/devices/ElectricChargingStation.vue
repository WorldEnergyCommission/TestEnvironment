<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="electric-charging-station"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="electric-charging-station">
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
        <div class="d-flex show-event-section align-center">
          <ShowEventDotBase
            :variable-data="deviceData.data.mappings"
            height="15"
            instance="ShowEventDot"
            width="15"
            :is-preview="isPreview"
          />
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.ShowEventDot_errorWarningState]"
          >
            <template #label>
              <span class="pl-2">{{ $t(`${langPath}.mainView.connected`) }}</span>
            </template>
          </LabelUnitWrapper>
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="electric-charging-station-settings">
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch1_on,
            deviceData.data.mappings.Switch1_off,
            deviceData.data.mappings.Switch1_state,
          ]"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.minCharge`) }}
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
            deviceData.data.mappings.Switch2_on,
            deviceData.data.mappings.Switch2_off,
            deviceData.data.mappings.Switch2_state,
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
              instance="Switch2"
              style="margin-left: 10px"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
        >
          <template #label>
            <div class="d-flex justify-center">
              <div class="pr-2">
                {{ $rt(($tm(`${langPath}.settingsView.chargingTime`) as any)[0]) }}
              </div>

              <OutputFieldBase
                :is-decimal="false"
                :max="2000"
                :min="0"
                :variable-data="deviceData.data.mappings"
                instance="OutputField2"
                :is-preview="isPreview"
              />
              <div class="pl-2">
                {{ $rt(($tm(`${langPath}.settingsView.chargingTime`) as any)[1]) }}
              </div>
            </div>
          </template>
        </LabelUnitWrapper>
        <InputFieldBase
          :field-rules="[
            rules.required,
            rules.fieldMoreThanNull,
            rules.fieldLessThan1000,
            rules.twoComas,
          ]"
          :input-field-styles="{ flexGrow: '1' }"
          :is-decimal="true"
          :max="1000"
          :min="0"
          :step="0.01"
          :unit-styles="{ width: '100px' }"
          :variable-data="deviceData.data.mappings"
          class="pt-2"
          instance="InputField"
        >
          <template #unit> kW </template>
        </InputFieldBase>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Slider_targetValue,
            deviceData.data.mappings.OutputField_actualValue,
          ]"
          class="pt-2"
          view="column"
        >
          <template #label>
            <div class="text-center switch-field-text" style="line-height: 1">
              {{ $t("devices.ElectricChargingStation.settingsView.sliderLabel") }}
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
            />
            <div class="d-flex">
              <OutputFieldBase
                :is-decimal="false"
                :max="100"
                :min="0"
                :variable-data="deviceData.data.mappings"
                instance="OutputField"
                :is-preview="isPreview"
              />
              <div class="pl-2">%</div>
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
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent ElectricChargingStation device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    InputFieldBase,
    SwitchBase,
    SliderBase,
    ShowEventDotBase,
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
.electric-charging-station {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  .show-event-section {
    font-size: 15px;
  }
}

.electric-charging-station-settings {
  color: rgb(var(--v-theme-lynusText));
  font-size: 20px;
}
</style>
