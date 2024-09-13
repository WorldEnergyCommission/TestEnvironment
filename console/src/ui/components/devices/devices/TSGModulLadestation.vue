<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="electric-charging-station"
    device-icon-size="0"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div style="width: 100%">
        <div class="d-flex my-2">
          <lynus-icon :size="26" color="theme" name="electric-charging-station" />
          <div class="modul-ladestation-valueSpacing">
            <ShowEventDotBase
              :items="[
                [1, '#30bf54'],
                [2, 'orange'],
                [3, '#0d6efd'],
              ]"
              :variable-data="deviceData.data.mappings"
              height="16"
              instance="ShowEventDot"
              style="padding-top: 5px"
              width="16"
              :is-preview="isPreview"
            />
          </div>
        </div>
        <div class="d-flex my-2">
          <lynus-icon :size="26" color="theme" name="charging_power_3" />
          <div class="d-flex modul-ladestation-valueSpacing">
            <OutputFieldBase
              :disable-min-max-filter="true"
              :is-decimal="true"
              :max="0"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField1"
              :is-preview="isPreview"
            />
            <div class="ml-2">kW</div>
          </div>
        </div>
        <div class="d-flex my-2">
          <lynus-icon :size="26" color="theme" name="battery" />
          <div class="d-flex modul-ladestation-valueSpacing">
            <OutputFieldBase
              :disable-min-max-filter="true"
              :is-decimal="true"
              :max="0"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField2"
              :is-preview="isPreview"
            />
            <div class="ml-2">kWh</div>
          </div>
        </div>
        <div class="d-flex my-2">
          <lynus-icon :size="26" color="theme" name="time" />
          <div class="d-flex modul-ladestation-valueSpacing">
            <OutputFieldBase
              :disable-min-max-filter="true"
              :is-decimal="true"
              :max="0"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField3"
              :is-preview="isPreview"
            />
            <div class="ml-2">min</div>
          </div>
        </div>
        <div class="d-flex my-2">
          <lynus-icon :size="26" color="theme" name="ronova_battery_50" />
          <div class="d-flex modul-ladestation-valueSpacing">
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField4_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="100"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField4"
                  :is-preview="isPreview"
                />
                <span class="pl-2">%</span>
              </template>
            </LabelUnitWrapper>
          </div>
        </div>
        <div class="d-flex my-2">
          <lynus-icon :size="26" color="theme" name="electricity" />
          <div class="d-flex modul-ladestation-valueSpacing">
            <OutputFieldBase
              :disable-min-max-filter="true"
              :is-decimal="true"
              :max="0"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField5"
              :is-preview="isPreview"
            />
            <div class="ml-2">kWh</div>
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
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

export default defineComponent({
  components: {
    ShowEventDotBase,
    DeviceLayout,
    OutputFieldBase,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.tsg-modul-ladestation {
  width: 100%;
}

.modul-ladestation-valueSpacing {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
