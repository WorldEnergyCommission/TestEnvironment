<template>
  <!-- This is the calendar dialog -->
  <CoreDialog v-if="$slots.activator" v-model="displayCalendarDialog" :width="300">
    <template #activator="{ props }">
      <div v-bind="props">
        <slot name="activator" />
      </div>
    </template>
    <!-- Calendar selector -->
    <CoreDatePicker
      inline
      :model-value="date"
      :dark="$vuetify.theme.current.dark"
      :month-picker="calendarType === 'month'"
      @update:model-value="confirmDateSelection($event)"
    />
  </CoreDialog>
  <!-- This is the calendar input field -->
  <div v-if="!$slots.activator" class="date-time-picker-input">
    <!-- Previous day button -->
    <CoreButton v-if="buttons" button-type="standardIcon" @click="handleButtonClick(false)">
      <CoreIcon>fas fa-angle-left</CoreIcon>
    </CoreButton>
    <!-- Calendar selector -->
    <CoreDatePicker
      :model-value="date"
      clearable
      :placeholder="label"
      :month-picker="calendarType === 'month'"
      :min-date="minDate"
      :max-date="maxDate"
      :dark="$vuetify.theme.current.dark"
      @clear="cancelDateSelection"
      @cleared="emit('cleared')"
      @update:model-value="confirmDateSelection($event)"
    />
    <!-- Next day button -->
    <CoreButton v-if="buttons" button-type="standardIcon" @click="handleButtonClick(true)">
      <CoreIcon>fas fa-angle-right</CoreIcon>
    </CoreButton>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import "@vuepic/vue-datepicker/dist/main.css";
import { onMounted, ref } from "vue";

// Properties
interface Props {
  /** Should today set as value on mount  */
  todayAsDefaultValue?: boolean;
  /** Show arrow buttons to change date (increase/decrease by 1)  */
  buttons?: boolean;
  /** Disable compelte control  */
  disabled?: boolean;
  dateOnly?: boolean;
  label?: string;
  calendarType?: string;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
}

const props = withDefaults(defineProps<Props>(), {
  todayAsDefaultValue: false,
  button: false,
  disabled: false,
  dateOnly: false,
  label: "Start",
  calendarType: "date",
  minDate: null,
  maxDate: null,
});

const date = defineModel("date", { type: String });

// Emits
const emit = defineEmits<{
  (e: "cleared"): void;
}>();

const displayCalendarDialog = ref<boolean>(false);

function confirmDateSelection(input: Date) {
  displayCalendarDialog.value = false;
  date.value = moment(input).toISOString();
}

function cancelDateSelection() {
  displayCalendarDialog.value = false;
}

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
  if (button) {
    tempDate.setDate(tempDate.getDate() + 1);
  } else {
    tempDate.setDate(tempDate.getDate() - 1);
  }

  // Set the date model to the desired day
  date.value = tempDate.toISOString();
}

onMounted(() => {
  // Checks if the component should be initialised with todays date
  if (props.todayAsDefaultValue) {
    date.value = new Date().toISOString();
  } else {
    date.value = "";
  }
});
</script>

<style lang="scss" scoped>
.v-time-picker-custom {
  .v-picker__title {
    height: 84px;
    padding-top: 10px;
  }
}

.date-time-picker-input {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
