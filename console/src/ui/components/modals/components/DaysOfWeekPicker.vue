<template>
  <div>
    {{ getLabel }}

    <CoreSwitch
      v-for="dayIndex in daysOfWeekIndexes"
      :key="dayIndex"
      v-model="daysValue![dayIndex]"
      :label="localizedDayOfWeek(dayIndex)"
      hide-details
      inset
    />
  </div>
</template>

<script lang="ts">
import moment from "moment";
import { defineComponent } from "vue";

/**
 * Usage:
 * <DaysOfWeekPicker v-model="activeDays" />
 * */
export default defineComponent({
  data() {
    return {
      daysOfWeekIndexes: [1, 2, 3, 4, 5, 6, 0],
    };
  },
  computed: {
    daysValue: {
      get() {
        return this.modelValue;
      },
      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
    getLabel() {
      return this.label ?? this.$t("uiComponents.daysOfWeekPicker.label");
    },
  },
  methods: {
    /**
     * Localized Day Of Week
     * @param dayIndex 0 = Sunday, 1 = Monday ...
     * @return "Monday"
     */
    localizedDayOfWeek(dayIndex: number, short = false) {
      return moment()
        .day(dayIndex)
        .format(short ? "dd" : "dddd");
    },
  },
  props: {
    label: {
      type: String,
    },
    modelValue: { type: Array<boolean>, default: () => [] },
  },
});
</script>

<style scoped></style>
