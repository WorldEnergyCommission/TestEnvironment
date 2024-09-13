<template>
  <CoreTooltip location="bottom">
    <template #activator="{ activatorProps }">
      <CoreButton
        button-type="standardIcon"
        v-bind="activatorProps"
        :disabled="props.disabled"
        @click="exportData"
      >
        <CoreIcon>fas fa-file-download</CoreIcon>
      </CoreButton>
    </template>
    <span>{{ t("uiComponents.chartTooltips.csv") }}</span>
  </CoreTooltip>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import { useI18n } from "vue-i18n";

import { getCsvTableString } from "@/utils/utilsFunctions";

const props = defineProps({
  data: { type: Array as PropType<[number, number][][]>, default: () => [] },
  fileName: { type: String, default: "export" },
  headers: { default: () => [], type: Array as PropType<string[]> },
  disabled: { default: false, type: Boolean },
});

const { t, locale } = useI18n();

/**
 * Preparation of data for export into csv
 */
function exportData() {
  // construct a two-dimensional array of all the csv data
  const csvRows: string[][] = [props.headers];

  // get the length of the longest array
  let len = 0;
  Object.values(props.data).forEach((value) => {
    if (value.length > len) {
      len = value.length;
    }
  });

  // get the amount of variables in dataToExport
  const numVariables = props.data.length;

  // load one value from each variable and get the time from the first one
  for (let index = 0; index < len; index++) {
    const row: string[] = [];

    // gets the current timestamp
    const currentTimestamp = new Date(props.data[0][index][0]).toLocaleString(locale.value);
    row.push(`${currentTimestamp}`);
    for (let i = 0; i < numVariables; i++) {
      const currenVariableValue = props.data[i][index][1];
      if (props.data[i][index][1] !== null) {
        // if currentvaraibelvalue is a number use to lacle string, otherwise jsut the value
        const val =
          typeof currenVariableValue === "number"
            ? currenVariableValue.toLocaleString(locale.value)
            : currenVariableValue;
        row.push(val);
      } else {
        row.push("");
      }
    }
    csvRows.push(row);
  }

  // construct the csv_table
  const documentString = "data:text/csv;charset=utf-16,";
  const universalBOM = "\uFEFF";
  const csvTable = getCsvTableString(csvRows);

  const data = encodeURIComponent(universalBOM + csvTable);
  const link = document.createElement("a");
  link.setAttribute("href", documentString + data);
  link.setAttribute("download", `${props.fileName}.csv`);
  link.click();
}
</script>
