<template>
  <MotorWithVFD :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MotorWithVFD from "@/ui/components/devices/devices/MotorWithVFD.vue";

export default defineComponent({
  components: {
    MotorWithVFD,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "MotorWithVFD",
        data: {
          type: "MotorWithVFD",
          mappings: {
            PushButton1_onOff: "motorWithVFDPush1",
            PushButton1_state: "motorWithVFDPush1",
            PushButton2_onOff: "motorWithVFDPush2",
            PushButton2_state: "motorWithVFDPush2",
            PushButton3_onOff: "motorWithVFDPush2",
            PushButton3_state: "motorWithVFDPush3",
            PushButton4_onOff: "motorWithVFDPush4",
            PushButton4_state: "motorWithVFDPush4",
            ArrowLeft_commandLeft: "motorWithVFDArrowL",
            ArrowLeft_state: "motorWithVFDArrowL",
            ArrowRight_commandRight: "motorWithVFDArrowR",
            ArrowRight_state: "motorWithVFDArrowR",
            OutputField_actualValue: "motorWithVFDOutput",
            OutputField1_actualValue: "motorWithVFDOutput1",
            Slider_targetValue: "motorWithVFDSlider",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.MotorWithVFD.mainView";
    },
    previewNameLang() {
      return this.$t("devices.MotorWithVFD.previewName");
    },
  },
});
</script>
