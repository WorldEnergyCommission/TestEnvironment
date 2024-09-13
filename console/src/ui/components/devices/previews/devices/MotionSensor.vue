<template>
  <MotionSensor :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MotionSensor from "@/ui/components/devices/devices/MotionSensor.vue";

export default defineComponent({
  components: {
    MotionSensor,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "MotionSensor",
        data: {
          type: "MotionSensor",
          mappings: {
            InputField_targetValue: "motionSensorInput",
            Switch_on: "motionSensorSwitch",
            Switch_off: "motionSensorSwitch",
            Switch_state: "motionSensorSwitch",
            PushButton_onOff: "motionSensorPush",
            PushButton_state: "motionSensorPush",
          },
        },
      };
    },
    hideIfCrossingPoint() {
      return this.$vuetify.display.width < 1400 && this.$vuetify.display.width > 1264;
    },
    mainViewLang() {
      return "devices.MotionSensor.mainView";
    },
    previewNameLang() {
      return this.$t("devices.MotionSensor.previewName");
    },
  },
});
</script>

<style lang="scss">
.motion-sensor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
