<template>
  <div class="curved-display-margin-bottom">
    <div v-if="showLoadingSpinner === true" class="report-loader">
      <CircleSpinner :size="80" color="accent" />
    </div>
    <div v-if="showLoadingSpinner === false">
      <!-- If no reports are found -->
      <div style="display: flex">
        <h1 v-if="localReportList.length === 0" style="margin: 0 auto !important">
          {{ $t("modals.manageReport.noReportsFound") }}
        </h1>
      </div>
      <!-- List of Reports -->
      <div>
        <CoreExpansionPanels v-if="localReportList.length > 0" variant="inset">
          <h2 v-if="normalReportList.length > 0" style="width: 100%">
            {{ $t("modals.manageReport.listReportNormal") }}:
          </h2>
          <CoreExpansionPanel v-for="report in normalReportList" :key="report.id">
            <CoreExpansionPanelTitle>
              <div style="width: 300px">
                {{ report.name }}
              </div>
              <div
                :style="`color: ${report.active === true ? 'green' : 'red'}`"
                class="me-3 text-center"
              >
                {{
                  report.active === true
                    ? $t("uiComponents.rules.active")
                    : $t("uiComponents.rules.notActive")
                }}
              </div>
            </CoreExpansionPanelTitle>
            <CoreExpansionPanelText>
              <ReportForm :is-new-report="false" :model="report" />
            </CoreExpansionPanelText>
          </CoreExpansionPanel>
          <h2 v-if="zevReportList.length > 0" style="margin-top: 48px; width: 100%">
            {{ $t("modals.manageReport.listReportZev") }}:
          </h2>
          <CoreExpansionPanel v-for="report in zevReportList" :key="report.id">
            <CoreExpansionPanelTitle>
              <div style="width: 300px">
                {{ report.name }}
              </div>
              <div v-if="report.active === true" style="color: green">
                {{ $t("uiComponents.rules.active") }}
              </div>
              <div v-if="report.active === false" style="color: red">
                {{ $t("uiComponents.rules.notActive") }}
              </div>
            </CoreExpansionPanelTitle>
            <CoreExpansionPanelText>
              <ReportForm :is-new-report="false" :model="report" />
            </CoreExpansionPanelText>
          </CoreExpansionPanel>
        </CoreExpansionPanels>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import ReportForm from "@/ui/components/forms/Report/ReportForm.vue";

/**
 * Report page that shows reports list
 */
export default defineComponent({
  components: {
    CircleSpinner,
    ReportForm,
  },
  data() {
    return {
      showLoadingSpinner: false,
    };
  },
  computed: {
    reportState() {
      return (this.$store.state as RootState).report;
    },
    /** always gets the current list of report Items */
    localReportList() {
      return this.reportState.reportList;
    },
    normalReportList() {
      return this.reportState.reportList.filter((el: any) => el.type === "normal");
    },
    zevReportList() {
      return this.reportState.reportList.filter((el: any) => el.type === "zev");
    },
  },
  async created() {
    this.showLoadingSpinner = true;
    await this.$store.dispatch("report/loadReports", this.$route.params.id as string);
    // loads the measurements and fixes the problem with measurements not available in textfields when reloading the page
    this.fetchMeasurements(this.$route.params.id as string);
    this.showLoadingSpinner = false;
  },
  methods: {
    fetchMeasurements(projectId: string): Promise<void> {
      return this.$store.dispatch("measurements/fetchMeasurements", projectId);
    },
  },
});
</script>

<style lang="scss">
.report-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: absolute;
}
</style>
