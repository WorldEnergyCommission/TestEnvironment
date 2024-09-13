<template>
  <CoreRow>
    <CoreColumn cols="12">
      <h2 class="subTitle small-xMargin">
        {{ $t("modals.manageReport.subTitles.generalTitle") }}
      </h2>
      <div>
        <CoreTextField
          v-model="localReport.name"
          :label="$t('modals.manageReport.textFields.nameReportField')"
          :rules="nameRules"
          required
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <CoreTextField
          v-model="localReport.meta.zev.innosolv.username"
          :label="$t('modals.manageReport.textFields.usernameField')"
          :rules="nameRules"
          required
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <div class="d-flex">
          <CoreSelect
            v-model="localReport.currency"
            :items="currencyOptions"
            :label="$t('modals.manageReport.textFields.currencyField')"
            hide-selected
            item-title="state"
            item-value="abbr"
            style="width: 200px !important"
            :disabled="disabled"
            @update:model-value="onReportChange"
          />
          <TimezoneChooser
            :current-value="localReport.timezone"
            :disabled="disabled"
            @on-change="onTimezoneChange"
          />
        </div>
      </div>
    </CoreColumn>
    <div class="d-flex" style="width: 100%">
      <h2 style="margin-left: 28px">
        {{ $t("modals.manageReport.subTitles.tarifTitle") }}
      </h2>
      <CoreTooltip location="bottom">
        <template #activator="{ props }">
          <div
            style="z-index: 999999999 !important; width: 30px; margin-left: 10px; margin-top: 6px"
            v-bind="props"
            @mouseenter="doesHover = true"
            @mouseleave="doesHover = false"
          >
            <lynus-icon
              :color="doesHover === true ? 'accent' : 'theme'"
              name="info-in-circle"
              size="24"
              style="z-index: 9 !important"
              v-bind="props"
            />
          </div>
        </template>
        <div style="max-width: 300px">
          <div style="padding-bottom: 4px">
            {{ $t("modals.manageReport.expressionDescriptionTitle") }}
          </div>
          <ul>
            <li
              v-for="(item, index) in $t('modals.manageReport.expressionDescriptionItems')"
              :key="index"
            >
              {{ item }}
            </li>
          </ul>
          <div style="padding-bottom: 4px; padding-top: 8px">
            {{ $t("modals.manageReport.tarifDescriptionText") }}
          </div>
        </div>
      </CoreTooltip>
    </div>
    <CoreRow class="d-flex flex-wrap pa-0">
      <CoreColumn cols="12">
        <div class="d-flex flex-wrap">
          <div style="max-width: 250px">
            <CoreSelect
              v-model="tempWeekDay"
              :items="weekDayOptions"
              :label="$t('modals.manageReport.textFields.weekdayField')"
              hide-selected
              item-title="state"
              item-value="abbr"
              style="width: 200px !important"
              :disabled="disabled"
              @update:model-value="onReportChange"
            />
          </div>
          <div>
            <CoreCheckbox
              v-model="groupingSelected"
              :false-value="true"
              :label="$t('modals.manageReport.textFields.switchTariffOption')"
              :true-value="false"
              hide-details
              :disabled="disabled"
              @update:model-value="onReportChange"
            />
          </div>
        </div>
      </CoreColumn>
      <!-- Internal Tarif-->
      <CoreColumn class="v-col-12 v-col-md-6">
        <div>
          <div>{{ $t("modals.manageReport.titlePvTarif") }}</div>
          <!--<div>{{localReport.meta.zev.arrayDaySettingsInternal}}</div>-->
          <div class="pr-16">
            <CoreSelect
              v-model="localReport.meta.zev.arrayDaySettingsInternal[parseInt(tempWeekDay)]"
              :items="currentDayOptions"
              :label="$t('modals.manageReport.textFields.daySettingsField')"
              class="mt-2"
              hide-selected
              item-title="state"
              item-value="abbr"
              :disabled="disabled"
              @update:model-value="changeOfDaySetting(true, parseInt(tempWeekDay))"
            />
            <div
              v-if="
                localReport.meta.zev.arrayDaySettingsInternal[parseInt(tempWeekDay)] === 'custom'
              "
            >
              <div class="d-flex flex-wrap">
                <CoreTextField
                  v-model="localReport.meta.zev.tariffs.internal.time[parseInt(tempWeekDay)][0][0]"
                  :label="$t('modals.manageReport.textFields.tarifStart1Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
                <CoreTextField
                  v-model="localReport.meta.zev.tariffs.internal.time[parseInt(tempWeekDay)][0][1]"
                  :label="$t('modals.manageReport.textFields.tarifEnd1Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
              </div>
              <div class="d-flex flex-wrap">
                <CoreTextField
                  v-if="
                    localReport.meta.zev.tariffs.internal.time[parseInt(tempWeekDay)][1] !==
                    undefined
                  "
                  v-model="localReport.meta.zev.tariffs.internal.time[parseInt(tempWeekDay)][1][0]"
                  :label="$t('modals.manageReport.textFields.tarifStart2Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
                <CoreTextField
                  v-if="
                    localReport.meta.zev.tariffs.internal.time[parseInt(tempWeekDay)][1] !==
                    undefined
                  "
                  v-model="localReport.meta.zev.tariffs.internal.time[parseInt(tempWeekDay)][1][1]"
                  :label="$t('modals.manageReport.textFields.tarifEnd2Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
              </div>
            </div>
            <div class="d-flex flex-wrap">
              <CoreTextField
                v-model="localReport.meta.zev.tariffs.internal.low"
                :label="$t('modals.manageReport.textFields.tarifPrice1Title')"
                :rules="unitCostRule"
                :disabled="disabled"
                @update:model-value="onReportChange"
              />
              <CoreTextField
                v-model="localReport.meta.zev.tariffs.internal.high"
                :label="$t('modals.manageReport.textFields.tarifPrice2Title')"
                :rules="unitCostRule"
                :disabled="disabled"
                @update:model-value="onReportChange"
              />
            </div>
          </div>
          <div
            v-if="localReport.meta.zev.arrayDaySettingsInternal[parseInt(tempWeekDay)] === 'custom'"
            class="d-flex flex-wrap pt-2"
          />
          <div v-if="checkInternal === true" style="color: #e83b3a">
            {{ $t("modals.manageReport.errorMessages.timeError") }}
          </div>
          <CoreCheckbox
            v-model="toggleSecondTariff"
            :false-value="false"
            :label="$t('modals.manageReport.textFields.activateSecTarif')"
            :true-value="true"
            hide-details
            :disabled="disabled"
            @update:model-value="clearTariffTimes"
          />
        </div>
      </CoreColumn>
      <CoreColumn class="v-col-12 v-col-md-6">
        <div>
          <div>{{ $t("modals.manageReport.titleGridTarif") }}</div>
          <div class="pr-16">
            <CoreSelect
              v-model="localReport.meta.zev.arrayDaySettingsExternal[parseInt(tempWeekDay)]"
              :items="currentDayOptions"
              :label="$t('modals.manageReport.textFields.daySettingsField')"
              class="mt-2"
              hide-selected
              item-title="state"
              item-value="abbr"
              :disabled="disabled"
              @update:model-value="changeOfDaySetting(false, parseInt(tempWeekDay))"
            />
            <div
              v-if="
                localReport.meta.zev.arrayDaySettingsExternal[parseInt(tempWeekDay)] === 'custom'
              "
            >
              <div class="d-flex flex-wrap">
                <CoreTextField
                  v-model="localReport.meta.zev.tariffs.external.time[parseInt(tempWeekDay)][0][0]"
                  :label="$t('modals.manageReport.textFields.tarifStart1Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
                <CoreTextField
                  v-model="localReport.meta.zev.tariffs.external.time[parseInt(tempWeekDay)][0][1]"
                  :label="$t('modals.manageReport.textFields.tarifEnd1Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
              </div>
              <div class="d-flex flex-wrap">
                <CoreTextField
                  v-if="
                    localReport.meta.zev.tariffs.external.time[parseInt(tempWeekDay)][1] !==
                    undefined
                  "
                  v-model="localReport.meta.zev.tariffs.external.time[parseInt(tempWeekDay)][1][0]"
                  :label="$t('modals.manageReport.textFields.tarifStart2Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
                <CoreTextField
                  v-if="
                    localReport.meta.zev.tariffs.external.time[parseInt(tempWeekDay)][1] !==
                    undefined
                  "
                  v-model="localReport.meta.zev.tariffs.external.time[parseInt(tempWeekDay)][1][1]"
                  :label="$t('modals.manageReport.textFields.tarifEnd2Title')"
                  :rules="timeSettingsRule"
                  :disabled="disabled"
                  @update:model-value="onReportChange"
                />
              </div>
            </div>
            <div class="d-flex flex-wrap">
              <CoreTextField
                v-model="localReport.meta.zev.tariffs.external.low"
                :label="$t('modals.manageReport.textFields.tarifPrice1Title')"
                :rules="unitCostRule"
                :disabled="disabled"
                @update:model-value="onReportChange"
              />
              <CoreTextField
                v-model="localReport.meta.zev.tariffs.external.high"
                :label="$t('modals.manageReport.textFields.tarifPrice2Title')"
                :rules="unitCostRule"
                :disabled="disabled"
                @update:model-value="onReportChange"
              />
            </div>
          </div>
          <div v-if="checkExternal === true" style="color: #e83b3a">
            {{ $t("modals.manageReport.errorMessages.timeError") }}
          </div>
        </div>
      </CoreColumn>
    </CoreRow>
    <CoreColumn cols="12">
      <h2 class="subTitle small-xMargin">
        {{ $t("modals.manageReport.subTitles.mainVarsTitle") }}
      </h2>
      <div class="d-flex flex-wrap">
        <CoreTextField
          v-model="localReport.meta.zev.titles.grid"
          :label="$t('modals.manageReport.textFields.titleField')"
          :rules="titleRules"
          required
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <CoreCombobox
          v-model="localReport.meta.zev.producers.external[0].name"
          :items="measurementsKeys"
          :label="$t('modals.manageReport.textFields.gridField')"
          :rules="gridRule"
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
      </div>
    </CoreColumn>
    <CoreColumn cols="12">
      <div class="small-xMargin">
        <h2>{{ $t("modals.manageReport.subTitles.pvVarsTitle") }}</h2>
      </div>
      <div class="mb-4">
        <CoreTextField
          v-model="localReport.meta.zev.titles.photovoltaik"
          :label="$t('modals.manageReport.textFields.titleField')"
          :rules="titleRules"
          class="pt-2"
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <CoreButton
          class="mt-2 mx-3"
          button-type="primary"
          :disabled="disabled"
          @click="addZevVar('pv')"
        >
          {{ $t("modals.manageReport.buttons.addPVButton") }}
        </CoreButton>
      </div>
      <div
        v-for="(element, index) in localReport.meta.zev.producers.internal"
        :key="index"
        class="d-flex flex-wrap mt-2"
      >
        <CoreCombobox
          v-model="localReport.meta.zev.producers.internal[index].name"
          :items="measurementsKeys"
          :label="'PV Variable ' + (index + 1)"
          :rules="variableNameRule"
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <CoreButton
          :style="{ visibility: index >= 1 ? 'visible' : 'hidden' }"
          class="mt-3"
          button-type="delete"
          :disabled="disabled"
          @click="removeZevVar('pv', index)"
        >
          {{ $t("modals.manageReport.buttons.deleteVariable") }}
        </CoreButton>
      </div>
    </CoreColumn>
    <CoreColumn cols="12">
      <div class="small-xMargin mb-4">
        <h2>{{ $t("modals.manageReport.subTitles.appartmentTitle") }}</h2>
        <CoreButton
          class="mt-2"
          button-type="primary"
          :disabled="disabled"
          @click="addZevVar('appartment')"
        >
          {{ $t("modals.manageReport.buttons.addAPButton") }}
        </CoreButton>
        <div v-if="duplicateAppartmentTitles === true" class="mx-3" style="color: #e83b3a">
          {{ $t("modals.manageReport.duplicateTitlesText") }}
        </div>
      </div>
      <div
        v-for="(element, index) in localReport.meta.zev.consumers"
        :key="index"
        class="d-flex flex-wrap mt-2"
      >
        <CoreTextField
          v-model="localReport.meta.zev.consumers[index].title"
          :label="$t('modals.manageReport.textFields.titleField')"
          :rules="nameRules"
          required
          :disabled="disabled"
          @change="checkAppartments"
          @update:model-value="onReportChange"
        />
        <CoreCombobox
          v-model="localReport.meta.zev.consumers[index].name"
          :items="measurementsKeys"
          :label="$t('modals.manageReport.textFields.appartmentVarField') + (index + 1)"
          :rules="variableNameRule"
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <CoreTextField
          v-model="localReport.meta.zev.consumers[index].metering_id"
          :rules="meterIDRule"
          label="Metering ID"
          required
          :disabled="disabled"
          @update:model-value="onReportChange"
        />
        <CoreButton
          :style="{ visibility: index >= 1 ? 'visible' : 'hidden' }"
          class="mt-3"
          button-type="delete"
          :disabled="disabled"
          @click="removeZevVar('appartment', index)"
        >
          {{ $t("modals.manageReport.buttons.deleteVariable") }}
        </CoreButton>
      </div>
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import { defineComponent, PropType } from "vue";

