<template>
  <CoreForm
    ref="form"
    v-model="valid"
    :class="['input-field-base__description', { 'mb-3': $vuetify.display.mobile }]"
    lazy-validation
    style="width: 100%"
    @submit.prevent
  >
    <CoreRow :class="['input-field-base', { disabled: isVariableNotFilled }]" no-gutters>
      <CoreSpacer v-if="withSpacer" />
      <CoreColumn
        v-if="$slots.textDescription"
        :style="{ ...descriptionStyles }"
        :class="[
          'input-field-base-form',
          { 'mb-2': $vuetify.display.mobile },
          'field_flex_alignment',
        ]"
        md="3"
        cols="10"
        order="1"
        order-md="1"
      >
        <slot name="textDescription" />
      </CoreColumn>
      <CoreColumn
        :style="{ ...inputFieldStyles }"
        class="input-field-base__field field_flex_alignment"
        cols="auto"
        order-md="2"
        order="3"
      >
        <CoreTextField
          v-model.number="state"
          :disabled="isVariableNotFilled"
          :max="max"
          :min="min"
          :rules="[...fieldRules]"
          :step="step"
          flat
          type="number"
          hide-details="auto"
          @keypress="handleKeypress"
          @keyup.enter.stop="handleState"
        />
      </CoreColumn>
      <CoreColumn
        v-if="$slots.unit"
        :md="3"
        :style="{ ...unitStyles }"
        class="input-field-base__unit field_flex_alignment"
        cols="3"
        order-md="3"
        order="4"
      >
        <slot name="unit" />
      </CoreColumn>
      <CoreColumn
        v-if="$slots.icon"
        :md="1"
        :style="{ ...iconStyles }"
        class="input-field-base__icon field_flex_alignment"
        order="2"
        order-md="4"
      >
        <slot name="icon" />
      </CoreColumn>
      <CoreColumn class="input-field-base__button field_flex_alignment" md="3" cols="3" order="5">
        <CoreButton
          :disabled="!valid || isVariableNotFilled"
          :small="small"
          class="ml-2"
          button-type="primary"
          @click="validate"
        >
          <lynus-icon color="theme" name="send" size="20" />
        </CoreButton>
      </CoreColumn>
      <CoreSpacer v-if="withSpacer" />
    </CoreRow>
  </CoreForm>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent InputField Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const timer: any = undefined;
    const state: any = 24;

    return {
      state,
      timer,
      valid: true,
    };
  },
  computed: {
    isVariableNotFilled() {
      if (this.measurementsClean && Object.keys(this.measurementsClean).length != 0)
        return Object.values(this.measurementsClean).some((el: any) => !el.length);
      else return true;
    },
    actualValue(): any {
      const value = this.measurements.get(this.measurementsClean.targetValue) ?? 0;
      return this.roundOnTwoPlaces(value as number);
    },
    inputmd(): number {
      const numberOfSlots = Object.keys(this.$slots).length;
      if (this.inputColums) return this.inputColums;
      if (!numberOfSlots) return 6;
      return numberOfSlots >= 3 ? 3 : this.withSpacer ? 4 : 5;
    },
  },
  mounted() {
    ((this.form as any).coreForm as any).validate();
    this.state = this.actualValue;
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    roundOnTwoPlaces(a: number): number {
      return Math.round(a * 1e2) / 1e2;
    },
    validate() {
      ((this.form as any).coreForm as any).validate();
      this.handleState();
    },
    /**
     * Blocks key which not valid
     * @param e event object
     */
    handleKeypress(e: any) {
      if (this.isDecimal) {
        const isDecimalSymbol = /-|[0-9]|,|./.test(e.key);
        if (!isDecimalSymbol) e.preventDefault();
      } else {
        const isInteger = /-|[0-9]/.test(e.key);
        if (!isInteger) e.preventDefault();
      }
    },
    handleState() {
      if (!this.valid) return;
      this.timer = setTimeout(() => {
        this.send([{ v: +this.state, n: this.measurementsClean.targetValue, u: "" }]);
      }, 200);
    },
    onActualValueChange(val: any) {
      if (typeof val === "number" && !Number.isNaN(val)) this.state = val.toFixed(2);
    },
  },
  props: {
    isDecimal: {
      type: Boolean,
    },
    step: { default: 0.01, type: Number },
    min: { default: 0, type: Number },
    max: { default: 100, type: Number },
    fieldRules: { default: () => [], type: Array<any> },
    small: { default: false, type: Boolean },
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
    withSpacer: { default: true, type: Boolean },
    inputColums: Number,
  },
  watch: {
    actualValue: [
      {
        handler: "onActualValueChange",
      },
    ],
  },
});
</script>

<style lang="scss">
.input-field-base-form {
  .input-field-base {
    display: flex;

    &__description {
    }

    &__field {
    }

    &__unit {
      text-align: center;
    }

    &__icon {
    }

    &__button {
    }

    .v-input {
      .v-input__control {
        .v-input__slot {
          min-height: 0 !important;
          margin-bottom: 0 !important;

          input {
            color: #525252 !important;
          }
        }

        .v-text-field__details {
          margin-bottom: 0 !important;
          overflow: hidden !important;
          height: 10px !important;
          line-height: 10px !important;
          min-height: 0 !important;
          flex: none !important;
          padding: 0 !important;

          .v-messages {
            .v-messages__wrapper {
              .v-messages__message {
                line-height: 10px !important;
              }
            }
          }
        }
      }
    }
  }

  .disabled {
    .input-field-base__description,
    .input-field-base__unit,
    .input-field-base__icon {
      opacity: 0.6;
    }
  }
}

.field_flex_alignment {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
