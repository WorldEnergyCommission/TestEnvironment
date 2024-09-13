<template>
  <CoreCombobox
    ref="customField"
    :disabled="disabled"
    :items="items"
    :label="label"
    :rules="[customRules]"
    :model-value="modelValue"
    class="custom-combobox-field"
    hide-selected
    :hide-details="hideDetails"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

/**
 * Combobox field component which used in manage modal forms
 */
export default defineComponent({
  props: {
    modelValue: [Object, String],
    items: Object as PropType<any>,
    label: { default: null, type: String },
    optional: { default: true, type: Boolean },
    disabled: Boolean,
    hideDetails: { default: "auto", type: [String, Boolean] },
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
    ((this.customField as any).coreCombobox as any).validate(true);
  },
});
</script>

<style lang="scss">
.custom-combobox-field {
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
