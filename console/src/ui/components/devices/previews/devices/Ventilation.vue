<template>
  <Ventilation :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Ventilation from "@/ui/components/devices/devices/Ventilation.vue";

export default defineComponent({
  components: {
    Ventilation,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "Ventilation",
        data: {
          type: "Ventilation",
          mappings: {
            PushButton_onOff: "ventilationPush",
            PushButton_state: "ventilationPush",
            Switch_on: "ventilationSwitch",
            Switch_off: "ventilationSwitch",
            Switch_state: "ventilationSwitch",
            InputField_targetValue: "ventilationInput",
            OutputField1_actualValue: "ventilationOutput1",
            OutputField2_actualValue: "ventilationOutput2",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.Ventilation.mainView";
    },
    previewNameLang() {
      return this.$t("devices.Ventilation.previewName");
    },
  },
});
</script>
