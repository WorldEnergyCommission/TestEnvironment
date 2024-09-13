<template>
  <CoreForm ref="form" v-model="valid" lazy-validation @submit.prevent>
    <div class="d-flex input-field-text-base">
      <CoreTextField
        v-model="state"
        :counter="max"
        :disabled="isNotMapped"
        :max-length="max"
        :min-length="min"
        :rules="[...fieldRules]"
        flat
        type="text"
        @keyup.enter.stop="handleState"
      />
      <CoreButton
        :disabled="!valid || isNotMapped"
        :small="small"
        class="ml-2 mt-2"
        button-type="primary"
        @mousedown="validate"
      >
        <lynus-icon color="theme" name="send" size="20" />
      </CoreButton>
    </div>
  </CoreForm>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";
/**
 * Component that represent InputFieldText Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    min: { default: 0, type: Number },
    max: { default: 100, type: Number },
    fieldRules: { default: () => [], type: Array as PropType<any[]> },
    small: { default: false, type: Boolean },
    enableVariabelButtonColor: { default: false, type: Boolean },
  },
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const timer: any = undefined;
    const state: any = "";

    return {
      state,
      timer,
      valid: true,
      /**
       * this variable is used to disable the Base component
       * if there is no variable set in the mappings of the device.
       */
      isNotMapped: false,
    };
  },
  computed: {
    actualValue(): any {
      return this.measurements.get(this.measurementsClean.targetValue) || "No Text";
    },
    /**
     * Define button color
     */
    sendButtonColor() {
      // default way Button only has one color
      if (!this.enableVariabelButtonColor) return "accent";
      if (this.measurements.get(this.measurementsClean.state) === 1) return "accent";
      else return "#4b6978";
    },
  },
  watch: {
    actualValue: [
      {
        handler: "onActualValueChange",
      },
    ],
    measurementsClean: [
      {
        handler: "handleIsMapped",
      },
    ],
  },
  created() {
    if (this.measurementsClean.targetValue === "") {
      this.isNotMapped = true;
    }
  },
  mounted() {
    ((this.form as any).coreForm as any).validate();
    this.state = this.actualValue;
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    async validate() {
      await ((this.form as any).coreForm as any).validate();
      this.handleState();
    },
    handleState() {
      if (!this.valid) return;
      this.timer = setTimeout(() => {
        this.send([{ vs: this.state, n: this.measurementsClean.targetValue, u: "" }]);
      }, 200);
    },
    onActualValueChange(val: any) {
      if (typeof val === "string") this.state = val;
    },

    handleIsMapped() {
      if (this.measurementsClean.targetValue !== "") {
        this.isNotMapped = false;
      }
      this.isNotMapped = true;
    },
  },
});
</script>

<style lang="scss">
.input-field-text-base {
  .v-input {
    .v-input__control {
      .v-input__slot {
        min-height: 0 !important;
        margin-bottom: 0 !important;

        input {
          color: #525252 !important;
        }
      }

      .v-text-field__details {
        margin-bottom: 0 !important;
      }
    }

    .v-messages__message {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      @media all and (min-width: 1270px) and (max-width: 1640px) {
        width: 40px;
      }
    }
  }
}
</style>
