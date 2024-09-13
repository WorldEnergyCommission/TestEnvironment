<template>
  <div>
    <CoreCombobox
      v-model="localItemOptions.var"
      :items="measurementsKeys"
      :label="$t('modals.manageCharts.form.variable')"
      class="pt-7"
      hide-selected
      @change="onItemOptionsChange"
    />
    <CoreSelect
      v-model="localItemOptions.type"
      :items="chartTypes"
      :label="$t('modals.manageCharts.form.type')"
      hide-selected
      item-title="text"
      item-value="value"
      @update:model-value="onItemOptionsChange"
    />
    <CoreSelect
      v-model="localItemOptions.agg"
      :items="aggregationMethods"
      :label="$t('modals.manageCharts.form.aggregation')"
      hide-selected
      item-title="state"
      item-value="abbr"
      @update:model-value="onItemOptionsChange"
    />
    <CoreSelect
      v-model="localItemOptions.miss"
      :items="missingValueStrategies"
      :label="$t('modals.manageCharts.form.missingValueStrategy')"
      hide-selected
      item-title="state"
      item-value="abbr"
      @update:model-value="onItemOptionsChange"
    />
    <CoreTextField
      v-model="localItemOptions.unit"
      :label="$t('modals.manageCharts.form.unit')"
      autocomplete="off"
      max-length="4"
      @update:model-value="onItemOptionsChange"
    />
    <CoreTextField
      v-model="localItemOptions.name"
      :label="$t('modals.manageCharts.form.displayName')"
      autocomplete="off"
      max-length="30"
      @update:model-value="onItemOptionsChange"
    />
    <div class="d-flex">
      <CoreTextField
        v-model="localItemOptions.scaling.min"
        :label="$t('modals.manageCharts.form.min')"
        autocomplete="off"
        hide-details
        style="padding-right: 4px"
        type="number"
        @update:model-value="onItemOptionsChange"
      />
      <CoreTextField
        v-model="localItemOptions.scaling.max"
        :label="$t('modals.manageCharts.form.max')"
        autocomplete="off"
        hide-details
        style="padding-left: 4px"
        type="number"
        @update:model-value="onItemOptionsChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import { defineComponent, PropType } from "vue";

/**
 * Component that contains manage charts form
 */
export default defineComponent({
  data() {
    const localItemOptions: any = undefined;

    return {
      /** clone of prop itemOptions */
      localItemOptions,
    };
  },
  created() {
    // clone props, to not directly mutate properties using v-model="..."
    this.itemOptionsUpdated();

    if (this.localItemOptions.var === undefined || this.localItemOptions.var === "") {
      this.$emit("changeDisable", { val: true }, this.index);
    }
  },
  methods: {
    /** should be called when anything in this.localItemOptions changes */
    onItemOptionsChange() {
      this.updateScalings();
      this.$emit("itemOptionsChange", this.name, this.localItemOptions);
    },
    /** replace empty strings with null in the scalings */
    updateScalings() {
      this.localItemOptions.scaling.min = this.localItemOptions.scaling.min || null;
      this.localItemOptions.scaling.max = this.localItemOptions.scaling.max || null;
    },
    itemOptionsUpdated() {
      // update local object
      this.localItemOptions = cloneDeep(this.itemOptions);

      if (this.localItemOptions.var !== "") {
        this.$emit("changeDisable", { val: false }, this.index);
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
  computed: {
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
  },
  watch: {
    itemOptions: [
      {
        handler: "itemOptionsUpdated",
      },
    ],
  },
});
</script>

<style></style>
