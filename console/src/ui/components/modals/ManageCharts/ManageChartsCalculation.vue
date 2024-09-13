<template>
  <div>
    <!-- Basic Selection Part -->
    <CoreSelect
      v-model="localItemOptions.type"
      :items="chartTypes"
      :label="$t('modals.manageCharts.form.type')"
      class="pt-7"
      hide-selected
      item-title="text"
      item-value="value"
      @update:model-value="onItemOptionsChange('type')"
    />
    <CoreSelect
      v-model="localItemOptions.agg"
      :items="aggregationMethods"
      :label="$t('modals.manageCharts.form.aggregation')"
      hide-selected
      item-title="state"
      item-value="abbr"
      @update:model-value="onItemOptionsChange('agg')"
    />
    <CoreSelect
      v-model="localItemOptions.miss"
      :items="missingValueStrategies"
      :label="$t('modals.manageCharts.form.missingValueStrategy')"
      hide-selected
      item-title="state"
      item-value="abbr"
      @update:model-value="onItemOptionsChange('miss')"
    />
    <CoreTextField
      v-model="localItemOptions.unit"
      :label="$t('modals.manageCharts.form.unit')"
      autocomplete="off"
      max-length="4"
      @update:model-value="onItemOptionsChange('unit')"
    />
    <CoreTextField
      v-model="localItemOptions.name"
      :label="$t('modals.manageCharts.form.displayName')"
      autocomplete="off"
      max-length="30"
      @update:model-value="onItemOptionsChange('displayName')"
    />
    <div class="mb-2 d-flex">
      <CoreTextField
        v-model="localItemOptions.scaling.min"
        :label="$t('modals.manageCharts.form.min')"
        autocomplete="off"
        hide-details
        style="margin-right: 4px"
        type="number"
        @update:model-value="onItemOptionsChange('min')"
      />
      <CoreTextField
        v-model="localItemOptions.scaling.max"
        :label="$t('modals.manageCharts.form.max')"
        autocomplete="off"
        hide-details
        style="margin-left: 4px"
        type="number"
        @update:model-value="onItemOptionsChange('max')"
      />
    </div>
    <!-- Contains the new inputfield for the Math expression -->
    <ExpressionTextArea
      :expression-variable="localItemOptions.calculation.expression"
      @change-disable="handleDisableChange"
      @expression-change="handleExpressionChange"
    />
    <CoreColumn cols="12" class="no-padding">
      <!-- Contains the Window with that shows the calculation overview -->
        <CalculationAggregationWindow
          :aggregation-options="localItemOptions.calculation.aggregations"
          :available-aggregation-methods="aggregationMethods"
          :calculation-variables="calculationVariables"
          @agg-array-change="handleAggChange"
        />
    </CoreColumn>
  </div>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import { defineComponent, PropType } from "vue";

import { getVariableNames } from "@/ui/components/devices/charts/charts/ChartMath";
import CalculationAggregationWindow from "@/ui/components/modals/ManageCharts/CalculationAggregationWindow.vue";
import ExpressionTextArea from "@/ui/components/modals/ManageCharts/ExpressionTextArea.vue";

/**
 * Manage charts calculation form
 */
export default defineComponent({
  components: {
    CalculationAggregationWindow,
    ExpressionTextArea,
  },
  data() {
    const previousVariables: string[] = [];
    const calculationVariables: string[] = [];
    const methodOptions: string[] = ["+", "-", "*", "/", "="];

    return {
      methodOptions,
      fullCalculation: "default",
      testVariable: "",
      calculationVariables,
      /** contains the array needed to compare changes of old array of Variables with the new Variables */
      previousVariables,
    };
  },
  computed: {
    localItemOptions() {
      return cloneDeep(this.itemOptions);
    },
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
  },
  created() {
    this.calculationVariables = getVariableNames(this.localItemOptions.calculation.expression);
  },
  methods: {
    /**
     * should be called when anything in this.localItemOptions changes
     */
    onItemOptionsChange(changedOption: string) {
      if (changedOption === "agg") {
        this.changeExpressionAggArray();
      }

      this.updateScalings();
      this.$emit("itemOptionsChange", this.name, this.localItemOptions);
    },
    /** replace empty strings with null in the scalings */
    updateScalings() {
      this.localItemOptions.scaling.min = this.localItemOptions.scaling.min || null;
      this.localItemOptions.scaling.max = this.localItemOptions.scaling.max || null;
    },

    /**
     * Changes aggregations of single Expression parts to main Aggregation selected for calculation.
     */
    changeExpressionAggArray() {
      const newArray = [];
      for (let index = 0; index <= this.localItemOptions.calculation.aggregations.length; index++) {
        newArray.push(this.localItemOptions.agg);
      }
      this.localItemOptions.calculation.aggregations = newArray;
    },
    /**
     * Passes disabled status back to main ManageChart Component
     * @param disbaleValue object that contains status
     */
    handleDisableChange(disbaleValue: any) {
      this.$emit("changeDisable", disbaleValue, this.index);
    },
    /**
     * on change of the expression it will be availible here
     * @param expression object, expression data
     */
    handleExpressionChange(expression: any) {
      this.localItemOptions.calculation.expression = expression.fullExpression;
      this.calculationVariables = expression.varNames;
      this.updateAggregations();
      this.previousVariables = expression.varNames;
      this.onItemOptionsChange("expression");
    },
    handleAggChange(newArray: any[]) {
      this.localItemOptions.calculation.aggregations = newArray;
      this.onItemOptionsChange("aggArray");
    },
    /**
     * Function that updates aggregation
     */
    updateAggregations() {
      const diff =
        this.calculationVariables.length - this.localItemOptions.calculation.aggregations.length;

      if (diff > 0) {
        // puts in new elements if variables are added
        let indexChange = this.previousVariables.length;
        this.previousVariables.forEach((element: string, index: number) => {
          if (element !== this.calculationVariables[index]) {
            indexChange = index;
          }
        });
        this.localItemOptions.calculation.aggregations.splice(indexChange, 0, "last");
      } else if (diff < 0) {
        // removes elements if variables are deleted from the math expression
        let indexChange = this.calculationVariables.length;
        this.calculationVariables.forEach((element: string, index: number) => {
          if (element !== this.previousVariables[index]) {
            indexChange = index;
          }
        });
        this.localItemOptions.calculation.aggregations.splice(indexChange, 1);
      }
    },
  },
  props: {
    index: {
      type: Number,
    },
    name: { default: String(), type: String },
    itemOptions: Object as PropType<any>,
    aggregationMethods: {
      type: Array as PropType<any[]>,
    },
    missingValueStrategies: {
      type: Array as PropType<any[]>,
    },
    chartTypes: {
      type: Array as PropType<any[]>,
    },
  },
});
</script>

<style>
.no-padding {
  padding: 0px !important;
}
</style>
