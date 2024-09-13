<template>
  <ControlAwning :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ControlAwning from "@/ui/components/devices/devices/ControlAwning.vue";

export default defineComponent({
  components: {
    ControlAwning,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ControlAwning",
        data: {
          type: "ControlAwning",
          mappings: {
            ArrowOut_out: "controlAwningOut",
            ArrowOut_state: "controlAwningOut",
            ArrowIn_in: "controlAwningIn",
            ArrowIn_state: "controlAwningIn",
            Slider_targetValue: "controlAwningSlider",
            PushButton_onOff: "controlAwningPush",
            PushButton_state: "controlAwningPush",
            InputField1_targetValue: "controlAwningInput1",
            InputField2_targetValue: "controlAwningInput2",
            OutputField_actualValue: "controlAwningOutput",
          },
        },
      };
    },
    settingsViewLang() {
      return "devices.ControlAwning.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.ControlAwning.previewName");
    },
  },
});
</script>
