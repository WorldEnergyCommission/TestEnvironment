<template>
  <FormModal
    form-title="uiComponents.manageChartsExtraButtons.showAggOptions"
    max-width="800"
    default-height
  >
    <template #activator>
      <!-- Item is shown in the ManageChartsCalculation.vue -->
      <CoreButton button-type="primary">
        <template #icon>
          <CoreIcon color="theme" size="18"> fas fa-info </CoreIcon>
        </template>
        {{ $t("uiComponents.manageChartsExtraButtons.showAggOptions") }}
      </CoreButton>
    </template>
    <!-- Rest of DialogWindow -->
    <template #content>
      <div class="calc-overView-body">
        <div v-for="(item, index) in calculationVariables" :key="index">
          <div class="py-2">
            {{ item }}
          </div>
          <CoreSelect
            v-model="currentElements[index]"
            :items="availableAggregationMethods"
            :label="$t('modals.manageCharts.form.aggregation')"
            hide-selected
            item-title="state"
            item-value="abbr"
            @update:model-value="emitAggChange"
          />
        </div>
      </div>
    </template>
  </FormModal>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import { defineComponent, PropType } from "vue";

import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that manage calculation, aggregation
 */
export default defineComponent({
  components: {
    FormModal,
  },
  props: {
    isOverviewCentered: { default: false, type: Boolean },
    calculationVariables: {
      type: Array as PropType<string[]>,
    },
    aggregationOptions: {
      type: Array as PropType<string[]>,
    },
    availableAggregationMethods: {
      type: Array as PropType<any[]>,
    },
  },
  data() {
    return {
      dialog: false,
      switchVariableName: false,
    };
  },
  computed: {
    currentElements() {
      return cloneDeep(this.aggregationOptions);
    },
  },
  methods: {
    /**
     * Emits changes of Aggregation Options
     */
    emitAggChange() {
      this.$emit("aggArrayChange", this.currentElements);
    },
  },
});
</script>

<style lang="scss">
.calc-overView {
  background: rgba(0, 0, 0, 0) !important;
  overflow: hidden;

  .calc-overView-header {
    font-size: 30px;
    color: rgb(var(--v-theme-accentLight));
    height: 40px;
    line-height: 1;
    display: flex;
    justify-content: space-between;
  }

  .calc-overView-body {
    padding: 20px;
    background: rgb(var(--v-theme-surface));
    border-radius: 10px !important;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 600px;
    color: rgb(var(--v-theme-lynusText));

    .header {
      font-size: 15px;
    }

    .calculation {
      padding-bottom: 10px;
      text-align: center;
    }
  }
}

.math-symbol {
  color: rgb(var(--v-theme-accent));
}
</style>
