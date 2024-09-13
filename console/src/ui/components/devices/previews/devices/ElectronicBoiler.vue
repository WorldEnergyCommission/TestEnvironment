<template>
  <ElectronicBoiler :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ElectronicBoiler from "@/ui/components/devices/devices/ElectronicBoiler.vue";

export default defineComponent({
  components: {
    ElectronicBoiler,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ElectronicBoiler",
        data: {
          type: "ElectronicBoiler",
          mappings: {
            OutputField_actualValue: "electronicBoilerOutput",
            OutputField1_actualValue: "electronicBoilerOutput1",
            InputField1_targetValue: "electronicBoilerInput1",
            InputField2_targetValue: "electronicBoilerInput2",
            InputField3_targetValue: "electronicBoilerInput3",
            InputField4_targetValue: "electronicBoilerInput4",
            Slider_targetValue: "electronicBoilerSlider",
            Switch1_on: "electronicBoilerSwitch1",
            Switch1_off: "electronicBoilerSwitch1",
            Switch1_state: "electronicBoilerSwitch1",
            Switch2_on: "electronicBoilerSwitch2",
            Switch2_off: "electronicBoilerSwitch2",
            Switch2_state: "electronicBoilerSwitch2",
          },
        },
      };
    },
    settingsViewLang() {
      return "devices.ElectronicBoiler.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.ElectronicBoiler.previewName");
    },
  },
});
</script>
