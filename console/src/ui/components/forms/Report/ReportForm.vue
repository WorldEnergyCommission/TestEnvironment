<template>
  <CoreContainer>
    <CoreForm ref="form" v-model="valid" validate-on="lazy submit">
      <CoreRow v-if="isNewReport">
        <CoreColumn cols="12">
          <h2>
            {{ $t("modals.manageReport.subTitles.selectTypeTitle") }}
          </h2>
          <div class="mt-5" style="width: 250px">
            <CoreSelect
              v-model="newReportType"
              :items="newReportTypeList"
              :label="$t('modals.manageReport.textFields.newTypeField')"
              density="compact"
              hide-details
              hide-selected
              item-title="state"
              item-value="abbr"
              :disabled="!canEdit"
              @update:model-value="handleTypeChange"
            />
          </div>
        </CoreColumn>
      </CoreRow>
      <!-- modal Report Part -->
      <NormalReport
        v-if="report.type === 'normal'"
        v-model="report.variables"
        :is-new-report="isNewReport"
        :report="report"
        :disabled="!canEdit"
        @on-report-change="changeInReportTemplate"
      />

      <ZevReport
        v-if="report.type === 'zev'"
        v-model="report.meta.zev.groupingSelected"
        :is-new-report="isNewReport"
        :report="report"
        :disabled="!canEdit"
        @on-report-change="changeInReportTemplate"
      />
      <!-- Part for both Report types -->
      <CoreRow v-if="report.type !== ''">
        <CoreColumn cols="12">
          <CoreRow dense>
            <CoreColumn cols="6">
              <h2>
                {{ $t("modals.manageReport.subTitles.actionsTitle") }}
              </h2>
            </CoreColumn>
            <CoreColumn v-if="!$vuetify.display.mobile" class="d-flex flex-row-reverse">
              <CoreButton
                :class="[{ 'ml-3': !$vuetify.display.mobile }]"
                button-type="primary"
                :disabled="!canEdit"
                @click="addAction('email')"
              >
                {{ $t("modals.manageReport.buttons.addEmail") }}
              </CoreButton>
              <CoreButton button-type="primary" :disabled="!canEdit" @click="addAction('webhook')">
                {{ $t("modals.manageReport.buttons.addWebhook") }}
              </CoreButton>
            </CoreColumn>
            <CoreColumn v-if="$vuetify.display.mobile" cols="12">
              <CoreButton
                :class="[{ 'ml-3': !$vuetify.display.mobile }]"
                button-type="primary"
                :disabled="!canEdit"
                @click="addAction('email')"
              >
                {{ $t("modals.manageReport.buttons.addEmail") }}
              </CoreButton>
            </CoreColumn>
            <CoreColumn v-if="$vuetify.display.mobile" cols="12">
              <CoreButton button-type="primary" :disabled="!canEdit" @click="addAction('webhook')">
                {{ $t("modals.manageReport.buttons.addWebhook") }}
              </CoreButton>
            </CoreColumn>
          </CoreRow>
        </CoreColumn>
        <CoreColumn v-for="(action, index) in report.actions" :key="index" cols="12">
          <CoreRow>
            <CoreColumn class="d-flex align-center" cols="12" md="8">
              <h3>Action {{ index + 1 }}</h3>
            </CoreColumn>
            <CoreColumn cols="12" md="2">
              <CoreSelect
                v-model="action.format"
                :items="formatOptions"
                :label="$t('modals.manageReport.textFields.formatOptionField')"
                density="compact"
                hide-details
                hide-selected
                item-title="state"
                item-value="abbr"
                :disabled="!canEdit"
              />
            </CoreColumn>
            <CoreColumn class="d-flex align-center" cols="12" md="2">
              <CoreButton button-type="delete" :disabled="!canEdit" @click="deleteAction(index)">
                {{ $t("modals.manageRules.buttons.deleteAction") }}
              </CoreButton>
            </CoreColumn>
          </CoreRow>
          <component
            :is="action.type"
            v-model="action.params"
            :action-index="index"
            :disable-body="true"
          />
        </CoreColumn>
        <CoreColumn class="d-flex" cols="12">
          <CoreCheckbox
            v-model="report.active"
            :false-value="false"
            :label="$t('modals.manageReport.actionCheckBox')"
            :true-value="true"
            hide-details
            :disabled="!canEdit"
          />
          <CoreCheckbox
            v-model="report.meta.show_report_image"
            :false-value="false"
            :true-value="true"
            class="ml-7"
            hide-details
            label="Logo"
            :disabled="!canEdit"
          />
        </CoreColumn>
      </CoreRow>
      <!-- Print Part && Trigger Action Part -->
      <CoreRow v-if="isNewReport === false">
        <CoreColumn cols="12" md="4">
          <CoreRow dense>
            <CoreColumn cols="12">
              <h2>{{ $t("modals.manageReport.subTitles.printTitle") }}:</h2>
            </CoreColumn>
            <CoreColumn cols="12">
              <DateTimePicker
                v-model:date="startDate as any"
                :label="$t('modals.manageReport.startDateText')"
                :disabled="!canRead"
              />
            </CoreColumn>
            <CoreColumn cols="12">
              <DateTimePicker
                v-model:date="endDate as any"
                :label="$t('modals.manageReport.endDateText')"
                :disabled="!canRead"
              />
            </CoreColumn>
            <CoreColumn cols="12" lg="6">
              <CoreSelect
                v-model="reportFormat"
                :items="formatOptions"
                :label="$t('modals.manageReport.textFields.formatOptionField')"
                density="compact"
                hide-details
                hide-selected
                item-title="state"
                item-value="abbr"
                :disabled="!canRead"
              />
            </CoreColumn>
            <CoreColumn cols="12" lg="6">
              <CoreButton
                :disabled="
                  !startDate ||
                  !endDate ||
                  reportFormat === '' ||
                  isDownloadTimesRight !== true ||
                  !canRead
                "
                button-type="primary"
                @click="downloadReport()"
              >
                {{ $t("modals.manageReport.buttons.downloadReport") }}
              </CoreButton>
              <CircleSpinner
                v-if="showSpinner === true"
                :size="40"
                class="mx-3 mt-6"
                color="accent"
              />
            </CoreColumn>
          </CoreRow>
        </CoreColumn>
        <CoreColumn cols="12" md="6">
          <CoreRow dense>
            <CoreColumn cols="12">
              <h2>{{ $t("modals.manageReport.subTitles.triggerActionTitle") }}:</h2>
            </CoreColumn>
            <CoreColumn cols="12">
              <DateTimePicker
                v-model="startDateActionTrigger"
                :label="$t('modals.manageReport.startDateText')"
                :disabled="!canEdit"
              />
            </CoreColumn>
            <CoreColumn cols="12">
              <DateTimePicker
                v-model="endDateActionTrigger"
                :label="$t('modals.manageReport.endDateText')"
                :disabled="!canEdit"
              />
            </CoreColumn>
            <CoreColumn v-if="report.actions.length !== 0" cols="12">
              <CoreButton
                button-type="primary"
                :disabled="
                  !startDateActionTrigger ||
                  !endDateActionTrigger ||
                  !isTriggerActionTimesRight ||
                  !canEdit
                "
                @click="manualtriggerAction()"
              >
                {{ $t("modals.manageReport.buttons.triggerActionsButton") }}
              </CoreButton>
            </CoreColumn>
          </CoreRow>
        </CoreColumn>
      </CoreRow>
      <CoreRow v-if="!isNewReport" />
      <!-- Button Part -->
      <CoreRow class="mt-6">
        <CoreColumn v-if="isNewReport" cols="6" md="3">
          <CoreButton
            :disabled="disbaleCreateButton || !canEdit"
            button-type="primary"
            @click="sendReport(true)"
          >
            {{ $t("modals.manageReport.buttons.createReport") }}
          </CoreButton>
        </CoreColumn>
        <CoreColumn cols="12" md="3">
          <CoreButton
            v-if="!isNewReport"
            :disabled="disbaleCreateButton || !canEdit"
            button-type="primary"
            @click="sendReport(false)"
          >
            {{ $t("modals.manageReport.buttons.modifyReport") }}
          </CoreButton>
        </CoreColumn>
        <CoreColumn cols="12" md="3">
          <CoreButton
            v-if="!isNewReport"
            button-type="delete"
            :disabled="!hasCurrentMemberScopedPermission('deleteReport', model.id)"
            @click="deleteReport()"
          >
            {{ $t("modals.manageReport.buttons.deleteReport") }}
          </CoreButton>
        </CoreColumn>
      </CoreRow>
    </CoreForm>
  </CoreContainer>
