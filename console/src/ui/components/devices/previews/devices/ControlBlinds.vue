<template>
  <ControlBlinds :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ControlBlinds from "@/ui/components/devices/devices/ControlBlinds.vue";

export default defineComponent({
  components: {
    ControlBlinds,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ControlBlinds",
        data: {
          type: "ControlBlinds",
          mappings: {
            ArrowUp_up: "controlBlindsUp",
            ArrowUp_state: "controlBlindsUp",
            ArrowDown_down: "controlBlindsDown",
            ArrowDown_state: "controlBlindsDown",
            DropDown_targetValue: "controlBlindsDrop",
            PushButton_onOff: "controlBlindsPush",
            PushButton_state: "controlBlindsPush",
            InputField1_targetValue: "controlBlindsInput1",
            InputField2_targetValue: "controlBlindsInput2",
            InputField3_targetValue: "controlBlindsInput3",
            Slider_targetValue: "controlBlindsSlider",
            OutputField_actualValue: "controlBlindsOutput",
          },
        },
      };
    },
    items() {
      return [
        { name: this.$t(`${this.mainViewLang}.dropDown.fullyOpen`), value: 0 },
        { name: this.$t(`${this.mainViewLang}.dropDown.threeQuarterOpen`), value: 1 },
        { name: this.$t(`${this.mainViewLang}.dropDown.halfOpen`), value: 2 },
        { name: this.$t(`${this.mainViewLang}.dropDown.quarterOpen`), value: 3 },
        { name: this.$t(`${this.mainViewLang}.dropDown.closed`), value: 4 },
      ];
    },
    settingsViewLang() {
      return "devices.ControlBlinds.settingsView";
    },
    mainViewLang() {
      return "devices.ControlBlinds.mainView";
    },
    previewNameLang() {
      return this.$t("devices.ControlBlinds.previewName");
    },
  },
});
</script>
