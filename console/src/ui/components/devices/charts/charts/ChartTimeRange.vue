<template>
  <span class="text-accent text-center text-caption">
    {{ chartStart }}
  </span>
  <span class="text-accent text-center">-</span>
  <span class="text-accent text-center text-caption">
    {{ chartEnd }}
  </span>
</template>

<script setup lang="ts">
import moment from "moment";
import { computed } from "vue";

import { useIntlDate } from "@/composables/useIntlDate";
import { getAbsoluteBounds, Periods } from "@/ui/components/devices/charts/charts/ChartUtils";

const props = withDefaults(
  defineProps<{ period: string; date: string; format?: "datetime" | "date" }>(),
  {
    period: "",
    date: "",
    format: "datetime",
  },
);

const { formatDateForChart } = useIntlDate();

/** Start and end bounds of the chart */
const bounds = computed(() => {
  let bounds;

  switch (props.period) {
    case Periods.DAY:
      bounds = getAbsoluteBounds(moment(props.date), "day");
      break;
    case Periods.WEEK:
      bounds = getAbsoluteBounds(moment(props.date), "week");
      break;
    case Periods.MONTH:
      bounds = getAbsoluteBounds(moment(props.date), "month");
      break;
    case Periods.YEAR:
      bounds = getAbsoluteBounds(moment(props.date), "year");
      break;
    case Periods.HOUR:
      bounds = getAbsoluteBounds(moment(props.date), "hour");
      break;
  }
  return bounds;
});
/** The start datetime for the chart for the chart correctly formatted */
const chartStart = computed(() =>
  bounds.value ? formatDateForChart(bounds.value.start * 1000, props.format === "date") : "",
);

/** The end datetime for the chart correctly formatted */
const chartEnd = computed(() => {
  return bounds.value
    ? formatDateForChart(bounds.value.endChart * 1000, props.format === "date")
    : "";
});
</script>
