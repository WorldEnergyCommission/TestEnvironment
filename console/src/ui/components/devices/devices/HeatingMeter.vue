<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="heating_meter"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="heating-meter">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :variable-data="deviceData.data.mappings"
              instance="OutputField2"
              :is-preview="isPreview"
            />
            <div class="pl-2">kWh</div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #settings-view>
      <div class="heating-meter-settings">
        <div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="heating-capacity" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField1"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kW</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="heating-capacity-consumption_tarif_1" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField3_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField3"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="heating-capacity-consumption_tarif_2" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField4_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField4"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="counter-used-water" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField5_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField5"
                  :is-preview="isPreview"
                />
                <div class="pl-2">m³</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="value-flow" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField6_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField6"
                  :is-preview="isPreview"
                />
                <div class="pl-2">m³/h</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="temperature_forward" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField7_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField7"
                  :is-preview="isPreview"
                />
                <div class="pl-2">°C</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="temperature_return" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField8_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField8"
                  :is-preview="isPreview"
                />
                <div class="pl-2">°C</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="temperature_difference" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField9_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField9"
                  :is-preview="isPreview"
                />
                <div class="pl-2">k</div>
              </template>
            </LabelUnitWrapper>
          </div>
        </div>
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
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent HeatingMeter device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
  computed: {
    isActualValueVariableFilled() {
      return !!this.deviceData!.data.mappings.OutputField2_actualValue.length;
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/mixins";

.heating-meter {
  @include mediumText;
}

.heating-meter-settings {
  display: flex;
  justify-content: center;
  font-size: 20px;
  color: rgb(var(--v-theme-lynusText));

  .settings-view-field {
    margin-top: 10px;

    &:first-of-type {
      margin-top: 0;
    }

    .icon-wrapper {
      width: 50px;
    }
  }
}
</style>
