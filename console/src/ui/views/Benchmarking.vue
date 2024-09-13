<template>
  <div class="bottom-without-safe">
    <CoreRow>
      <CoreColumn cols="12">
        <CoreCard>
          <!-- <CoreCardItem>
            <template #title>
              <span class="text-h4 text-medium-emphasis">
                {{ t("modules.benchmarking.all_projects") }}
              </span>
            </template>
          </CoreCardItem> -->
          <CoreCardText class="h-100 w-100">
            <BenchmarkingModule class="w-100" />
          </CoreCardText>
        </CoreCard>
      </CoreColumn>
    </CoreRow>
    <CoreRow class="w-100">
      <CoreColumn cols="12">
        <CoreCard class="h-100 w-100">
          <CoreCardItem>
            <template #title>
              <span class="text-h4 text-medium-emphasis">
                {{ t("modules.benchmarking.project_groups") }}
              </span>
            </template>
          </CoreCardItem>
          <CoreCardText class="h-100 w-100">
            <CoreContainer>
              <CoreRow>
                <CoreColumn cols="12" md="6" lg="4" class="align-center d-flex">
                  <CoreCombobox
                    v-model="selectedProjects"
                    clearable
                    chips
                    multiple
                    :label="t('modules.benchmarking.select_projects')"
                    :items="projects"
                    item-value="id"
                    item-title="name"
                    hide-details
                  >
                    <template #chip="{ props, item }">
                      <CoreChip
                        v-bind="props"
                        closable
                        variant="tonal"
                        :text="item.name"
                        class="pa-3"
                      />
                    </template>
                  </CoreCombobox>
                </CoreColumn>
                <CoreColumn cols="12" md="6" lg="4" class="align-center d-flex">
                  <CoreButton
                    :disabled="selectedProjects.length < 1"
                    button-type="primary"
                    @click="benchmark"
                  >
                    {{ t("modules.benchmarking.prep_data") }}
                  </CoreButton>
                </CoreColumn>
              </CoreRow>
              <CoreRow>
                <CoreColumn cols="12" md="6">
                  <h4>{{ t("modules.benchmarking.selected_projects") }}</h4>
                  <CoreChip v-for="selected in current_selection" :key="selected.id" class="ma-1">
                    {{ selected.name }}
                  </CoreChip>
                </CoreColumn>
                <CoreColumn cols="12" md="4">
                  <CoreButton
                    v-if="enableDownload"
                    button-type="primary"
                    :loading="generatingPDF"
                    @click="generateReport"
                  >
                    {{ t("modules.benchmarking.export_pdf") }}
                  </CoreButton>
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </CoreCardText>
        </CoreCard>
      </CoreColumn>
    </CoreRow>
    <CoreRow v-if="showData">
      <CoreColumn cols="12">
        <CoreContainer>
          <BenchmarkingTodayCard class="w-100" :benchmark-data="data" :is-fetching="isFetching" />
        </CoreContainer>
      </CoreColumn>
    </CoreRow>
    <CoreRow v-if="showData">
      <CoreColumn cols="12" class="w-100 h-100">
        <CoreContainer>
          <CoreCard class="pa-6" elevated-card card-with-bg-color>
            <CoreCardItem>
              <template #title>
                <span class="text-h4 font-weight-bold">
                  {{ t("modules.report.chart.pv") }}
                </span>
              </template>
            </CoreCardItem>
            <CoreCardText class="h-100">
              <Chart
                ref="chart_solar"
                :data="solar_data.chart_data"
                :titles="solar_data.titles"
                :types="solar_data.types"
                :y-axisis="solar_data.axisis"
              />
            </CoreCardText>
          </CoreCard>
        </CoreContainer>
      </CoreColumn>
      <CoreColumn cols="12">
        <CoreContainer>
          <CoreCard class="pa-6" elevated-card card-with-bg-color>
            <CoreCardItem>
              <template #title>
                <span class="text-h4 font-weight-bold">
                  {{ t("modules.report.chart.grid_consumption") }}
                </span>
              </template>
            </CoreCardItem>
            <CoreCardText class="h-100">
              <Chart
                ref="chart_con"
                :data="grid_consumption_data.chart_data"
                :titles="grid_consumption_data.titles"
                :types="grid_consumption_data.types"
                :y-axisis="grid_consumption_data.axisis"
              />
            </CoreCardText>
          </CoreCard>
        </CoreContainer>
      </CoreColumn>
      <CoreColumn cols="12">
        <CoreContainer>
          <CoreCard class="pa-6" elevated-card card-with-bg-color>
            <CoreCardItem>
              <template #title>
                <span class="text-h4 font-weight-bold">
                  {{ t("modules.report.chart.grid_production") }}
                </span>
              </template>
            </CoreCardItem>
            <CoreCardText class="h-100">
              <Chart
                ref="chart_feed"
                :data="grid_feed_in_data.chart_data"
                :titles="grid_feed_in_data.titles"
                :types="grid_feed_in_data.types"
                :y-axisis="grid_feed_in_data.axisis"
              />
            </CoreCardText>
          </CoreCard>
        </CoreContainer>
      </CoreColumn>
    </CoreRow>
    <CoreRow v-if="!showData && !isFetching" class="w-100 h-100 text-center">
      <CoreContainer> {{ t("uiComponents.common.noDataFound") }} </CoreContainer>
    </CoreRow>
    <CoreRow v-if="isFetching" class="w-100 h-100 d-flex align-center justify-center">
      <CircleSpinner :size="80" color="accent" />
    </CoreRow>
  </div>
