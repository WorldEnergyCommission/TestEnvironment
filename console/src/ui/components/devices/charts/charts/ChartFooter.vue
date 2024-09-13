<template>
  <div class="d-flex justify-center align-center" style="gap: 2dvw">
    <!-- Previous day button -->
    <CoreButton
      button-type="secondary"
      :disabled="props.disabled || props.loading"
      @click="handleButtonClick(false)"
    >
      <CoreIcon>fas fa-angle-left</CoreIcon>
    </CoreButton>
    <!-- Calendar selector -->
    <div>
      <CoreDialog v-model="dialogVisible" :width="300">
        <template #activator="{ props: activatorProps }">
          <CoreButton
            transparent-bg
            button-type="primary"
            v-bind="activatorProps"
            class="py-1 px-3 d-flex"
            :disabled="props.disabled || props.loading"
          >
            <i class="far fa-calendar me-1" />
            <template v-if="!mobile && !disabled">
              <ChartTimeRange :period="props.period" :date="date" :format="props.format" />
            </template>
          </CoreButton>
        </template>
        <CoreDatePicker
          v-model="calendarInputOutput"
          inline
          week-start="0"
          :hour-picker="hour"
          :year-picker="year"
          :week-picker="week"
          :max-date="maxDate"
          :month-picker="month"
          :dark="$vuetify.theme.current.dark"
          @clear="dialogVisible = false"
          @update:model-value="dialogVisible = false"
        />
      </CoreDialog>
    </div>
    <!-- Next period button -->
    <CoreButton
      :disabled="disableNextButton"
      button-type="secondary"
      @click="handleButtonClick(true)"
    >
      <CoreIcon>fas fa-angle-right</CoreIcon>
    </CoreButton>
  </div>
  <!-- From and to dates as label -->
  <template v-if="mobile && !disabled">
    <div class="d-flex flex-column align-center mt-3">
      <ChartTimeRange :period="props.period" :date="date" :format="props.format" />
    </div>
  </template>
</template>

<script setup lang="ts">
import moment, { DurationInputArg2 } from "moment";
import { computed, ref, watch, onBeforeMount } from "vue";
import { useDisplay } from "vuetify";

import ChartTimeRange from "@/ui/components/devices/charts/charts/ChartTimeRange.vue";
import { Periods, getAbsoluteBounds } from "@/ui/components/devices/charts/charts/ChartUtils";

// Properties
interface Props {
  period?: string;
  disabled?: boolean;
  format?: "datetime" | "date";
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  period: "day",
  disabled: false,
  loading: false,
  format: "datetime",
});

const { mobile } = useDisplay();
const dialogVisible = ref(false);

// Models
const date = defineModel("date", { type: String });

// Calendar values and transformations to date model
const calendarInputOutput = computed({
  // Calendar Input
  get: () => {
    if (year.value) {
      // Year input: number
      const input: number = new Date(date.value!).getFullYear();
      return input;
    } else if (month.value) {
      // Month input: { month: number; year: number }
      const input: { month: number; year: number } = {
        month: new Date(date.value!).getMonth(),
        year: new Date(date.value!).getFullYear(),
      };
      return input;
    } else if (week.value) {
      // Week input: Date
      return [
        new Date(date.value!),
        new Date(date.value!).setDate(new Date(date.value!).getDate() + 6),
      ];
    } else {
      // Day input: Date
      // Hour input: Date
      return new Date(date.value!);
    }
  },
  // Calendar Output
  set: (value: any) => {
    if (year.value) {
      // Year output: number
      const output: number = value;
      date.value = moment(output, "YYYY").startOf("year").toISOString();
    } else if (month.value) {
      // Month output: { month: number; year: number }
      const output: { month: number; year: number } = value;
      date.value = new Date(output.year, output.month).toISOString();
    } else if (week.value) {
      // Week output: Date
      const output: Date = new Date(value[0]);
      date.value = output.toISOString();
    } else {
      // Day output: Date
      // Hour output: Date
      const output: Date = new Date(value);
      date.value = output.toISOString();
    }
  },
});

const maxDate = computed(() => {
  if (!week.value) return new Date();
  // else return end of week
  const tempDate = new Date();
  const dayOfWeek = tempDate.getDay() % 7;
  tempDate.setDate(tempDate.getDate() + 7 - dayOfWeek);
  return new Date(tempDate);
});

// Disable the buttons based on the chart type
const disableNextButton = computed(() => {
  return !canGoToNextPeriod(true) || props.disabled || props.loading;
});

/**
 * Set which type of calendar is in use based on the time period
 * @param hour if true calendar is hourpicker
 * @param month if true calendar is monthpicker
 * @param year if true calendar is yearpicker
 * @param week if true calendar is weekpicker
 */
const hour = computed(() => props.period === Periods.HOUR);
const week = computed(() => props.period === Periods.WEEK);
const month = computed(() => props.period === Periods.MONTH);
const year = computed(() => props.period === Periods.YEAR);

/**
 * This functions is executed by the click event of the next day or previous day buttons
 * @param button Decides which of the two buttons was clicked (true = right button | false = left button)
 */
function handleButtonClick(button: boolean) {
  // Check if there is even a date to increment to decreese
  if (!date.value) {
    return;
  }

  // New Date made for the date model
  const tempDate = new Date(date.value);

  // Checks if we add or remove one day
  const addOrRemove = button ? 1 : -1;
  switch (props.period) {
    case Periods.WEEK:
      tempDate.setDate(tempDate.getDate() + 7 * addOrRemove);
      break;
    case Periods.MONTH:
      tempDate.setMonth(tempDate.getMonth() + addOrRemove);
      break;
    case Periods.YEAR:
      tempDate.setFullYear(tempDate.getFullYear() + addOrRemove);
      break;
    case Periods.HOUR:
      tempDate.setHours(tempDate.getHours() + addOrRemove);
      break;
    default:
      tempDate.setDate(tempDate.getDate() + addOrRemove);
      break;
  }

  // Set the date model to the desired day
  date.value = tempDate.toISOString();
}

/**
 * Next period forward or backwards data
 * @param {boolean} forward true if scroll should be forward
 * @return {boolean} if chante to next period is currently possible in this direction
 */
const canGoToNextPeriod = (forward: boolean): boolean => {
  // extract all components from the last used date
  const nextMoment = moment(date.value);
  if (props.period === Periods.LIVE) {
    return false;
  }
  if (forward) {
    nextMoment.add(1, props.period as DurationInputArg2);
  } else {
    nextMoment.subtract(1, props.period as DurationInputArg2);
  }

  const bounds = getAbsoluteBounds(nextMoment, props.period as string);

  // The start timestamp should be smaller than the current timestamp and not negative
  return 0 < bounds.start && bounds.start < new Date().getTime() / 1000;
};

watch(
  () => props.disabled,
  () => {
    calendarInputOutput.value = new Date();
  },
);

onBeforeMount(() => {
  if (props.disabled) {
    calendarInputOutput.value = new Date();
  }
});
</script>
