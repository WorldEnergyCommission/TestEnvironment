<template>
  <TSGBrauchwasser :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TSGBrauchwasser from "@/ui/components/devices/devices/TSGBrauchwasser.vue";

export default defineComponent({
  components: {
    TSGBrauchwasser,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "TSGBrauchwasser",
        data: {
          type: "TSGBrauchwasser",
          mappings: {
            InputField1_targetValue: "tsgBrauchwasserInput1",
            InputField2_targetValue: "tsgBrauchwasserInput2",
            InputField3_targetValue: "tsgBrauchwasserInput3",
            InputField4_targetValue: "tsgBrauchwasserInput4",
            InputField5_targetValue: "tsgBrauchwasserInput5",
            InputField6_targetValue: "tsgBrauchwasserInput6",
            InputField7_targetValue: "tsgBrauchwasserInput7",
            InputField8_targetValue: "tsgBrauchwasserInput8",
            InputField9_targetValue: "tsgBrauchwasserInput9",
            InputField10_targetValue: "tsgBrauchwasserInput10",
            InputField11_targetValue: "tsgBrauchwasserInput11",
            InputField12_targetValue: "tsgBrauchwasserInput12",
            PushButton1_onOff: "tsgBrauchwasserPush1",
            PushButton1_state: "tsgBrauchwasserPush1",
            PushButton2_onOff: "tsgBrauchwasserPush2",
            PushButton2_state: "tsgBrauchwasserPush2",
            OutputField1_actualValue: "tsgBrauchwasserOutput1",
            OutputField2_actualValue: "tsgBrauchwasserOutput2",
            OutputField3_actualValue: "tsgBrauchwasserOutput3",
            DropDown1_targetValue: "tsgBrauchwasserDropDown1",
            DropDown2_targetValue: "tsgBrauchwasserDropDown2",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.TSGBrauchwasser.previewName");
    },
  },
});
</script>
