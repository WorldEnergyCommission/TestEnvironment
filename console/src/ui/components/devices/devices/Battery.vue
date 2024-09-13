<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="battery"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="battery-base-wrapper">
        <BatteryBase
          :max="100"
          :min="0"
          :variable-data="deviceData.data.mappings"
          instance="Battery"
          unit="%"
          :is-preview="isPreview"
        />
      </div>
    </template>
    <template #settings-view>
      <div class="battery-settings">
        <div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="electrical_voltage" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="1000"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField1"
                  :is-preview="isPreview"
                />
                <div class="pl-2">volt</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="temperature" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="120"
                  :min="-30"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField2"
                  :is-preview="isPreview"
                />
                <div class="pl-2">°C</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="electricity" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField3_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="1000"
                  :min="-1000"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField3"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kW</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field align-center">
            <div class="icon-wrapper">
              <lynus-icon name="favourites" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField4_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="false"
                  :max="100"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField4"
                  :is-preview="isPreview"
                />
                <div class="pl-2">SOH</div>
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
import BatteryBase from "@/ui/components/devices/devices/base/BatteryBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent Battery device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    BatteryBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.battery-base-wrapper {
  position: relative;
  height: 100%;
  width: 70%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.battery-settings {
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
