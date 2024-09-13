<template>
  <CoreRow v-if="schedule != null">
    <CoreColumn
      cols="6"
      md="3"
      :class="props.disabled ? 'text-medium-emphasis d-flex align-center' : 'd-flex align-center'"
    >
      {{ props.title }}
    </CoreColumn>
    <CoreColumn cols="6" md="3">
      <CoreSwitch
        v-model="schedule.enabled"
        :disabled="props.disabled"
        hide-details
        inline
        :class="$vuetify.display.mobile ? 'd-flex flex-row-reverse' : ''"
      />
    </CoreColumn>
    <CoreColumn cols="6" md="3">
      <VueDatePicker
        v-model="schedule.start"
        calendar-type="time"
        time-picker
        :disabled="!schedule.enabled || props.disabled"
        :dark="$vuetify.theme.current.dark"
      />
    </CoreColumn>
    <CoreColumn cols="6" md="3">
      <VueDatePicker
        v-model="schedule.end"
        calendar-type="time"
        time-picker
        :disabled="!schedule.enabled || props.disabled"
        :dark="$vuetify.theme.current.dark"
      />
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts" setup>
import "@vuepic/vue-datepicker/dist/main.css";
import VueDatePicker from "@vuepic/vue-datepicker";

export interface OperatingScheduleDayTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface OperatingScheduleDay {
  start?: OperatingScheduleDayTime;
  end?: OperatingScheduleDayTime;
  enabled: boolean;
}

const props = withDefaults(
  defineProps<{
    title: string;
    disabled?: boolean;
  }>(),
  {
    title: "",
    disabled: false,
  },
);

const schedule = defineModel<OperatingScheduleDay>();
</script>
