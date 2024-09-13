<template>
  <CoreForm
    ref="form"
    v-model="valid"
    class="input-field-external-base-form"
    lazy-validation
    hide-details="auto"
    @submit.prevent
  >
    <CoreRow
      :class="[
        'input-field-external-base',
        { 'd-flex justify-space-between': !isOnlyInputFieldShown },
      ]"
    >
      <CoreColumn
        v-if="isDescriptionShown"
        :style="{ ...descriptionStyles }"
        class="input-field-external-base__description"
        cols="12"
        md="5"
      >
        <slot name="textDescription" />
      </CoreColumn>

      <CoreColumn
        :style="{ ...inputFieldStyles }"
        class="input-field-external-base__field"
        cols="10"
        md="3"
      >
        <CoreTextField
          :bg-color="fieldBackground"
          :disabled="disabled"
          :max="max"
          :min="min"
          :rules="[...fieldRules]"
          :step="step"
          :model-value="modelValue"
          flat
          type="number"
          hide-details="auto"
          @keypress="handleKeypress"
          @update:model-value="$emit('update:model-value', $event)"
        />
      </CoreColumn>

      <CoreColumn
        v-if="isUnitShown"
        :style="{ ...unitStyles }"
        class="input-field-external-base__unit"
        cols="2"
      >
        <slot name="unit" />
      </CoreColumn>

      <CoreColumn
        v-if="isIconShown && $slots.icon"
        :style="{ ...iconStyles }"
        class="input-field-external-base__icon"
        cols="2"
      >
        <slot name="icon" />
      </CoreColumn>
    </CoreRow>
  </CoreForm>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

/**
 * Component that represent custom input field number type.
 * Highlight error border if value not valid.
 * Example how to use:
 * <InputFieldExternal
 *   v-model="form_field"
 *   :step="0.1"
 * >
 */
export default defineComponent({
  props: {
    modelValue: [String, Number],
    isDecimal: { default: false, type: Boolean },
    disabled: { default: false, type: Boolean },
    step: { default: 0.01, type: Number },
    min: { default: 0, type: Number },
    max: { default: 100, type: Number },
    fieldRules: { default: () => [], type: Array as PropType<any[]> },
    fieldBackground: { default: "#fff", type: String },
    height: { default: 36, type: [String, Number] },
    descriptionStyles: {
      default: () => {},
      type: Object as PropType<any>,
    },
    inputFieldStyles: {
      default: () => {},
      type: Object as PropType<any>,
    },
    unitStyles: {
      default: () => {},
      type: Object as PropType<any>,
    },
    iconStyles: {
      default: () => {},
      type: Object as PropType<any>,
    },
    isDescriptionShown: { default: true, type: Boolean },
    isUnitShown: { default: true, type: Boolean },
    isIconShown: { default: true, type: Boolean },
  },
  emits: ["update:model-value"],
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const state: any = 24;

    return {
      state,
      valid: true,
    };
  },
  computed: {
    actualValue(): any {
      return 22;
    },
    isOnlyInputFieldShown() {
      return !this.isIconShown && !this.isDescriptionShown && !this.isUnitShown;
    },
  },
  watch: {
    actualValue: [
      {
        handler: "onActualValueChange",
      },
    ],
  },
  mounted() {
    ((this.form as any).coreForm as any).validate();
    this.state = this.actualValue;
  },
  methods: {
    validate() {
      ((this.form as any).coreForm as any).validate();
      this.handleState();
    },
    /**
     * Blocks invalid keys
     * @param {object} e event object
     */
    handleKeypress(e: any) {
      const isDecimalSymbol = /[0-9]|,/.test(e.key);
      const isInteger = /[0-9]/.test(e.key);
      if (this.isDecimal && !isDecimalSymbol) e.preventDefault();
      if (!this.isDecimal && !isInteger) e.preventDefault();
    },
    handleState() {
      if (!this.valid) return null;
    },
    onActualValueChange(val: any) {
      if (typeof val === "number") this.state = val.toFixed(2);
    },
  },
});
</script>

<style lang="scss">
.input-field-external-base-form {
  .input-field-external-base {
    &__description {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    &__field {
    }

    &__unit {
      text-align: center;
    }

    &__icon {
    }

    .v-input {
      .v-input__control {
        .v-input__slot {
          min-height: 0 !important;
          margin-bottom: 0 !important;

          .v-text-field__slot {
            input {
              color: #525252;
            }
          }
        }

        .v-text-field__details {
          margin-bottom: 0 !important;
        }
      }
    }
  }
}
</style>
