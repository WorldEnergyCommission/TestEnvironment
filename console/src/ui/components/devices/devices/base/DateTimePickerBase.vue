<template>
  <div style="display: flex">
    <VueCtkDateTimePicker
      v-model="dateValue"
      :color="$vuetify.theme.current.colors.accent"
      :dark="$vuetify.theme.current.dark"
      :right="alignRight"
      format="YYYY-MM-DD HH:mm"
      locale="de"
      output-format="YYYY-MM-DDTHH:mm:ss.sssZ"
      style="padding-right: 4px"
    />
    <CoreButton
      button-type="primary"
      :disabled="disableSendButton"
      style="height: 42px !important"
      @click="emitDate"
    >
      Send
    </CoreButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueCtkDateTimePicker from "vue-ctk-date-time-picker";
import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent DateTimePicker Basic Control
 */
export default defineComponent({
  components: { VueCtkDateTimePicker },
  extends: BaseDevice,
  props: {
    alignRight: { default: false, type: Boolean },
    convertToUnixTime: { default: true, type: Boolean },
  },
  data() {
    return {
      /**
       * value of DateTimePicker
       */
      dateValue: "",
      disableSendButton: true,
    };
  },
  watch: {
    dateValue: [
      {
        handler: "enableSendButton",
      },
    ],
  },
  created() {
    const valueDatabase: any = this.measurements.get(this.measurementsClean.actualValue);
    const currentDateValue = Math.trunc(new Date().getTime() / 1000);
    if (valueDatabase - currentDateValue > 0) {
      const d = new Date(valueDatabase * 1000);
      this.dateValue = d.toISOString();
    }
  },
  methods: {
    emitDate() {
      const date = new Date(this.dateValue);
      const unixTimeStamp = Math.trunc(date.getTime() / 1000);

      this.send([{ n: this.measurementsClean.actualValue, v: unixTimeStamp, u: "" }]);
    },
    enableSendButton() {
      if (this.dateValue !== null) {
        this.disableSendButton = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.push-button-base {
  background: transparent !important;
  border: 2px solid #c4c4c4;
}

.active {
  background: rgb(var(--v-theme-accent)) !important;
  border: 2px solid rgb(var(--v-theme-accent));
}
</style>
