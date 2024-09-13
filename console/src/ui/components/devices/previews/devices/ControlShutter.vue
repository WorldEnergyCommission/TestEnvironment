<template>
  <ControlShutter :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ControlShutter from "@/ui/components/devices/devices/ControlShutter.vue";

export default defineComponent({
  components: {
    ControlShutter,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ControlShutter",
        data: {
          type: "ControlShutter",
          mappings: {
            ArrowUp_up: "controlShutterUp",
            ArrowUp_state: "controlShutterUp",
            ArrowDown_down: "controlShutterDown",
            ArrowDown_state: "controlShutterDown",
            Slider_targetValue: "controlShutterSlider",
            PushButton_onOff: "controlShutterPush",
            PushButton_state: "controlShutterPush",
            InputField1_targetValue: "controlShutterInput1",
            InputField2_targetValue: "controlShutterInput2",
            OutputField_actualValue: "controlShutterOutput",
          },
        },
      };
    },
    settingsViewLang() {
      return "devices.ControlShutter.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.ControlShutter.previewName");
    },
  },
});
</script>
