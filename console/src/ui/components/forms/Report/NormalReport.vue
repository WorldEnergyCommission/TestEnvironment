<template>
  <CoreRow class="mt-3">
    <CoreColumn cols="12">
      <h1 v-if="isNewReport === true">
        {{ $t("modals.manageReport.headerText") }}
      </h1>
    </CoreColumn>
    <CoreColumn cols="12">
      <h2>{{ $t("modals.manageReport.subTitles.generalTitle") }}</h2>
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreTextField
        v-model="localReport.name"
        :label="$t('modals.manageReport.textFields.nameReportField')"
        :rules="nameRules"
        hide-details="auto"
        required
        :disabled="disabled"
        @update:model-value="onReportChange"
      />
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreSelect
        v-model="localReport.currency"
        :items="currencyOptions"
        :label="$t('modals.manageReport.textFields.currencyField')"
        hide-details="auto"
        item-title="state"
        item-value="abbr"
        :disabled="disabled"
        @update:model-value="onReportChange"
      />
    </CoreColumn>
    <CoreColumn cols="12">
      <h2>{{ $t("modals.manageReport.subTitles.addressTitle") }}</h2>
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreTextField
        v-model="localReport.address.street"
        :label="$t('modals.manageReport.textFields.streetField')"
        :rules="streetRule"
        hide-details="auto"
        :disabled="disabled"
        @update:model-value="onReportChange"
      />
    </CoreColumn>
    <CoreColumn cols="6">
      <CoreTextField
        v-model="localReport.address.city"
        :label="$t('modals.manageReport.textFields.cityField')"
        :rules="cityRule"
        hide-details="auto"
        :disabled="disabled"
        @update:model-value="onReportChange"
      />
    </CoreColumn>
    <CoreColumn cols="6">
      <CoreTextField
        v-model="localReport.address.country"
        :label="$t('modals.manageReport.textFields.countryField')"
        :rules="countryRule"
        hide-details="auto"
        :disabled="disabled"
        @update:model-value="onReportChange"
      />
    </CoreColumn>
    <CoreColumn>
      <CoreRow>
        <CoreColumn cols="6">
          <h2>{{ $t("modals.manageReport.subTitles.varibalesTitle") }}</h2>
        </CoreColumn>
        <CoreColumn :class="['d-flex', { 'flex-row-reverse': !$vuetify.display.mobile }]">
          <CoreButton button-type="primary" :disabled="disabled" @click="addVariable">
            {{ $t("modals.manageReport.buttons.addVariable") }}
          </CoreButton>
        </CoreColumn>
      </CoreRow>
      <CoreRow v-for="(element, index) in localReport.variables" :key="index">
        <CoreColumn v-if="index >= 1 && $vuetify.display.mobile" cols="12">
          <CoreDivider />
        </CoreColumn>
        <CoreColumn cols="12" md="3">
          <CoreTextField
            v-model="element.title"
            :label="$t('modals.manageReport.textFields.titleField')"
            :rules="titleRules"
            hide-details="auto"
            required
            :disabled="disabled"
            @update:model-value="onReportChange"
          />
        </CoreColumn>
        <CoreColumn cols="12" md="3">
          <CoreCombobox
            v-model="element.name"
            :items="measurementsKeys"
            :label="$t('modals.manageReport.textFields.nameField')"
            :rules="variableNameRule"
            hide-details="auto"
            :disabled="disabled"
            @update:model-value="onReportChange"
          />
        </CoreColumn>
        <CoreColumn cols="12" md="2">
          <CoreTextField
            v-model="element.unit_cost"
            :label="$t('modals.manageReport.textFields.unitCostField')"
            :rules="unitCostRule"
            hide-details="auto"
            type="number"
            :disabled="disabled"
            @update:model-value="onReportChange"
          />
        </CoreColumn>
        <CoreColumn cols="12" md="2">
          <CoreTextField
            v-model="element.unit"
            :label="$t('modals.manageReport.textFields.unitField')"
            :rules="unitRule"
            hide-details="auto"
            :disabled="disabled"
            @update:model-value="onReportChange"
          />
        </CoreColumn>
        <CoreColumn v-if="index >= 1" cols="12" md="2">
          <CoreButton
            class="mt-3"
            button-type="delete"
            :disabled="disabled"
            @click="removeVariablebyIndex(index)"
          >
            {{ $t("modals.manageReport.buttons.deleteVariable") }}
          </CoreButton>
        </CoreColumn>
      </CoreRow>
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import { defineComponent, PropType } from "vue";

/**
 * A component that allows to create normal report
 */
export default defineComponent({
  props: {
    report: Object as PropType<any>,
    isNewReport: {
      type: Boolean,
    },
    disabled: { default: false, type: Boolean },
    modelValue: [],
  },
  computed: {
    nameRules() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.nameRule1"),
        (v: any) => v.length <= 100 || this.$t("modals.manageReport.errorMessages.nameRule2"),
      ];
    },
    titleRules() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.titleRule1"),
        (v: any) => v.length <= 30 || this.$t("modals.manageReport.errorMessages.titleRule2"),
      ];
    },
    streetRule() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.streetRule"),
      ];
    },
    cityRule() {
      return [(v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.cityRule")];
    },
    countryRule() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.countryRule"),
      ];
    },
    variableNameRule() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.variableNameRule"),
      ];
    },
    unitCostRule() {
      return [
        (v: any) =>
          /^\d+(\.\d+)*$/.test(v) === true ||
          this.$t("modals.manageReport.errorMessages.unitCostRule"),
      ];
    },
    unitRule() {
      return [
        (v: any) => v.length !== 0 || this.$t("modals.manageReport.errorMessages.unitRule1"),
        (v: any) => v.length <= 3 || this.$t("modals.manageReport.errorMessages.unitRule2"),
      ];
    },
    currencyOptions() {
      return [
        { state: "EUR", abbr: "EUR" },
        { state: "CHF", abbr: "CHF" },
      ];
    },
    localReport() {
      // also update local scaling property
      return cloneDeep(this.report);
    },
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
    variables: {
      get(): any[] {
        return this.modelValue as unknown as any[];
      },

      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  methods: {
    handleChangeActions(res: any) {
      this.onReportChange();
    },
    onReportChange() {
      this.$emit("onReportChange", { report: this.localReport });
    },
    addVariable() {
      this.variables?.push({ name: "", title: "", unit_cost: 0, unit: "" });
      this.onReportChange();
    },
    removeVariablebyIndex(index: number) {
      this.variables?.splice(index, 1);
      this.onReportChange();
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
