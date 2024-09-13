<template>
  <PumpWithVFD :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PumpWithVFD from "@/ui/components/devices/devices/PumpWithVFD.vue";

export default defineComponent({
  components: {
    PumpWithVFD,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "PumpWithVFD",
        data: {
          type: "PumpWithVFD",
          mappings: {
            PushButton1_onOff: "pumpWithVFDPush1",
            PushButton1_state: "pumpWithVFDPush1",
            PushButton2_onOff: "pumpWithVFDPush2",
            PushButton2_state: "pumpWithVFDPush2",
            PushButton3_onOff: "pumpWithVFDPush2",
            PushButton3_state: "pumpWithVFDPush3",
            PushButton4_onOff: "pumpWithVFDPush4",
            PushButton4_state: "pumpWithVFDPush4",
            ArrowLeft_commandLeft: "pumpWithVFDArrowL",
            ArrowLeft_state: "pumpWithVFDArrowL",
            ArrowRight_commandRight: "pumpWithVFDArrowR",
            ArrowRight_state: "pumpWithVFDArrowR",
            OutputField_actualValue: "pumpWithVFDOutput",
            OutputField1_actualValue: "pumpWithVFDOutput1",
            Slider_targetValue: "pumpWithVFDSlider",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.PumpWithVFD.mainView";
    },
    previewNameLang() {
      return this.$t("devices.PumpWithVFD.previewName");
    },
  },
});
</script>
