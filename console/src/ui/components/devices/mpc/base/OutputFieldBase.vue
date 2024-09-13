<template>
  <div>
    {{ localisation }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent OutputFieldBase component
 */
export default defineComponent({
  props: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    isDecimal: { default: false, type: Boolean },
    actualValueState: Object as PropType<any>,
  },
  computed: {
    actualValue(): any {
      return this.actualValueState;
    },
    /**
     * Round actualValue
     */
    mod() {
      if (!this.isDecimal) return Math.round(this.actualValue);
      return +`${Math.round(+`${this.actualValue}e+3`)}e-3`;
    },
    /**
     * Leave a maximum of two characters after comma
     */
    filtered(): any {
      return Number.isInteger(this.mod) ? this.mod : this.mod.toFixed(2);
    },
    localisation() {
      const filteredByMinMax = () => {
        if (this.min && this.min > +this.filtered) return this.min;
        if (this.max && this.max < +this.filtered) return this.max;
        return this.filtered;
      };
      return Intl.NumberFormat("de-GE").format(filteredByMinMax());
    },
  },
});
</script>
