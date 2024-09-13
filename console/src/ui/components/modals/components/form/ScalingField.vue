<template>
  <div class="scaling-field">
    <CoreSelect
      v-model="scalingType"
      :items="scalingTypes"
      :label="$t('uiComponents.scalingField.label')"
      hide-selected
      item-title="title"
      item-value="id"
      @update:model-value="handleScalingType"
    />
    <div class="d-flex">
      <CoreTextField
        v-model.number="scalingData.min"
        :label="$t('uiComponents.scalingField.min')"
      />
      <CoreTextField
        v-model.number="scalingData.max"
        :label="$t('uiComponents.scalingField.max')"
        class="ml-2"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Scaling field component which used in manage modal forms
 */
export default defineComponent({
  props: {
    modelValue: Object as PropType<any>,
  },
  data() {
    return {
      scalingType: "manual",
    };
  },
  computed: {
    scalingTypes() {
      return [
        { title: this.$t("uiComponents.scalingField.scalingMethods.manual"), id: "manual" },
        { title: this.$t("uiComponents.scalingField.scalingMethods.auto"), id: "auto" },
      ];
    },
    scalingData: {
      get(): any {
        return this.modelValue;
      },
      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  mounted() {
    if (this.scalingData.min === null && this.scalingData.max === null) {
      this.scalingType = "auto";
    }
  },
  methods: {
    handleScalingType() {
      if (this.scalingType === "auto") {
        this.scalingData.min = null;
        this.scalingData.max = null;
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