</template>
<script lang="ts">
import { cloneDeep } from "lodash";
import { Moment } from "moment";
import { tz } from "moment-timezone";
import { defineComponent, PropType, ref } from "vue";

import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import DateTimePicker from "@/ui/components/components/DateTimePicker.vue";
import EmailAction from "@/ui/components/forms/actions/EmailAction.vue";
import WebhookAction from "@/ui/components/forms/actions/WebhookAction.vue";
import NormalReport from "@/ui/components/forms/Report/NormalReport.vue";
import ZevReport from "@/ui/components/forms/Report/ZevReport.vue";
import { timeToMinutes } from "@/utils/utilsFunctions";
import moment from "moment";

export default defineComponent({
  components: {
    email: EmailAction,
    webhook: WebhookAction,
    NormalReport,
    ZevReport,
    CircleSpinner,
    DateTimePicker,
  },
  props: {
    model: {
      default: () => ({
        name: "",
        currency: "EUR",
        timezone: 0,
        address: {
          street: "",
          city: "",
          country: "",
        },
        variables: [{ name: "", title: "", unit_cost: 0, unit: "" }],
        actions: [],
        active: false,
        type: "",
      }),
      type: Object as PropType<any>,
    },
    isNewReport: { default: false, type: Boolean },
  },
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const maxDateCalendar: any = "";

    const newReportType = "" as "normal" | "zev" | "";
    const endDateActionTrigger = undefined as string | undefined;
    const startDateActionTrigger = undefined as string | undefined;
    const endDate = undefined as string | undefined;
    const startDate = undefined as string | undefined;
    const report: any = {
      name: "",
      currency: "EUR",
      address: {
        street: "",
        city: "",
        country: "",
      },
      variables: [{ name: "", title: "", unit_cost: 0, unit: "" }],
      actions: [],
      active: false,
      type: "",
    };

    return {
      report,
      valid: false,
      startDate,
      endDate,
      startDateActionTrigger,
      endDateActionTrigger,
      reportFormat: "",
      /** user can select between normal report and zev report this changes the visual parts */
      newReportType,
      showSpinner: false,
      maxDateCalendar,
      disbaleCreateButton: false,
    };
  },
  computed: {
    canEdit() {
      return this.isNewReport
        ? this.hasCurrentMemberScopedPermission("createReport", "*")
        : this.hasCurrentMemberScopedPermission("writeReport", this.model.id);
    },
    canRead() {
      return this.hasCurrentMemberScopedPermission(
        "readReport",
        this.isNewReport ? "*" : this.model.id,
      );
    },
    formatOptions() {
      if (this.report.type === "zev") {
        return [
          { state: "pdf", abbr: "pdf" },
          { state: "xml", abbr: "xml" },
        ];
      } else {
        return [
          { state: "json", abbr: "json" },
          { state: "pdf", abbr: "pdf" },
          { state: "csv", abbr: "csv" },
        ];
      }
    },
    newReportTypeList() {
      return [
        {
          state: this.$rt((this.$tm("modals.manageReport.newReportListItems") as any)[0]),
          abbr: "normal",
        },
        {
          state: this.$rt((this.$tm("modals.manageReport.newReportListItems") as any)[1]),
          abbr: "zev",
        },
      ];
    },
    isDownloadTimesRight() {
      if (!this.startDate || !this.endDate || this.startDate === "" || this.endDate === "") {
        return false;
      }
      return moment(this.startDate).isBefore(moment(this.endDate));
    },
    isTriggerActionTimesRight() {
      if (!this.startDateActionTrigger || !this.endDateActionTrigger) {
        return false;
      }
      return moment(this.startDateActionTrigger).isBefore(moment(this.endDateActionTrigger));
    },
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
    hasCurrentMemberScopedPermission(): (permission: string, scope: string) => boolean {
      return this.$store.getters["members/hasScopedPermission"];
    },
  },
  created() {
    this.fetchMeasurements(this.$route.params.id as string);
    if (!this.isNewReport) {
      this.newReportType = this.model.type;
    }
    this.report = this.model;
    this.updateMaxDateCalendar();
  },
  methods: {
    updateMaxDateCalendar() {
      const yourDate = new Date();
      let currentTimeStamp: any = Date.now();
      const timeZoneOffset = (yourDate.getTimezoneOffset() * -1) / 60;
      currentTimeStamp += timeZoneOffset * 3600000;

      const newMaxDate: any = new Date(currentTimeStamp).toISOString().split(".")[0];
      this.maxDateCalendar = newMaxDate;
    },
    /**
     * Tariff type selection
     */
    handleTypeChange() {
      const meta =
        this.newReportType === "zev"
          ? {
              zev: {
                arrayDaySettingsInternal: [
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                ],
                arrayDaySettingsExternal: [
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                  "custom",
                ],
                groupingSelected: true,
                innosolv: {
                  username: "",
                },
                titles: {
                  grid: "Grid",
                  photovoltaik: "PV",
                },
                consumers: [{ name: "", title: "", metering_id: "" }],
                producers: {
                  internal: [{ name: "", title: "" }],
                  external: [{ name: "", title: "" }],
                },
                tariffs: {
                  internal: {
                    time: [
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                    ],
                    low: "",
                    high: "",
                  },
                  external: {
                    time: [
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                      [
                        [0, 0],
                        [0, 0],
                      ],
                    ],
                    low: "",
                    high: "",
                  },
                },
              },
            }
          : {
              show_report_image: false,
            };

      this.report = {
        name: "",
        currency: "EUR",
        timezone: tz.guess(),
        address: {
          street: "",
          city: "",
          country: "",
        },
        variables: [{ name: "", title: "", unit_cost: 0, unit: "" }],
        actions: [],
        type: "",
        meta,
        active: false,
      };

      if (this.newReportType === "zev") {
        this.report.type = "zev";
      } else {
        this.report.type = "normal";
      }

      // setTimeout(async () => await (this.$refs.form as any).validate(), 200);
      ((this.form as any).coreForm as any).validate();
      this.disbaleCreateButton = true;
    },
    /**
     * Sets payload report data to local report
     * @param emitReport report data
     */
    async changeInReportTemplate(emitReport: any) {
      const valid = await ((this.form as any).coreForm as any).validate();
      if (this.report.type === "zev") {
        if (
          valid &&
          this.checkTariffEmpty(emitReport) === false &&
          emitReport.tarifCheck === false
        ) {
          this.disbaleCreateButton = false;
        } else {
          this.disbaleCreateButton = true;
        }
      } else {
        if (valid) {
          this.disbaleCreateButton = false;
        } else {
          this.disbaleCreateButton = true;
        }
      }

      this.report = emitReport.report;
    },
    /**
     * Checks if tariff is empty
     * @param tempReportModel object, tariff model
     * @return boolean, status of current tariff
     */
    checkTariffEmpty(tempReportModel: any) {
      let temporaryState = false;
      if (tempReportModel.report.meta.zev.groupingSelected === false) {
        // check each day for values
        for (let i = 0; i <= 6; i++) {
          const internalTimes = tempReportModel.report.meta.zev.tariffs.internal.time[i];
          const externalTimes = tempReportModel.report.meta.zev.tariffs.external.time[i];
          temporaryState = internalTimes.some((time: string[]) =>
            time.some((e: string) => e === ""),
          );
          if (temporaryState) return true;
          temporaryState = externalTimes.some((time: string[]) =>
            time.some((e: string) => e === ""),
          );
          if (temporaryState) return true;
        }
      } else {
        // only check monday and saturday because the rest will be filled up by a function later
        const internalTimesMonday = tempReportModel.report.meta.zev.tariffs.internal.time[0];
        const internalTimesSaturday = tempReportModel.report.meta.zev.tariffs.internal.time[5];
        const externalTimesMonday = tempReportModel.report.meta.zev.tariffs.external.time[0];
        const externalTimesSaturday = tempReportModel.report.meta.zev.tariffs.external.time[5];

        temporaryState = internalTimesMonday.some((time: string[]) =>
          time.some((e: string) => e === ""),
        );
        if (temporaryState) return true;
        temporaryState = internalTimesSaturday.some((time: string[]) =>
          time.some((e: string) => e === ""),
        );
        if (temporaryState) return true;

        temporaryState = externalTimesMonday.some((time: string[]) =>
          time.some((e: string) => e === ""),
        );
        if (temporaryState) return true;
        temporaryState = externalTimesSaturday.some((time: string[]) =>
          time.some((e: string) => e === ""),
        );
        if (temporaryState) return true;
      }
      return temporaryState;
    },
    /**
     * @param currentModel contains the whole report model
     * @returns the report model with the final Times inserted
     * This function only runs when day grouping is enabled by the User.
     * This function gets the report and fills up the missing day values for Monday-Friday and
     * Saturday and Sunday to be the same
     */
    fillUpTariffTimes(currentModel: any) {
      for (let i = 0; i <= 6; i++) {
        const internalTimes = currentModel.meta.zev.tariffs.internal.time;
        const currentInternalDaySettings = currentModel.meta.zev.arrayDaySettingsInternal;
        const mondayInternalSettings = currentInternalDaySettings[0];
        const saturdayInternalSettings = currentInternalDaySettings[5];
        const internalMonday = internalTimes[0];
        const internalSaturday = internalTimes[5];
        const externalTimes = currentModel.meta.zev.tariffs.external.time;
        const currentExternalDaySettings = currentModel.meta.zev.arrayDaySettingsExternal;
        const mondayExternalSettings = currentExternalDaySettings[0];
        const saturdayExternalSettings = currentExternalDaySettings[5];
        const externalMonday = externalTimes[0];
        const externalSaturday = externalTimes[5];

        // weekdays
        if (i > 0 && i < 5) {
          currentInternalDaySettings[i] = mondayInternalSettings;
          currentExternalDaySettings[i] = mondayExternalSettings;
          internalTimes[i] = cloneDeep(internalMonday);
          externalTimes[i] = cloneDeep(externalMonday);
        }
        // sunday
        if (i === 6) {
          currentInternalDaySettings[i] = saturdayInternalSettings;
          currentExternalDaySettings[i] = saturdayExternalSettings;
          internalTimes[i] = cloneDeep(internalSaturday);
          externalTimes[i] = cloneDeep(externalSaturday);
        }
      }
      return currentModel;
    },
    /**
     * @param currentReport contains the whole report model
     * @returns the report model with the converted Times inserted
     * This function goes through all the Tarif times and converts the times from format 'HH:MM'
     * to time in minutes (02:00 -> 120)
     * This function is needed for API compatibility
     */
    convertTimes(currentReport: any) {
      for (let i = 0; i <= 6; i++) {
        // internal Times
        const internalTimes: any[][] = currentReport.meta.zev.tariffs.internal.time;
        // map every start/end time from its minute value to an actual time in HH:mm format
        // e.g. [["00:00", "06:00"]] -> [["0", "360"]]
        internalTimes[i] = internalTimes[i].map((e: any[]) => e.map((time) => timeToMinutes(time)));

        // external Times
        const externalTimes = currentReport.meta.zev.tariffs.external.time;
        // map every start/end time from its minute value to an actual time in HH:mm format
        // e.g. [["00:00", "06:00"]] -> [["0", "360"]]
        externalTimes[i] = externalTimes[i].map((e: any[]) => e.map((time) => timeToMinutes(time)));
      }
      return currentReport;
    },
    /**
     * Go to page creation report
     * @param isNewReport boolean, status is report new
     */
    async sendReport(isNewReport: boolean) {
      const project_id = this.$route.params.id as string;
      let reportModelCopy: any = cloneDeep(this.report);
      const valid = await ((this.form as any).coreForm as any).validate();
      if (valid) {
        if (this.newReportType === "zev") {
          // internal and external tarif times
          if (this.report.meta.zev.groupingSelected === true) {
            reportModelCopy = this.fillUpTariffTimes(reportModelCopy);
          }
          reportModelCopy = this.convertTimes(reportModelCopy);

          // internal and external fares
          reportModelCopy.meta.zev.tariffs.internal.low = parseInt(
            this.report.meta.zev.tariffs.internal.low,
            10,
          );
          reportModelCopy.meta.zev.tariffs.internal.high = parseInt(
            this.report.meta.zev.tariffs.internal.high,
            10,
          );
          reportModelCopy.meta.zev.tariffs.external.low = parseInt(
            this.report.meta.zev.tariffs.external.low,
            10,
          );
          reportModelCopy.meta.zev.tariffs.external.high = parseInt(
            this.report.meta.zev.tariffs.external.high,
            10,
          );
        } else {
          // parses all the unit_cost values to integers for api
          Object.values(reportModelCopy.variables).forEach((element: any, index: number) => {
            element.unit_cost = parseFloat(element.unit_cost);
          });
        }
        if (isNewReport === true) {
          await this.$store.dispatch("report/addReport", {
            id: project_id,
            reportModel: reportModelCopy,
          });
          this.$emit("dismiss");
        } else {
          this.$store.dispatch("report/modifyReport", {
            id: project_id,
            report_id: this.report.id,
            reportModel: reportModelCopy,
          });
        }
      } else {
        this.$store.commit("app/setReport", {
          type: "error",
          message: "Validation Failed!",
          value: true,
        });
      }
    },
    manualtriggerAction() {
      this.$store.dispatch("report/triggerReportActions", {
        id: this.$route.params.id as string,
        report_id: this.report.id,
        reportModel: this.report,
        start: moment(this.startDateActionTrigger!).unix(),
        end: moment(this.endDateActionTrigger!).unix(),
        format: "pdf",
      });
    },
    deleteReport() {
      const id = this.$route.params.id as string;
      this.$store.dispatch("report/deleteReport", { project_id: id, report_id: this.report.id });
    },
    /**
     * Function that add new action to report
     * @param type string, action type key
     */
    addAction(type: string) {
      const newAction: any = { type, format: "pdf" };

      switch (type) {
        case "webhook":
          newAction.params = {
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
            url: "",
          };
          break;
        case "email":
          newAction.params = {
            recipients: ["example@mail.com"],
            subject: "{{name}}",
            body: "Report from {{start}} to {{end}}",
          };
          break;
      }
      this.report.actions.push(newAction);
    },
    deleteAction(index: number) {
      this.report.actions.splice(index, 1);
    },
    /**
     * Download report
     */
    async downloadReport() {
      this.showSpinner = true;

      const res = await this.$store.dispatch("report/printReport", {
        project_id: this.$route.params.id as string,
        report_id: this.report.id,
        format: this.reportFormat,
        start: moment(this.startDate!).unix(),
        end: moment(this.endDate!).unix(),
      });

      const exportName = this.report.name;
      // creates link to download report
      const downloadAnchorNode = document.createElement("a");
      let dataStr = "";
      let fileType = "";

      if (this.reportFormat === "json") {
        dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res))}`;
        fileType = "json";
      } else if (this.reportFormat === "csv") {
        dataStr = `data:text/plain;charset=utf-8,${encodeURIComponent(res)}`;
        fileType = "csv";
      } else if (this.reportFormat === "pdf") {
        const file = new Blob([res]);
        // Build a URL from the file
        dataStr = URL.createObjectURL(file);
        fileType = "pdf";
      } else if (this.reportFormat === "xml") {
        dataStr = `data:text/xml;charset=utf-8,${encodeURIComponent(res)}`;
        fileType = "xml";
      } else {
        this.showSpinner = false;
        return;
      }

      // add attributes for download link
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${exportName}.${fileType}`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      this.showSpinner = false;
    },
    fetchMeasurements(projectId: string): Promise<void> {
      return this.$store.dispatch("measurements/fetchMeasurements", projectId);
    },
  },
});
</script>
<style lang="scss" scoped></style>
