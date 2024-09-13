<template>
  <CoreRow no-gutters>
    <CoreColumn class="device-title pt-2" cols="12" md="6">
      {{ propTitle }}
    </CoreColumn>
    <CoreColumn cols="12" md="6">
      <InputFieldNumber
        v-model="modelValue"
        :field-rules="fieldRules"
        :is-decimal="true"
        :max="max"
        :min="min"
        :small="true"
        :step="1"
      />
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts" setup>
import { defineModel, withDefaults, computed } from "vue";

import InputFieldNumber from "../../components/InputFieldNumber.vue";
import { useValidationRules } from "@/ui/mixins/validation";

const rules = useValidationRules();

const fieldRules = computed(() => {
  const r = [rules.fieldMoreThanNull, rules.required];
  if (props.max === 1) {
    r.push((value: number) => value <= 1 || "Max 1");
  }

  r.push(rules.fieldLessThan(props.max));
  return r;
});

export interface EnergyInputRowProps {
  propTitle: string;
  min: number;
  max: number;
}
const props = withDefaults(defineProps<EnergyInputRowProps>(), {
  propTitle: "",
  min: 0,
  max: 0,
});

const modelValue = defineModel<string | number>();
</script>

<style lang="scss" scoped></style>
