<template>
  <EfficientIODialog dialog-title="mlModel.LoadMonitor.tableView.title">
    <template #activator="{ props: activatorProps }">
      <CoreButton button-type="standardIcon" v-bind="activatorProps">
        <CoreIcon>fas fa-table</CoreIcon>
      </CoreButton>
    </template>
    <template #content="{ hide }">
      <CoreCard class="mb-3 pa-1 rounded-lg">
        <CoreRow>
          <CoreColumn class="d-flex justify-center align-center">
            <div>{{ compliance + " % compliance" }}</div>
          </CoreColumn>
          <CoreColumn class="d-flex justify-center">
            <div>
              <CoreDatePicker v-model="month" :month-picker="true">
                <template #trigger>
                  <CoreButton button-type="standardIcon" v-bind="props">
                    <CoreIcon>fas fa-calendar-alt</CoreIcon>
                  </CoreButton>
                </template>
              </CoreDatePicker>
            </div>
            <div>
              <DataExport :data="exportData" :file-name="exportFilename" :headers="exportHeaders" />
            </div>
          </CoreColumn>
        </CoreRow>
      </CoreCard>
      <CoreDataTable
        class="rounded-lg m-0"
        :headers="reportHeaders"
        :items="reportItems"
        :loading="loading"
        hide-default-footer
        disable-pagination
        :items-per-page="10"
      >
        <template #item.action="{ item }">
          <CoreButton
            type="standard-icon"
            @click="
              () => {
                emit('selected', item.ts);
                hide();
              }
            "
          >
            <CoreIcon>fas fa-chart-line</CoreIcon>
          </CoreButton>
        </template>
      </CoreDataTable>
    </template>
  </EfficientIODialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { BakingMonitorReport, BakingMonitorReportItem, DataTableHeader } from "./LoadMonitorTypes";
import api from "@/store/api";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

import DataExport from "@/ui/components/components/DataExport.vue";
// Properties
interface Props {
  projectId: string;
  modelId: string;
  name: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: "selected", value: number): void;
}>();

// Translations
const { t } = useI18n();
const no = computed(() => t("uiComponents.confirmationDialog.no"));
const yes = computed(() => t("uiComponents.confirmationDialog.yes"));
const dateTitle = computed(() => t("mlModel.LoadMonitor.tableView.date"));
const withinBakingWindowTitle = computed(() => t("mlModel.LoadMonitor.tableView.bakingStart"));
const firstBakingStartTitle = computed(() => t("mlModel.LoadMonitor.tableView.firstBakingStart"));
const beforeOpeningTitle = computed(() => t("mlModel.LoadMonitor.tableView.beforeOpening"));
const beforeClosingTitle = computed(() => t("mlModel.LoadMonitor.tableView.beforeClosing"));

// Date for the API fetch
const month = ref<{ month: number; year: number }>();
const monthEnd = computed(() => {
  // Check if the month is the current month
  if (month.value?.month === new Date().getMonth()) {
    // If the selected month is the current month, set the end of the month to yesterday
    const endOfYesterday = new Date(
      month.value?.year,
      month.value?.month,
      new Date().getDate() - 1,
    );
    endOfYesterday.setHours(23, 59, 59, 0);
    return endOfYesterday.getTime() / 1000;
  }
  // If the selected month is not the current month, set the end of the month to the last day of the month
  const endOfMonth = new Date(month.value?.year ?? 0, month.value?.month ?? 0, 31);
  endOfMonth.setHours(23, 59, 59, 0);
  return endOfMonth.getTime() / 1000;
});
const monthStart = computed(() => {
  // Set the start timestamp of the month
  const startOfMonth = new Date(month.value?.year ?? 0, month.value?.month ?? 0, 1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth.getTime() / 1000;
});

// Reports
const reportItems = ref<BakingMonitorReportItem[]>([]);

// Header of the table
const reportHeaders = computed<DataTableHeader[]>(() => [
  { title: dateTitle.value, key: "date" },
  { title: withinBakingWindowTitle.value, key: "withinBakingWindow" },
  { title: firstBakingStartTitle.value, key: "firstBakingStart" },
  { title: beforeOpeningTitle.value, key: "beforeOpening" },
  { title: beforeClosingTitle.value, key: "beforeClosing" },
  { title: "", key: "action" },
]);

const exportHeaders = computed(() => {
  return reportHeaders.value.map((header) => header.title).filter((header) => header !== "");
});
const exportFilename = computed(() => {
  return `${props.name}_${month.value?.year}_${month.value?.month}`;
});
const exportData = computed(() => {
  const keys = reportHeaders.value
    .map((header) => header.key)
    .filter((header) => header !== "action" && header !== "date");

  return keys.map((key) => {
    return reportItems.value.map((item) => {
      const d = new Date(item.ts * 1000);
      d.setHours(0);
      return [d.getTime(), item[key]];
    });
  });
});

// Compliance
const compliance = computed(() => {
  if (reportItems.value.length === 0) {
    return 0;
  }

  return Math.round(
    (reportItems.value.filter((item) => item.withinBakingWindow === yes).length /
      reportItems.value.length) *
      100,
  );
});

// Functions
function getBeforeOpening(report: BakingMonitorReport) {
  if (
    report.load_operating_buffer_start === true &&
    report.load_baking_window_before_buffer_start === false &&
    report.load_before_baking_window === false
  ) {
    return yes;
  } else {
    return no;
  }
}

function getWithinBakingWindow(report: BakingMonitorReport) {
  if (report.load_in_baking_window === true && report.load_before_baking_window === false) {
    return yes;
  } else {
    return no;
  }
}

watch(month, async () => {
  await fetchReports();
});

const loading = ref(false);
async function fetchReports() {
  loading.value = true;
  // Fetch reports Object
  const reportsObject = await api.fetch(
    `projects/${props.projectId}/controllers/${props.modelId}/report?end=${monthEnd.value}&start=${monthStart.value}`,
    "GET",
  );

  // Check if reportsObject is undefined
  if (reportsObject.report.length === undefined) {
    reportItems.value = [];
    loading.value = false;
    return;
  }

  // Transform reports into datatable items
  reportItems.value = (reportsObject.report as BakingMonitorReport[]).map((report) => {
    const date = new Date(report.ts * 1000).toLocaleDateString();
    const withinBakingWindow = getWithinBakingWindow(report);
    const firstBakingStart = report.first_load_start
      ? new Date(report.first_load_start * 1000).toLocaleTimeString()
      : "-";
    const beforeOpening = getBeforeOpening(report);
    const beforeClosing = report.load_start_operating_buffer_end ? yes : no;

    return {
      date: date,
      withinBakingWindow: withinBakingWindow,
      firstBakingStart: firstBakingStart,
      beforeOpening: beforeOpening,
      beforeClosing: beforeClosing,
      ts: report.ts,
    };
  });

  loading.value = false;
}

onMounted(async () => {
  // Get the timeframe
  month.value = { month: new Date().getMonth(), year: new Date().getFullYear() };
  // await getMonthTimeFrame(month.value);
});
</script>
