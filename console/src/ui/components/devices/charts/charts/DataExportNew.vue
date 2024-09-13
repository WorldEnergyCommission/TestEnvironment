<template>
  <DataExport :data="data" :file-name="fileName" :headers="headers" :disabled="disableExport" />
</template>

<script lang="ts" setup>
/**
 * Component that represent data export button
 */
import * as _ from "lodash";
import { PropType, computed } from "vue";

import { getAlternativeVariableName, getChartOptions } from "./ChartUtils";
import DataExport from "@/ui/components/components/DataExport.vue";

const props = defineProps({
  dataToExport: { type: Array as PropType<[number, number][][]>, default: () => [] },
  periodTitle: {
    type: String,
    default: "",
  },
  isThresholdLine: { default: false, type: Boolean },
  chartData: { default: () => ({ data: { type: "" } }), type: Object as PropType<any> },
});

const headers = computed(() => {
  const headerStrings: string[] = ["unix_timestamp"];

  // get name of all variables for the header
  props.chartData &&
    getChartOptions(props.chartData).forEach((optionsItem, index) => {
      let name = optionsItem.name;

      if (!name || name.length === 0) {
        // name not set
        name = getAlternativeVariableName(index, props.chartData) ?? "";
      }

      headerStrings.push(`${name}`);
    });
  return headerStrings;
});

const fileName = computed(() => {
  // use chart name if preset for the export file
  if (props.chartData.name !== undefined) {
    return props.chartData.name;
  } else {
    return "export";
  }
});

const disableExport = computed(() => !props.dataToExport || !props.chartData);

const data = computed(() => {
  if (props.isThresholdLine) {
    return props.dataToExport.slice(1);
  }
  return props.dataToExport;
});
</script>
