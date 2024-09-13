<template>
  <LightDimmer :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LightDimmer from "@/ui/components/devices/devices/LightDimmer.vue";

export default defineComponent({
  components: {
    LightDimmer,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "LightDimmer",
        data: {
          mappings: {
            OutputField_actualValue: "lightDimmerOutput",
            Slider_targetValue: "lightDimmerSlider",
            Switch_on: "lightDimmerSwitch",
            Switch_off: "lightDimmerSwitch",
            Switch_state: "lightDimmerSwitch",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.LightDimmer.previewName");
    },
  },
});
</script>
