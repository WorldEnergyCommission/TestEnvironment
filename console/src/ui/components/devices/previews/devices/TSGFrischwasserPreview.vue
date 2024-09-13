<template>
  <TSGFrischwasser :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TSGFrischwasser from "@/ui/components/devices/devices/TSGFrischwasser.vue";

export default defineComponent({
  components: {
    TSGFrischwasser,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "TSGFrischwasser",
        data: {
          type: "TSGFrischwasser",
          mappings: {
            InputField1_targetValue: "tsgFrischwasserInput1",
            InputField2_targetValue: "tsgFrischwasserInput2",
            InputField3_targetValue: "tsgFrischwasserInput3",
            InputField4_targetValue: "tsgFrischwasserInput4",
            InputField5_targetValue: "tsgFrischwasserInput5",
            InputField6_targetValue: "tsgFrischwasserInput6",
            InputField7_targetValue: "tsgFrischwasserInput7",
            InputField8_targetValue: "tsgFrischwasserInput8",
            InputField9_targetValue: "tsgFrischwasserInput9",
            InputField10_targetValue: "tsgFrischwasserInput10",
            InputField11_targetValue: "tsgFrischwasserInput11",
            InputField12_targetValue: "tsgFrischwasserInput12",
            InputField13_targetValue: "tsgFrischwasserInput13",
            InputField14_targetValue: "tsgFrischwasserInput14",
            PushButton1_onOff: "tsgFrischwasserPush1",
            PushButton1_state: "tsgFrischwasserPush1",
            PushButton2_onOff: "tsgFrischwasserPush2",
            PushButton2_state: "tsgFrischwasserPush2",
            OutputField1_actualValue: "tsgFrischwasserOutput1",
            OutputField2_actualValue: "tsgFrischwasserOutput2",
            OutputField3_actualValue: "tsgFrischwasserOutput3",
            OutputField4_actualValue: "tsgFrischwasserOutput4",
            OutputField5_actualValue: "tsgFrischwasserOutput5",
            DropDown1_targetValue: "tsgFrischwasserDropDown1",
            DropDown2_targetValue: "tsgFrischwasserDropDown2",
          },
        },
      };
    },
    description() {
      return this.$t("devicesDescriptions.TSGFrischwasser");
    },
    previewNameLang() {
      return this.$t("devices.TSGFrischwasser.previewName");
    },
  },
});
</script>
