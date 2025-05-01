<template>
  <div :class="hasMarginComputed === true ? 'mt-6' : ''">
    <div style="width: 100%; display: table; align-content: end">
      <CoreTooltip location="bottom">
        <template #activator="{ props }">
          <div
            style="
              z-index: 999999999 !important;
              width: 30px;
              margin-left: auto;
              margin-right: 10px;
            "
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
        <div style="max-width: 200px">
          <div style="padding-bottom: 4px">
            {{ $t("modals.manageCharts.form.expressionDescriptionTitle") }}
          </div>
          <ul>
            <li
              v-for="(item, index) in $tm('modals.manageCharts.form.expressionDescriptionItems')"
              :key="index"
            >
              {{ item
              }}{{
                index === $tm("modals.manageCharts.form.expressionDescriptionItems").length - 1
                  ? allowedFunctionsString
                  : ""
              }}
            </li>
          </ul>
        </div>
      </CoreTooltip>
    </div>
    <Mentionable
      :items="listItems"
      :keys="['@']"
      :limit="100"
      insert-space
      offset="5"
      omit-key
      @close="setFocusOnField()"
    >
      <CoreTextarea
        ref="textArea"
        v-model="localExpressionVariable"
        :height="400"
        :label="label || $t('modals.manageCharts.form.mathExpression')"
        :rules="[
          rulesForExpressionField.variableNameRule,
          rulesForExpressionField.parenthesisRule,
          rulesForExpressionField.allowedCharsRule,
          rulesForExpressionField.variableCountRule,
          rulesForExpressionField.generalEpressionRule,
        ]"
        no-resize
        style="font-family: monospace"
        @update:model-value="emitChanges()"
      />
    </Mentionable>
  </div>
</template>

<script lang="ts">
import { clone } from "lodash";
import { defineComponent, PropType, ref } from "vue";
import { Mentionable } from "vue-mention";
import "floating-vue/dist/style.css";

/**
 * Expression Text Area component
 */
import {
  canBeParsed,
  getAllowedMathJsFunctions,
  getVariableCount,
  getVariableNames,
} from "@/ui/components/devices/charts/charts/ChartMath";

export default defineComponent({
  components: {
    Mentionable,
  },
  props: {
    expressionVariable: String,
    label: String,
    hasMargin: Boolean,
  },
  setup() {
    const textArea = ref(null);
    return {
      textArea,
    };
  },
  data() {
    const listItems: any[] = [];

    return {
      listItems,
      doesHover: false,
      localExpressionVariable: "",
      rulesForExpressionField: {
        variableNameRule: () => this.checkVariableNames(),
        parenthesisRule: () => this.checkParenthesis(),
        allowedCharsRule: () => this.checkAllowedChars(),
        variableCountRule: () => this.checkVariableCount(),
        generalEpressionRule: () =>
          this.checkGeneralExpression() || this.getGeneralExpressionError(),
      },
    };
  },
  computed: {
    allChecksOk() {
      return (
        this.checkNotNull() === true &&
        this.checkParenthesis() === true &&
        this.checkAllowedChars() === true &&
        this.checkVariableCount() === true &&
        this.checkGeneralExpression() === true &&
        this.checkVariableNames() === true
      );
    },
    allowedFunctionsString() {
      return getAllowedMathJsFunctions();
    },
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
    hasMarginComputed() {
      return this.hasMargin === undefined ? true : this.hasMargin;
    },
  },
  watch: {
    expressionVariable: [
      {
        handler: "onExpressionVariableChange",
      },
    ],
    allChecksOk: [
      {
        handler: "changeErrorHandling",
      },
    ],
  },
  created() {
    // set the correct expression in the local variable
    this.localExpressionVariable = clone(this.expressionVariable);
    const testCharacters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    // make list of {value: <variablename>, label: <variablename>} out of measurementKeys list
    this.listItems = this.measurementsKeys
      // filter elements that start with number
      .filter((e: string) => !testCharacters.includes(e.charAt(0)))
      .map((e: any) => ({ value: e, label: e }));

    if (!this.checkNotNull) {
      this.$emit("changeDisable", { val: true });
    }
  },
  methods: {
    getGeneralExpressionError() {
      return this.$t(
        "modals.manageCharts.form.errorMessagesExpression.checkGeneralExpressionError",
      );
    },
    setFocusOnField() {
      setTimeout(() => {
        ((this.textArea as any).coreTextarea as any).focus();
      }, 100);
    },
    /**
     * returns the new Math Expression to the childcomponent (ManageChartsCalculation)
     */
    emitChanges() {
      this.$emit("expressionChange", {
        varNames: getVariableNames(this.localExpressionVariable),
        fullExpression: this.localExpressionVariable,
      });
    },
    /**
     * Checks if variable names exist and are allowed to be used in expression.
     */
    checkVariableNames(): boolean | string {
      if (this.localExpressionVariable === "") return true;

      const variableNames = getVariableNames(this.localExpressionVariable);
      const availableVariables = this.listItems.map((e) => e.label);

      for (const v of variableNames) {
        if (!availableVariables.includes(v)) {
          return `${v} ${this.$t(
            "modals.manageCharts.form.errorMessagesExpression.variableNameError",
          )}`;
        }
      }
      return true;
    },
    /**
     * Checks if the expression's parenthesis setting is correct.
     */
    checkParenthesis(): any {
      let count = 0;
      this.localExpressionVariable.split("").forEach((c) => {
        if (c === "(") {
          count++;
        }
        if (c === ")") {
          count--;
        }
      });

      if (count > 0) {
        return this.$t(
          "modals.manageCharts.form.errorMessagesExpression.parenthesisErrorNegativeValue",
        );
      } else if (count < 0) {
        return this.$t(
          "modals.manageCharts.form.errorMessagesExpression.parenthesisErrorPositiveValue",
        );
      } else {
        return true;
      }
    },
    /**
     * Checks if expression only contains allowed chars.
     */
    checkAllowedChars(): boolean | string {
      const notAllowedChars = this.localExpressionVariable.match(/[^\w\.@\s\+\-\*\/\(\),]/g);
      return (
        notAllowedChars === null ||
        `${this.$t(
          "modals.manageCharts.form.errorMessagesExpression.checkAllowedCharsError",
        )} ${notAllowedChars}`
      );
    },
    /**
     * Counts the number of variables appearing in the expression.
     */
    checkVariableCount(): boolean | string {
      const variableCount = getVariableCount(this.localExpressionVariable);

      return (
        variableCount <= 10 ||
        `${variableCount} ${this.$t(
          "modals.manageCharts.form.errorMessagesExpression.checkVariableCount",
        )}`
      );
    },
    /**
     * Checks if the expression can be parsed.
     */
    checkGeneralExpression(): boolean {
      return canBeParsed(this.localExpressionVariable);
    },
    checkNotNull() {
      return this.localExpressionVariable !== "" && this.localExpressionVariable !== undefined;
    },
    onExpressionVariableChange() {
      this.localExpressionVariable = clone(this.expressionVariable);
    },
    /**
     * if there is an Error in the Expression Field the status gets emited to disable next button
     * @param allOk status of check
     */
    changeErrorHandling(allOk: boolean) {
      this.$emit("changeDisable", { val: !allOk });
    },
  },
});
</script>

<style>
.popper {
  padding-left: 30px;
}
</style>
