<template>
  <CoreTextField
    ref="customField"
    :label="label"
    :maxlength="maxLength"
    :rules="[customRules]"
    :model-value="modelValue"
    class="custom-text-field"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

/**
 * Text field component which used in manage modal forms
 */
export default defineComponent({
  props: {
    modelValue: [Object, String],
    label: { default: null, type: String },
    optional: { default: true, type: Boolean },
    maxLength: [Object, Number, String],
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
    ((this.customField as any).coreTextField as any).validate(true);
  },
});
</script>

<style lang="scss">
.custom-text-field {
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
