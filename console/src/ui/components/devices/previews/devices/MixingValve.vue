<template>
  <MixingValve :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MixingValve from "@/ui/components/devices/devices/MixingValve.vue";

export default defineComponent({
  components: {
    MixingValve,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "MixingValve",
        data: {
          type: "MixingValve",
          mappings: {
            PushButton1_onOff: "mixingValvePush1",
            PushButton1_state: "mixingValvePush1",
            PushButton2_onOff: "mixingValvePush2",
            PushButton2_state: "mixingValvePush2",
            PushButton3_onOff: "mixingValvePush2",
            PushButton3_state: "mixingValvePush3",
            PushButton4_onOff: "mixingValvePush4",
            PushButton4_state: "mixingValvePush4",
            OutputField_actualValue: "mixingValveOutput",
            Slider_targetValue: "mixingValveSlider",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.MixingValve.mainView";
    },
    previewNameLang() {
      return this.$t("devices.MixingValve.previewName");
    },
  },
});
</script>
