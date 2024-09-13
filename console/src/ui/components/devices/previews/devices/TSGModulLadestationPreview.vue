<template>
  <TSGModulLadestation :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TSGModulLadestation from "@/ui/components/devices/devices/TSGModulLadestation.vue";

export default defineComponent({
  components: {
    TSGModulLadestation,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "TSGModulLadestation",
        data: {
          type: "TSGModulLadestation",
          mappings: {
            OutputField1_actualValue: "tsgModulLadestationOutput1",
            OutputField2_actualValue: "tsgModulLadestationOutput2",
            OutputField3_actualValue: "tsgModulLadestationOutput3",
            OutputField4_actualValue: "tsgModulLadestationOutput4",
            OutputField5_actualValue: "tsgModulLadestationOutput5",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.TSGLadestationNotAus.mainView";
    },
    description() {
      return this.$t("devicesDescriptions.TSGModulLadestation");
    },
    previewNameLang() {
      return this.$t("devices.TSGModulLadestation.previewName");
    },
  },
});
</script>