import { IReport } from "@/store/modules/report/types";
import TimezoneChooser from "@/ui/components/components/TimezoneChooser.vue";
import { minutesToTime, timeToMinutes } from "@/utils/utilsFunctions";

/**
 * A component that allows to create Zev report
 */
export default defineComponent({
  components: {
    TimezoneChooser,
  },
  props: {
    report: { type: Object as PropType<IReport>, required: true },
    isNewReport: {
      type: Boolean,
    },
    disabled: { default: false, type: Boolean },
    modelValue: Boolean,
  },
  data() {
    const toggleSecondTariff: any = true;

    return {
      toggleSecondTariff,
      checkInternal: false,
      checkExternal: false,
      doesHover: false,
      duplicateAppartmentTitles: false,
      tempWeekDay: 0,
    };
  },
  computed: {
    timeSettingsRule() {
      return [
        (v: any) =>
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v) === true || "only format HH:MM is allowed",
      ];
    },
    unitCostRule() {
      return [
        (v: any) =>
          /^\d+(\.\d+)*$/.test(v) === true ||
          this.$t("modals.manageReport.errorMessages.unitCostRule"),
      ];
    },
    meterIDRule() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.meterIDRule"),
      ];
    },
    gridRule() {
      return [(v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.gridRule")];
    },
    variableNameRule() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.variableNameRule"),
      ];
    },
    nameRules() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.nameRule1"),
        (v: any) => v.length <= 100 || this.$t("modals.manageReport.errorMessages.nameRule2"),
      ];
    },
    usernameRules() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.usernameRule"),
      ];
    },
    titleRules() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.titleRule1"),
        (v: any) => v.length <= 30 || this.$t("modals.manageReport.errorMessages.titleRule2"),
      ];
    },
    currencyOptions() {
      return [
        { state: "EUR", abbr: "EUR" },
        { state: "CHF", abbr: "CHF" },
      ];
    },
    weekDayOptions() {
      if (this.localReport.meta.zev.groupingSelected === false) {
        return [
          { state: this.$t("modals.manageReport.weekDayOptions.mondayOption"), abbr: 0 },
          { state: this.$t("modals.manageReport.weekDayOptions.tuesdayOption"), abbr: 1 },
          { state: this.$t("modals.manageReport.weekDayOptions.wednesdayOption"), abbr: 2 },
          { state: this.$t("modals.manageReport.weekDayOptions.thursdayOption"), abbr: 3 },
          { state: this.$t("modals.manageReport.weekDayOptions.fridayOption"), abbr: 4 },
          { state: this.$t("modals.manageReport.weekDayOptions.saturdayOption"), abbr: 5 },
          { state: this.$t("modals.manageReport.weekDayOptions.sundayOption"), abbr: 6 },
        ];
      } else {
        return [
          { state: this.$t("modals.manageReport.weekDayOptions.workDayGrouping"), abbr: 0 },
          { state: this.$t("modals.manageReport.weekDayOptions.weekendGrouping"), abbr: 5 },
        ];
      }
    },
    currentDayOptions() {
      return [
        { state: this.$t("modals.manageReport.daySettings.customOption"), abbr: "custom" },
        { state: this.$t("modals.manageReport.daySettings.highOption"), abbr: "high" },
        { state: this.$t("modals.manageReport.daySettings.lowOption"), abbr: "low" },
      ];
    },
    localReport() {
      // also update local scaling property
      return cloneDeep(this.report);
    },
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
    groupingSelected: {
      get() {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  created() {
    this.revertTimeFromApi();
    if (this.report.meta.zev.tariffs.internal.time[0][1] === undefined) {
      this.toggleSecondTariff = false;
    }
  },
  methods: {
    changeOfDaySetting(isInternal: boolean, currentSelectedDay: number) {
      const currentDaySettingInternal =
        this.localReport.meta.zev.arrayDaySettingsInternal[currentSelectedDay];
      const currentDaySettingExternal =
        this.localReport.meta.zev.arrayDaySettingsExternal[currentSelectedDay];
      const internalTimes = this.localReport.meta.zev.tariffs.internal.time;
      const externalTimes = this.localReport.meta.zev.tariffs.external.time;
      if (isInternal) {
        // changes in internal Day settings
        internalTimes[currentSelectedDay] = this.getAllDaySetting(currentDaySettingInternal);
      } else {
        // changes in external Day settings
        externalTimes[currentSelectedDay] = this.getAllDaySetting(currentDaySettingExternal);
      }

      this.onReportChange();
    },
    /**
     * Takes the current times for either internal or external tariffs and the current
     * day setting (low/high) and sets it to the respective times so that it is valid for
     * all day.
     */
    getAllDaySetting(currentDaySetting: string) {
      switch (currentDaySetting) {
        case "low":
          // low is selected
          if (this.toggleSecondTariff === true) {
            // 2 tariffs
            return [
              ["00:00", "11:59"],
              ["12:00", "23:59"],
            ];
          } else {
            // 1 tariff
            return [["00:00", "23:59"]];
          }
        case "high":
          return [];
        case "custom":
          if (this.toggleSecondTariff === true) {
            return [
              ["00:00", "00:00"],
              ["00:00", "00:00"],
            ];
          } else {
            return [["00:00", "00:00"]];
          }
      }
    },
    /**
     * Checks for duplicates in Consumer Titles
     */
    checkAppartments() {
      const titlesAppartments = this.localReport.meta.zev.consumers?.map(
        (element: any) => element.title,
      );
      if (!titlesAppartments) return;
      for (let i = 0; i < titlesAppartments.length; i++) {
        for (let x = 0; x < titlesAppartments.length; x++) {
          if (titlesAppartments[i] === titlesAppartments[x] && i !== x) {
            this.duplicateAppartmentTitles = true;
            return 0;
          } else {
            this.duplicateAppartmentTitles = false;
          }
        }
      }
    },
    checkInternalTarif() {
      let test = false;
      for (let i = 0; i <= 6; i++) {
        if (this.localReport.meta.zev.tariffs.internal.time[i][0] !== undefined) {
          const internalTarifs = this.localReport.meta.zev.tariffs.internal.time[i];
          if (timeToMinutes(internalTarifs[0][0]) > timeToMinutes(internalTarifs[0][1])) {
            test = true;
          }
          if (
            internalTarifs[1] !== undefined &&
            timeToMinutes(internalTarifs[1][0]) > timeToMinutes(internalTarifs[1][1])
          ) {
            test = true;
          }
        }
      }
      this.checkInternal = test;
    },
    checkExternalTarif() {
      let test = false;
      for (let i = 0; i <= 6; i++) {
        if (this.localReport.meta.zev.tariffs.external.time[i][0] !== undefined) {
          const externalTarifs = this.localReport.meta.zev.tariffs.external.time[i];
          if (timeToMinutes(externalTarifs[0][0]) > timeToMinutes(externalTarifs[0][1])) {
            test = true;
          }
          if (
            externalTarifs[1] !== undefined &&
            timeToMinutes(externalTarifs[1][0]) > timeToMinutes(externalTarifs[1][1])
          ) {
            test = true;
          }
        }
      }
      this.checkExternal = test;
    },
    /**
     * Used to format times from time in minutes to format HH:MM
     */
    revertTimeFromApi() {
      for (let i = 0; i <= 6; i++) {
        // internal Times
        const internalTimes: any[][] = this.report.meta.zev.tariffs.internal.time;
        // map every start/end time from its minute value to an actual time in HH:mm format
        // e.g. [["0", "360"]] -> [["00:00", "06:00"]]
        internalTimes[i] = internalTimes[i].map((e: any[]) =>
          e.map((minutes) => minutesToTime(minutes)),
        );

        // external Times
        const externalTimes = this.report.meta.zev.tariffs.external.time;
        // map every start/end time from its minute value to an actual time in HH:mm format
        // e.g. [["0", "360"]] -> [["00:00", "06:00"]]
        externalTimes[i] = externalTimes[i].map((e: any[]) =>
          e.map((minutes) => minutesToTime(minutes)),
        );
      }
    },
    clearTariffTimes() {
      if (this.toggleSecondTariff === false) {
        for (let i = 0; i <= 6; i++) {
          const currentTarifs = this.localReport.meta.zev.tariffs;
          if (this.localReport.meta.zev.arrayDaySettingsInternal[i] !== "high") {
            currentTarifs.internal.time[i] = [currentTarifs.internal.time[i][0]];
          }
          if (this.localReport.meta.zev.arrayDaySettingsExternal[i] !== "high") {
            currentTarifs.external.time[i] = [currentTarifs.external.time[i][0]];
          }
        }
      } else {
        for (let i = 0; i <= 6; i++) {
          const currentTarifs = this.localReport.meta.zev.tariffs;
          if (this.localReport.meta.zev.arrayDaySettingsInternal[i] !== "high") {
            currentTarifs.internal.time[i].push(["", ""]);
          }
          if (this.localReport.meta.zev.arrayDaySettingsExternal[i] !== "high") {
            currentTarifs.external.time[i].push(["", ""]);
          }
        }
      }
      this.onReportChange();
    },
    addZevVar(type: string) {
      if (type === "pv") {
        this.localReport.meta.zev.producers?.internal.push({ name: "", title: "" });
      } else {
        this.localReport.meta.zev.consumers?.push({ name: "", title: "", metering_id: "" });
      }
      this.onReportChange();
    },
    removeZevVar(type: string, index: number) {
      if (type === "pv") {
        this.localReport.meta.zev.producers?.internal.splice(index, 1);
      } else {
        this.localReport.meta.zev.consumers?.splice(index, 1);
      }
      this.onReportChange();
    },
    onTimezoneChange(value: string) {
      this.localReport.timezone = value;
      this.onReportChange();
    },
    onReportChange() {
      this.checkInternalTarif();
      this.checkExternalTarif();
      let checkTariffs = false;
      if (this.checkInternal === false && this.checkExternal === false) {
        checkTariffs = false;
      } else {
        checkTariffs = true;
      }
      this.$emit("onReportChange", { report: this.localReport, tarifCheck: checkTariffs });
    },
  },
});
</script>

<style>
.subTitle {
  margin-top: 8px;
  margin-bottom: 8px;
}

.small-xMargin {
  margin-left: 15px;
  margin-right: 15px;
}

.med-xMargin {
  margin-left: 30px;
  margin-right: 30px;
}
</style>
