<template>
  <DateTimePicker
    :min-date="minDate"
    :max-date="maxDate"
    :date="transformedValue"
    :label="label"
    @cleared="$emit('datePickerCustomClearDate')"
    @update:date="onInput"
  />
</template>

<script lang="ts">
import { Moment } from "moment";
import { defineComponent } from "vue";

import DateTimePicker from "../../components/DateTimePicker.vue";
import moment from "moment";

/**
 * Form field Date Picker Custom, give possibility to handle date
 */
export default defineComponent({
  components: {
    DateTimePicker,
  },
  props: {
    /** Timestamp in seconds */
    modelValue: {
      type: [Number, String],
    },
    label: { default: "Date", type: String },
    /** Timestamp seconds */
    startingDate: {
      type: Number,
    },
    /** Timestamp seconds */
    endDate: {
      type: Number,
    },
  },
  emits: ["datePickerCustomClearDate", "update:modelValue"],
  computed: {
    lastCalendarDate() {
      const [day, month, year] = new Date().toLocaleDateString("en-GB").split("/");
      return `${year}-${month}-${day}`;
    },
    minDate() {
      if (!this.startingDate) return null;
      return moment.unix(this.startingDate).toISOString();
    },
    maxDate() {
      if (!this.endDate) return moment().toISOString();
      return moment.unix(this.endDate).toISOString();
    },
    transformedValue() {
      if (!this.modelValue) return null;

      const val = moment.unix(this.modelValue).toISOString();
      return val;
    },
  },
  methods: {
    onInput(e: any) {
      if (!e || e === "") return;

      const val = moment(e).unix();
      this.$emit("update:modelValue", val);
    },
    cancelStartDate() {
      this.$emit("datePickerCustomClearDate");
    },
  },
});
</script>

<style lang="scss" scoped></style>
