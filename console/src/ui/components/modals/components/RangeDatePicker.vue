<template>
  <CoreDatePicker
    :model-value="transformPropsInput"
    range
    :placeholder="$t('uiComponents.rangeDatePicker.buttonTitle')"
    :clearable="false"
    :dark="$vuetify.theme.current.dark"
    @update:model-value="handleStartStopDateChange"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import CoreDatePicker from "@/ui/core/components/date-picker/DatePicker.vue";

/**
 * Form field Range Date Picker
 */
export default defineComponent({
  components: {
    CoreDatePicker,
  },
  props: {
    /** Timestamp seconds */
    startDate: { default: null, type: Number },
    /** Timestamp seconds */
    endDate: { default: null, type: Number },
  },
  data() {
    return {
      format: "MM.dd.yyyy",
    };
  },
  computed: {
    transformPropsInput() {
      if (!this.startDate || !this.endDate) return null;
      return [
        this.startDate ? new Date(this.startDate * 1000) : Date(),
        this.endDate ? new Date(this.endDate * 1000) : Date(),
      ];
    },
  },
  methods: {
    handleStartStopDateChange([startDate, endDate]: [Date, Date]) {
      if (!startDate || !endDate) return;
      this.$emit("handleStartStopDate", {
        startDate: startDate.getTime() / 1000,
        endDate: endDate.getTime() / 1000,
      });
    },
  },
});
</script>
