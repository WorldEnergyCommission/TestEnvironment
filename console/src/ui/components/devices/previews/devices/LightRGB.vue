<template>
  <LightRGB :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LightRGB from "@/ui/components/devices/devices/LightRGB.vue";

export default defineComponent({
  components: {
    LightRGB,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "LightRGB",
        data: {
          mappings: {
            Switch_on: "lightRGBSwitch",
            Switch_off: "lightRGBSwitch",
            Switch_state: "lightRGBSwitch",
            Slider_targetValue: "lightRGBSlider",
            SliderRGB_targetValue_red: "lightRGBSliderRed",
            SliderRGB_targetValue_green: "lightRGBSliderGreen",
            SliderRGB_targetValue_blue: "lightRGBSliderBlue",
            OutputField1_actualValue: "lightRGBOutput1",
            OutputField2_actualValue: "lightRGBOutput2",
            OutputField3_actualValue: "lightRGBOutput3",
            OutputField4_actualValue: "lightRGBOutput4",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.LightRGB.previewName");
    },
  },
});
</script>
