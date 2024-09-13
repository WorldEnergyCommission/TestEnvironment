<template>
  <PumpWithoutVFD :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PumpWithoutVFD from "@/ui/components/devices/devices/PumpWithoutVFD.vue";

export default defineComponent({
  components: {
    PumpWithoutVFD,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "PumpWithoutVFD",
        data: {
          type: "PumpWithoutVFD",
          mappings: {
            PushButton1_onOff: "pumpWithoutVFDPush1",
            PushButton1_state: "pumpWithoutVFDPush1",
            PushButton2_onOff: "pumpWithoutVFDPush2",
            PushButton2_state: "pumpWithoutVFDPush2",
            PushButton3_onOff: "pumpWithoutVFDPush2",
            PushButton3_state: "pumpWithoutVFDPush3",
            PushButton4_onOff: "pumpWithoutVFDPush4",
            PushButton4_state: "pumpWithoutVFDPush4",
            ArrowLeft_commandLeft: "pumpWithoutVFDArrowL",
            ArrowLeft_state: "pumpWithoutVFDArrowL",
            ArrowRight_commandRight: "pumpWithoutVFDArrowR",
            ArrowRight_state: "pumpWithoutVFDArrowR",
            OutputField_actualValue: "pumpWithoutVFDOutput",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.PumpWithoutVFD.mainView";
    },
    previewNameLang() {
      return this.$t("devices.PumpWithoutVFD.previewName");
    },
  },
});
</script>
