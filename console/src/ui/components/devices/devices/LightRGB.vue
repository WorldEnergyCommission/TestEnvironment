<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #basic-controls>
      <div class="light-rgb d-flex">
        <div class="rgb">
          <div class="previews-wrapper">
            <div class="color-preview">
              <div class="rgb-color-preview" />
              <OutputFieldBase
                :variable-data="deviceData.data.mappings"
                instance="OutputField2"
                :is-preview="isPreview"
              />
            </div>
            <div class="color-preview">
              <div class="rgb-color-preview" />
              <OutputFieldBase
                :variable-data="deviceData.data.mappings"
                instance="OutputField3"
                :is-preview="isPreview"
              />
            </div>
            <div class="color-preview">
              <div class="rgb-color-preview" />
              <OutputFieldBase
                :variable-data="deviceData.data.mappings"
                instance="OutputField4"
                :is-preview="isPreview"
              />
            </div>
          </div>
          <div class="slider">
            <SliderRGBBase
              :is-active="isActive"
              :state="sliderRGBActualValue"
              :variable-data="deviceData.data.mappings"
              instance="SliderRGB"
            />
          </div>
        </div>
        <div class="switch">
          <SwitchBase
            :variable-data="deviceData.data.mappings"
            instance="Switch"
            :is-preview="isPreview"
          />
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="light-rgb-settings">
        <div class="advanced-rgb">
          <SliderRGBCanvas
            :is-active="isActive"
            :state="sliderRGBActualValue"
            :variable-data="deviceData.data.mappings"
            instance="SliderRGB"
          />
        </div>
        <div class="pt-4">
          <div class="text-center switch-field-text" style="line-height: 1">
            {{ $t("devices.LightRGB.settingsView.sliderLabel") }}
          </div>
          <div class="d-flex">
            <div style="width: 90%">
              <SliderBase
                :data="deviceData.data"
                :is-active="isActive"
                :state="sliderActualValue"
                :variable-data="deviceData.data.mappings"
                append-icon="icon-light-switch_on"
                instance="Slider"
                prepend-icon="icon-light-switch_off"
              />
            </div>
            <div style="display: flex; padding-top: 4px; padding-left: 10px">
              <OutputFieldBase
                :variable-data="deviceData.data.mappings"
                instance="OutputField1"
                :is-preview="isPreview"
              />
              <span style="padding-left: 4px">%</span>
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

import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import SliderRGBBase from "@/ui/components/devices/devices/base/SliderRGBBase.vue";
import SliderRGBCanvas from "@/ui/components/devices/devices/base/SliderRGBCanvas.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent LightRGB device
 */
export default defineComponent({
  components: {
    SwitchBase,
    SliderBase,
    OutputFieldBase,
    SliderRGBBase,
    SliderRGBCanvas,
    DeviceLayout,
  },
  extends: DeviceBase,
  computed: {
    isActive() {
      return !!this.measurements.get(this.deviceData!.data.mappings.Switch_state);
    },
    sliderRGBActualValue() {
      const r = this.measurements.get(this.deviceData!.data.mappings.OutputField2_actualValue);
      const g = this.measurements.get(this.deviceData!.data.mappings.OutputField3_actualValue);
      const b = this.measurements.get(this.deviceData!.data.mappings.OutputField4_actualValue);
      return { r, g, b };
    },
    sliderActualValue() {
      return this.measurements.get(this.deviceData!.data.mappings.OutputField1_actualValue);
    },
  },
});
</script>

<style lang="scss" scoped>
.light-rgb {
  width: 100%;

  .rgb {
    width: 70%;

    .previews-wrapper {
      display: flex;
      justify-content: space-between;

      .color-preview {
        display: flex;
        align-items: center;
        font-size: 15px;

        .rgb-color-preview {
          width: 16px;
          height: 16px;
          background: #ff0000;
          border-radius: 50%;
          margin-right: 5px;
        }

        &:nth-of-type(2) {
          .rgb-color-preview {
            background: #08bc08;
          }
        }

        &:nth-of-type(3) {
          .rgb-color-preview {
            background: #0047f8;
          }
        }
      }
    }
  }

  .switch {
    display: flex;
    width: 30%;
    justify-content: flex-end;
  }
}
</style>