</template>

<script lang="ts" setup>
import { jsPDF } from "jspdf";
import moment from "moment";
import { computed, ref, Ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify";

import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import BenchmarkingModule from "@/ui/components/devices/modules/Benchmarking/BenchmarkingModule.vue";
import BenchmarkingTodayCard from "@/ui/components/devices/modules/Benchmarking/BenchmarkingTodayCard.vue";
import {
  useBenchmarkChartData,
  useBenchmarkProjects,
} from "@/ui/components/devices/modules/ReportModule";
import Chart from "@/ui/components/devices/modules/ReportModule/Chart.vue";

//TODO enable download...
const enableDownload = ref(false);

const { current: theme } = useTheme();

const { t } = useI18n();

const showData = computed(() => Object.keys(data.value).length > 0);

const {
  projects,
  selectedProjects,
  data,
  fetchData: benchmark,
  isFetching,
} = useBenchmarkProjects();

const solar_data = useBenchmarkChartData(data, "pv");
const grid_consumption_data = useBenchmarkChartData(data, "grid_consumption");
const grid_feed_in_data = useBenchmarkChartData(data, "grid_feed_in");

const current_selection = computed(() => {
  const project_ids = Object.keys(data.value);
  return projects.value.filter((project) => project_ids.includes(project.id));
});

const chart_solar = ref();
const chart_con = ref();
const chart_feed = ref();

const generatingPDF = ref(false);
function generateReport() {
  generatingPDF.value = true;
  const doc = new jsPDF("p", "px", "A4");

  doc.text("EfficientIO Report", 10, 20);

  doc.text(t("modules.report.chart.pv"), 10, 40);
  addChartRefToPDF(chart_solar, doc, 25, 60);
  doc.text(t("modules.report.chart.grid_consumption"), 10, 180);
  addChartRefToPDF(chart_con, doc, 25, 200);
  doc.text(t("modules.report.chart.grid_production"), 10, 320);
  addChartRefToPDF(chart_feed, doc, 25, 3400);

  doc.save(`EfficentIO_Benchmarking_Report_${moment().format("YYYY-MM-DD")}`);
  generatingPDF.value = false;
}

function addChartRefToPDF(r: Ref<any>, doc: jsPDF, x: number, y: number) {
  if (!r.value) return;
  const canvas = r.value.bar.chart.canvas;
  const img = canvas.toDataURL();

  doc.addImage({
    imageData: img,
    x: x,
    y: y,
    width: 400,
    height: 400 * (canvas.height / canvas.width),
  });
}
</script>
