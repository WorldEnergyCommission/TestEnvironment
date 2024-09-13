<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="weather-station"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="weather-station justify-space-between">
        <div class="float-left">
          <div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="compass_west" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="200"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField1"
                    :is-preview="isPreview"
                  />
                  <span>kLux</span>
                </template>
              </LabelUnitWrapper>
            </div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="compass_south" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="200"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField2"
                    :is-preview="isPreview"
                  />
                  <span>kLux</span>
                </template>
              </LabelUnitWrapper>
            </div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="compass_east" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField3_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="200"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField3"
                    :is-preview="isPreview"
                  />
                  <span>kLux</span>
                </template>
              </LabelUnitWrapper>
            </div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="moon" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField4_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="1000"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField4"
                    :is-preview="isPreview"
                  />
                  <span>lux</span>
                </template>
              </LabelUnitWrapper>
            </div>
          </div>
        </div>
        <div class="float-right">
          <div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="humidity" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField5_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="100"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField5"
                    :is-preview="isPreview"
                  />
                  <span>%</span>
                </template>
              </LabelUnitWrapper>
            </div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="windspeed" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField6_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="50"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField6"
                    :is-preview="isPreview"
                  />
                  <span>m/s</span>
                </template>
              </LabelUnitWrapper>
            </div>
            <div class="d-flex align-center weather-station-content-item">
              <div class="icon-wrapper">
                <lynus-icon color="theme" name="rainfall" />
              </div>
              <LabelUnitWrapper
                :variables-list-for-check="[deviceData.data.mappings.OutputField7_actualValue]"
              >
                <template #value>
                  <OutputFieldBase
                    :max="1"
                    :min="0"
                    :variable-data="deviceData.data.mappings"
                    class="px-1"
                    instance="OutputField7"
                    :is-preview="isPreview"
                  />
                  <span>rainfall</span>
                </template>
              </LabelUnitWrapper>
            </div>
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
 * Component that represent WeatherStation device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.weather-station {
  width: 100%;
  display: flex;
  font-size: 20px;
  @media all and (max-width: 1270px) {
    font-size: 16px;
  }
  @media all and (min-width: 1280px) and (max-width: 1650px) {
    font-size: 14px;
  }
  @media all and (min-width: 1280px) and (max-width: 1450px) {
    flex-direction: column;
    align-items: center;
    font-size: 12px;
  }

  .left,
  .right {
    width: 50%;
  }
  .weather-station-content-item {
    padding: 5px;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    @media all and (min-width: 1280px) and (max-width: 1450px) {
      align-items: flex-start;
    }
  }
}
</style>
