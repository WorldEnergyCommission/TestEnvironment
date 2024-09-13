<template>
  <TSGLadestationNotAus :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TSGLadestationNotAus from "@/ui/components/devices/devices/TSGLadestationNotAus.vue";

export default defineComponent({
  components: {
    TSGLadestationNotAus,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "TSGLadestationNotAus",
        data: {
          type: "TSGLadestationNotAus",
          mappings: {
            PushButton_onOff: "tsgLadestationNotAusPush",
            PushButton_state: "tsgLadestationNotAusPush",
            DropDown1_targetValue: "tsgLadestationNotAusDropDown1",
            DropDown2_targetValue: "tsgLadestationNotAusDropDown2",
          },
        },
      };
    },
    textMappingStatus() {
      return [
        { name: this.$t(`${this.mainViewLang}.dropDown1.value0`), value: 0 },
        { name: this.$t(`${this.mainViewLang}.dropDown1.value1`), value: 1 },
      ];
    },
    textMappingEmergency() {
      return [
        { name: this.$t(`${this.mainViewLang}.dropDown2.value0`), value: 0 },
        { name: this.$t(`${this.mainViewLang}.dropDown2.value1`), value: 1 },
      ];
    },
    mainViewLang() {
      return "devices.TSGLadestationNotAus.mainView";
    },
    description() {
      return this.$t("devicesDescriptions.TSGLadestationNotAus");
    },
    previewNameLang() {
      return this.$t("devices.TSGLadestationNotAus.previewName");
    },
  },
});
</script>
