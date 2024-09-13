<template>
  <CoreSelect
    ref="customField"
    :item-title="itemText"
    :item-value="itemValue"
    :items="items"
    :label="label"
    :rules="[customRules]"
    :model-value="modelValue"
    class="custom-select-field"
    hide-selected
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

/**
 * Select field component which used in manage modal forms
 */
export default defineComponent({
  props: {
    modelValue: Object as PropType<any>,
    items: Object as PropType<any>,
    itemValue: { default: null, type: String },
    itemText: { default: null, type: String },
    label: { default: null, type: String },
    optional: { default: true, type: Boolean },
  },
  setup() {
    const customField = ref(null);
    return {
      customField,
    };
  },
  computed: {
    customRules() {
      if (!this.optional)
        return (value: number) => value === 0 || !!value || this.$t("validationRules.required");
      else return true;
    },
  },
  mounted() {
    ((this.customField as any).coreSelect as any).validate(true);
  },
});
</script>

<style lang="scss">
.custom-select-field {
  position: relative;

  .v-input__control {
    .v-input__slot {
      margin: 0 !important;
    }

    .v-text-field__details {
      margin: 0 !important;
      padding: 0 !important;
    }
  }
}
</style>
