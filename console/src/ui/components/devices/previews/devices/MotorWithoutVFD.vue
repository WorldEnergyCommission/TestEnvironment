<template>
  <MotorWithoutVFD :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MotorWithoutVFD from "@/ui/components/devices/devices/MotorWithoutVFD.vue";

export default defineComponent({
  components: {
    MotorWithoutVFD,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "MotorWithoutVFD",
        data: {
          type: "MotorWithoutVFD",
          mappings: {
            PushButton1_onOff: "motorWithoutVFDPush1",
            PushButton1_state: "motorWithoutVFDPush1",
            PushButton2_onOff: "motorWithoutVFDPush2",
            PushButton2_state: "motorWithoutVFDPush2",
            PushButton3_onOff: "motorWithoutVFDPush2",
            PushButton3_state: "motorWithoutVFDPush3",
            PushButton4_onOff: "motorWithoutVFDPush4",
            PushButton4_state: "motorWithoutVFDPush4",
            ArrowLeft_commandLeft: "motorWithoutVFDArrowL",
            ArrowLeft_state: "motorWithoutVFDArrowL",
            ArrowRight_commandRight: "motorWithoutVFDArrowR",
            ArrowRight_state: "motorWithoutVFDArrowR",
            OutputField_actualValue: "motorWithoutVFDOutput",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.MotorWithoutVFD.mainView";
    },
    previewNameLang() {
      return this.$t("devices.MotorWithoutVFD.previewName");
    },
  },
});
</script>
