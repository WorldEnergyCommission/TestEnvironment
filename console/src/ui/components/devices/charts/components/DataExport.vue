<template>
  <DataExport :data="dataForNew" :file-name="fileName" :headers="headers" />
</template>

<script lang="ts" setup>
import { PropType, computed } from "vue";

import DataExport from "@/ui/components/components/DataExport.vue";
/**
 * Component that represent data export button
 */
type Series = {
  name: string;
  type: string;
  yAxis: number;
  color: string | null;
  data: [number, number][];
  unit: string;
};

const props = defineProps({
  dataToExport: { type: Array as PropType<Series[]>, default: () => [] },
  navigator: {
    default: () => ({ picker: "", currentPeriod: false }),
    type: Object as PropType<any>,
  },
  chartData: {
    default: () => ({ data: { type: "" } }),
    type: Object as PropType<any>,
  },
});

const headers = computed(() => {
  const headerStrings = ["time"];
  props.dataToExport.forEach((item) => {
    headerStrings.push(item.name);
  });
  return headerStrings;
});

const fileName = computed(() => {
  let fileName = "";
  props.dataToExport.forEach((item) => {
    fileName += item.name;
  });
  return fileName;
});

const dataForNew = computed(() => {
  const isColumn = props.chartData.data.type === "ColumnChart";

  // TODO: why is this needed or was needed?
  // let datePeriod = props.dataToExport[0].data.map((item) => item[0]);

  // // add current time into the end of period if column chart and current day
  // if (isColumn && props.navigator.currentPeriod) {
  //   const d = new Date();
  //   d.setSeconds(0, 0);
  //   const copy = [...props.dataToExport[0].data];
  //   copy.reverse();
  //   const idx = copy.findIndex((val) => typeof val[1] === "number");
  //   copy[idx][0] = d.getTime();
  //   datePeriod = copy.map((item) => item[0]).reverse();
  // }

  return props.dataToExport.map((serie) => serie.data);
});
</script>
