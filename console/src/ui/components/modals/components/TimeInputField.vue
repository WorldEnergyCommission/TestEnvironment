<template>
  <CoreDatePicker
    :model-value="timeObject"
    time-picker
    :placeholder="label ? label : $t('uiComponents.timeInputField.labelText')"
    :clearable="clearable"
    :dark="$vuetify.theme.current.dark"
    @update:model-value="updateTimeValue"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import CoreDatePicker from "@/ui/core/components/date-picker/DatePicker.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Time input field
 */
export default defineComponent({
  components: {
    CoreDatePicker,
  },
  extends: Validation,
  model: {
    prop: "timeValue",
    event: "change",
  },
  props: {
    modelValue: {
      type: String,
    },
    label: {
      type: String,
    },
    color: { default: "accent", type: String },
    clearable: { default: false, type: Boolean },
  },
  emits: ["update:modelValue"],
  computed: {
    timeObject() {
      if (!this.modelValue) return null;
      const timeArray = this.modelValue.split(":");
      return {
        hours: parseInt(timeArray[0]),
        minutes: parseInt(timeArray[1]),
      };
    },
  },
  methods: {
    updateTimeValue(e: any) {
      if (!e) return;
      this.$emit(
        "update:modelValue",
        `${e.hours}`.padStart(2, "0") + ":" + `${e.minutes}`.padStart(2, "0"),
      );
    },
  },
});
</script>

<style scoped></style>
