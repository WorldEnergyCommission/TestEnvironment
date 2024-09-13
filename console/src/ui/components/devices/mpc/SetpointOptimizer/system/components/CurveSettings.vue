<template>
  <CoreSwitch v-model="advanced_curve_settings" :label="switchLabel" />
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="y1_y_range.upper"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="150"
    :min="0"
    :step="1"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1y_upper.title") }}
          </span>
        </template>
        {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1y_upper.description") }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="y1_y_range.lower"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="50"
    :min="0"
    :step="1"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1y_lower.title") }}
          </span>
        </template>
        {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1y_lower.description") }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="y2_y_range.upper"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="100"
    :min="0"
    :step="1"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y2y_upper.title") }}
          </span>
        </template>
        {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y2y_upper.description") }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="y2_y_range.lower"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="50"
    :min="0"
    :step="1"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y2y_lower.title") }}
          </span>
        </template>
        {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y2y_lower.description") }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="x_range.left"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="0"
    :min="-30"
    :step="0"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1x.title") }}
          </span>
        </template>
        {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1x.description") }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="x_range.right"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="50"
    :min="0"
    :step="1"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y2x.title") }}
          </span>
        </template>
        {{ $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y2x.description") }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
  <InputFieldExternal
    v-if="advanced_curve_settings"
    v-model="diff"
    :description-styles="{ flexGrow: '1' }"
    :height="24"
    :input-field-styles="{ width: '100px' }"
    :is-decimal="true"
    :max="30"
    :min="-30"
    :step="1"
    :unit-styles="{ width: '50px' }"
  >
    <template #textDescription>
      <CoreTooltip location="top">
        <template #activator="{ props }">
          <span>
            {{
              $t("mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1_y2_difference.title")
            }}
          </span>
        </template>
        {{
          $t(
            "mlModel.SetpointOptimizer.heating_curve_settings.mapping.y1_y2_difference.description",
          )
        }}
      </CoreTooltip>
    </template>
    <template #unit> °C </template>
  </InputFieldExternal>
</template>

<script setup lang="ts">
import { defineModel } from "vue";
import { useI18n } from "vue-i18n";

import InputFieldExternal from "@/ui/components/devices/components/InputFields/InputFieldExternal.vue";

// Constants
const { t } = useI18n();
const switchLabel = t(
  "mlModel.SetpointOptimizer.heating_curve_settings.mapping.advanced_curve_settings.title",
);

// Models
const y1_y_range = defineModel("y1_y_range", {
  default: { upper: 60, lower: 25 },
});
const y2_y_range = defineModel("y2_y_range", {
  default: { upper: 60, lower: 25 },
});
const x_range = defineModel("x_range", {
  default: { left: -15, right: 15 },
});
const diff = defineModel("diff", {
  default: -5,
});
// This model shows the other models on true and hides on false
const advanced_curve_settings = defineModel("advanced_curve_settings", {
  default: false,
});
</script>
