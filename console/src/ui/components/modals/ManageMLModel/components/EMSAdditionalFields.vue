<template>
  <div>
    <InputFieldNumber
      v-model.number="targetObject.scaling.pv"
      :field-rules="[rules.fieldMoreThanNull, rules.twoComas]"
      :is-decimal="true"
      :label="$t('mlModel.EMS.scalingPV')"
      :max="10000"
      :min="0"
      :step="1"
    />
    <InputFieldNumber
      v-model.number="targetObject.scaling.consumption"
      :field-rules="[rules.fieldMoreThanNull, rules.twoComas]"
      :is-decimal="true"
      :label="$t('mlModel.EMS.scalingConsumption')"
      :max="10000"
      :min="0"
      :step="1"
    />
    <InputFieldNumber
      v-model.number="targetObject.scaling.batteryPower"
      :field-rules="[rules.fieldMoreThanNull, rules.twoComas]"
      :is-decimal="true"
      :label="$t('mlModel.EMS.scalingBatteryPower')"
      :max="10000"
      :min="0"
      :step="1"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import InputFieldNumber from "@/ui/components/modals/components/InputFieldNumber.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * EMS additional field component.
 * Manges targetObject scaling properties.
 */
export default defineComponent({
  components: {
    InputFieldNumber,
  },
  mixins: [Validation],
  props: {
    modelValue: Object as PropType<any>,
  },
  computed: {
    targetObject: {
      get(): any {
        return this.modelValue;
      },
      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
  },
});
</script>

<style lang="scss" scoped></style>
