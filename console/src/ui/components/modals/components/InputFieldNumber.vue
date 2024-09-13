<template>
  <CoreTextField
    ref="customField"
    :disabled="disabled"
    :density="small ? 'compact' : 'default'"
    :label="label"
    :max="max"
    :min="min"
    :rules="[...fieldRules]"
    :step="step"
    :model-value="modelValue"
    class="input-field-number"
    type="number"
    @keypress="handleKeypress"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

/**
 * Form field which used in manage modals forms
 */
export default defineComponent({
  props: {
    modelValue: [Number, String],
    isDecimal: {
      type: Boolean,
    },
    disabled: { default: false, type: Boolean },
    step: { default: 0.01, type: Number },
    min: { default: 0, type: Number },
    max: { default: 100, type: Number },
    fieldRules: { default: () => [], type: Array as PropType<any[]> },
    small: { default: false, type: Boolean },
    label: { default: null, type: String },
  },
  setup() {
    const customField = ref(null);
    return {
      customField,
    };
  },
  data() {
    const state: any = 24;

    return {
      state,
    };
  },
  mounted() {
    ((this.customField as any).coreTextField as any).validate(true);
  },
  methods: {
    handleKeypress(e: any) {
      const isDecimalSymbol = /[0-9]|,/.test(e.key);
      const isInteger = /[0-9]/.test(e.key);
      if (this.isDecimal) {
        if (!isDecimalSymbol) e.preventDefault();
      }
      if (!this.isDecimal) {
        if (!isInteger) e.preventDefault();
      }
    },
  },
});
</script>

<style lang="scss">
.input-field-number {
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

.input-field-number .v-input__slot {
  min-height: 40px !important;
}
</style>
