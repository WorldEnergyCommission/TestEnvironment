<template>
  <component
    :is="pushButtonBaseType"
    v-bind="{
      icon,
      buttonSize,
      iconSize,
      buttonWidth,
      buttonHeight,
      iconColor,
      defaultButtonCurrentState: state,
      currentState: isStateEqualToCustomButtonDisabledValue,
      isNotMapped,
    }"
    @down="down"
    @play-pause-up="playPauseUp"
    @send-confirmed="sendConfirmed"
    @send-single-value="sendSingleValue"
    @up="up"
  >
    <template #buttonText>
      <slot name="buttonText" />
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";
import ConfirmationDialogButton from "@/ui/components/devices/devices/base/PushButtonBase/ButtonTypes/ConfirmationDialogButton.vue";
import DefaultButton from "@/ui/components/devices/devices/base/PushButtonBase/ButtonTypes/DefaultButton.vue";
import OverEachOtherAndOneValButton from "@/ui/components/devices/devices/base/PushButtonBase/ButtonTypes/OverEachOtherAndOneValButton.vue";
import PlayPauseIconAndTextButton from "@/ui/components/devices/devices/base/PushButtonBase/ButtonTypes/PlayPauseIconAndTextButton.vue";
import StaticIconAndTextButton from "@/ui/components/devices/devices/base/PushButtonBase/ButtonTypes/StaticIconAndTextButton.vue";
import UpDownRoundedOnlyIconButton from "@/ui/components/devices/devices/base/PushButtonBase/ButtonTypes/UpDownRoundedOnlyIconButton.vue";

/**
 * Component that represent PushButton Basic Control
 */
export default defineComponent({
  name: "PushButtonBase",
  components: {
    DefaultButton,
    ConfirmationDialogButton,
    PlayPauseIconAndTextButton,
    StaticIconAndTextButton,
    UpDownRoundedOnlyIconButton,
    OverEachOtherAndOneValButton,
  },
  extends: BaseDevice,
  props: {
    icon: { default: "push_button", type: String },
    /**
     * pushButtonBaseType can be: DefaultButton, ConfirmationDialogButton, PlayPauseIconAndTextButton,
     * StaticIconAndTextButton, OverEachOtherAndOneValButton, UpDownRoundedOnlyIconButton
     */
    pushButtonBaseType: { default: "DefaultButton", type: String },
    iconSize: { default: null, type: [Number, String] },
    buttonSize: { default: 40, type: [String, Number] },
    buttonWidth: { default: 150, type: Number },
    buttonHeight: { default: 36, type: Number },
    iconColor: { default: "theme", type: String },
    buttonColor: { default: "white", type: String },
    singleSendValue: { default: 0, type: Number },
    customButtonDisabledValue: { default: -1, type: Number },
    isSendSingleValue: { default: false, type: Boolean },
    upDownOutputVal: { default: -1, type: Number },
    /**
     * Timeout to wait until value 0 is send after button is released
     */
    timeout: { default: 0, type: Number },
  },
  data() {
    return {
      isNotMapped: false,
    };
  },
  computed: {
    state() {
      this.handleIfNotMapped();
      return !!this.measurements.get(this.measurementsClean.state);
    },
    isStateEqualToCustomButtonDisabledValue() {
      this.handleIfNotMapped();
      return this.measurements.get(this.measurementsClean.state) === this.customButtonDisabledValue;
    },
  },
  created() {
    this.handleIfNotMapped();
  },
  methods: {
    down() {
      if (this.isSendSingleValue)
        this.send([{ v: this.singleSendValue, n: this.measurementsClean.onOff, u: "" }]);
      else this.send([{ v: 1, n: this.measurementsClean.onOff, u: "" }]);
    },
    up() {
      if (this.isSendSingleValue) return;

      setTimeout(() => {
        this.send([{ v: 0, n: this.measurementsClean.onOff, u: "" }]);
      }, this.timeout);
    },
    playPauseUp() {
      const isZero: boolean = this.measurements.get(this.measurementsClean.state) === 0;
      if (isZero) this.send([{ v: 0, n: this.measurementsClean.onOff, u: "" }]);
      else this.send([{ v: 1, n: this.measurementsClean.onOff, u: "" }]);
    },
    sendConfirmed() {
      console.log("sendConfirmed");
      this.send([{ v: 0, n: this.measurementsClean.onOff, u: "" }]);
    },
    sendSingleValue() {
      this.send([{ v: this.singleSendValue, n: this.measurementsClean.onOff, u: "" }]);
    },
    handleIfNotMapped() {
      this.isNotMapped =
        !this.measurementsClean.onOff?.length && !this.measurementsClean.state?.length;
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
