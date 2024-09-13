<template>
  <div class="cooling-air-controls">
    <SystemsInstanceControlsTemplate>
      <template #left-side>
        <div class="d-flex">
          <div class="flex-grow-1">
            <!-- Max Flow Temperature -->
            <InputFieldExternal
              v-model="settings.max_flow_temperature"
              :min="0"
              :max="100"
              :height="24"
              :step="0.01"
              :is-decimal="true"
              :field-rules="[rules.required]"
              :unit-styles="{ width: '50px' }"
              :description-styles="{ flexGrow: '1' }"
              :input-field-styles="{ width: '100px' }"
            >
              <template #textDescription>
                {{ labelMaxFlowTemperature }}
              </template>
              <template #unit> °C </template>
            </InputFieldExternal>
            <!-- Min Flow Temperature -->
            <InputFieldExternal
              v-model="settings.min_flow_temperature"
              :min="0"
              :max="100"
              :step="0.01"
              :height="24"
              :is-decimal="true"
              :field-rules="[rules.required]"
              :unit-styles="{ width: '50px' }"
              :description-styles="{ flexGrow: '1' }"
              :input-field-styles="{ width: '100px' }"
            >
              <template #textDescription>
                {{ labelMinFlowTemperature }}
              </template>
              <template #unit> °C </template>
            </InputFieldExternal>
            <!-- Room Set Temperature -->
            <InputFieldExternal
              v-model="settings.set_point_temperature"
              :min="0"
              :max="100"
              :height="24"
              :step="0.01"
              :is-decimal="true"
              :field-rules="[rules.required]"
              :unit-styles="{ width: '50px' }"
              :description-styles="{ flexGrow: '1' }"
              :input-field-styles="{ width: '100px' }"
            >
              <template #textDescription>
                {{ labelSetPointTemperature }}
              </template>
              <template #unit> °C </template>
            </InputFieldExternal>
            <!-- Advanced Heating Curve Settings -->
            <CurveSettings
              v-model:x_range="settings.x_range"
              v-model:diff="settings.y1_y2_diff"
              v-model:y2_y_range="settings.y2_y_range"
              v-model:y1_y_range="settings.y1_y_range"
              v-model:advanced_curve_settings="settings.advanced_curve_settings"
            />
            <div v-if="$vuetify.display.mobile" class="d-flex justify-center my-6 w-100">
              <CoreButton button-type="secondary" @click="handleTemperatureSettings">
                {{ t("uiComponents.buttons.send") }}
              </CoreButton>
            </div>
          </div>
          <div v-if="!$vuetify.display.mobile" class="d-flex align-center">
            <CoreButton
              class="mb-6"
              size="small"
              button-type="secondary"
              @click="handleTemperatureSettings"
            >
              {{ t("uiComponents.buttons.send") }}
            </CoreButton>
          </div>
        </div>
        <!-- Current Flow Temperature -->
        <LabelUnitWrapper
          class="pt-4"
          :is-default-view="false"
          :variables-list-for-check="[controls.flow_temperature]"
        >
          <template #label>
            {{ labelFlowTemperature }}
          </template>
          <template #value>
            <OutputFieldBase
              instance="OutputField"
              :max="1000"
              :min="-1000"
              :is-decimal="true"
              :is-preview="isPreview"
              :variable-data="outputFieldFlowTemperature"
            />
            <span class="pl-2">°C</span>
          </template>
        </LabelUnitWrapper>
        <!-- Current Return Temperature -->
        <LabelUnitWrapper
          class="pt-4"
          :is-default-view="false"
          :variables-list-for-check="[controls.return_temperature]"
        >
          <template #label>
            {{ labelReturnTemperature }}
          </template>
          <template #value>
            <OutputFieldBase
              instance="OutputField"
              :max="1000"
              :min="-1000"
              :is-decimal="true"
              :is-preview="isPreview"
              :variable-data="outputFieldReturnTemperature"
            />
            <span class="pl-2">°C</span>
          </template>
        </LabelUnitWrapper>
        <!-- Out In Flow Temperature -->
        <LabelUnitWrapper
          class="pt-4"
          :is-default-view="false"
          :variables-list-for-check="[controls.out_in_flow_temperature]"
        >
          <template #label>
            {{ labelOutInFlowTemperature }}
          </template>
          <template #value>
            <OutputFieldBase
              instance="OutputField"
              :max="1000"
              :min="-1000"
              :is-decimal="true"
              :is-preview="isPreview"
              :variable-data="outputFieldOutToInFlowTemperature"
            />
            <span class="pl-2">°C</span>
          </template>
        </LabelUnitWrapper>
        <!-- In Out Flow Temperature -->
        <LabelUnitWrapper
          class="pt-4"
          :is-default-view="false"
          :variables-list-for-check="[controls.in_out_flow_temperature]"
        >
          <template #label>
            {{ labelInOutFlowTemperature }}
          </template>
          <template #value>
            <OutputFieldBase
              instance="OutputField"
              :max="1000"
              :min="-1000"
              :is-decimal="true"
              :is-preview="isPreview"
              :variable-data="outputFieldInToOutReturnTemperature"
            />
            <span class="pl-2">°C</span>
          </template>
        </LabelUnitWrapper>
        <!-- On/Off Status -->
        <LabelUnitWrapper
          class="pt-4"
          :is-default-view="false"
          :variables-list-for-check="[controls.status]"
        >
          <template #label>
            {{ labelStatus }}
          </template>
          <template #value>
            <ShowEventDotBase
              width="15"
              height="15"
              instance="ShowEventDot"
              :is-preview="isPreview"
              :items="[[1, colors.blue]]"
              :variable-data="showEventDotStatus"
            />
          </template>
        </LabelUnitWrapper>
        <!-- New/Optimized Supply Temperature -->
        <LabelUnitWrapper
          class="pt-4"
          :is-default-view="false"
          :variables-list-for-check="[controls.return_temperature]"
        >
          <template #label>
            {{ labelOptimizedSupplyTemperature }}
          </template>
          <template #value>
            <OutputFieldBase
              instance="OutputField"
              :max="1000"
              :min="-1000"
              :is-decimal="true"
              :is-preview="isPreview"
              :variable-data="outputFieldOptimizedFlowTemperature"
            />
            <span class="pl-2">°C</span>
          </template>
        </LabelUnitWrapper>
      </template>
      <!-- Room Temperatures -->
      <template #right-side>
        <div class="text-center">
          {{ labelRoomTemperatures }}
        </div>
        <div v-for="(item, index) in roomTemperatures" :key="index">
          <LabelUnitWrapper
            class="pt-4"
            :is-default-view="true"
            :variables-list-for-check="[]"
            :label-hide-text-that-does-not-fit="true"
          >
            <template #label>
              {{
                controls.room_temperatures[item].title || controls.room_temperatures[item].variable
              }}
            </template>
            <template #value>
              <OutputFieldBase
                instance="OutputField"
                :max="1000"
                :min="-1000"
                :is-decimal="true"
                :is-preview="isPreview"
                :variable-data="{
                  OutputField_actualValue: controls.room_temperatures[item].variable,
                }"
              />
              <span class="pl-2">°C</span>
            </template>
          </LabelUnitWrapper>
        </div>
      </template>
    </SystemsInstanceControlsTemplate>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { SystemsInstanceControls } from "./SystemsInstanceControlsTypes";
import InputFieldExternal from "@/ui/components/devices/components/InputFields/InputFieldExternal.vue";
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import CurveSettings from "@/ui/components/devices/mpc/SetpointOptimizer/system/components/CurveSettings.vue";
import SystemsInstanceControlsTemplate from "@/ui/components/devices/mpc/SetpointOptimizer/system/SystemInstanceControls/SystemsInstanceControlsTemplate.vue";
import { useValidationRules } from "@/ui/mixins/validation";

// Properties
interface Props {
  controls: SystemsInstanceControls;
  mpcId: string;
  systemInstanceId: string | null;
  isPreview: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  systemInstanceId: null,
  isPreview: false,
});

// Emits
const emit = defineEmits<{
  (e: "handleUpdateMPC"): void;
}>();

// Constants
const { t } = useI18n();
const store = useStore();
const rules = useValidationRules();
const colors = {
  red: "#fc0202",
  blue: "#003cff",
  green: "#29810e",
  yellow: "#f3db04",
};
const settings = ref({
  identifier: "",
  max_flow_temperature: 0,
  min_flow_temperature: 0,
  set_point_temperature: 0,
  y1_y_range: { upper: 120, lower: 25 },
  y2_y_range: { upper: 65, lower: 20 },
  x_range: { left: -15, right: 15 },
  y1_y2_diff: -5,
  advanced_curve_settings: false,
});

// Translations
const labelMaxFlowTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.max_flow_temperature.label",
);

const labelMinFlowTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.min_flow_temperature.label",
);

const labelSetPointTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.set_point_temperature.label",
);

const labelFlowTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.flow_temperature.label",
);

const labelReturnTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.return_temperature.label",
);

const labelOutInFlowTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.out_in_flow_temperature.label",
);

const labelInOutFlowTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.in_out_flow_temperature.label",
);

const labelStatus = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.status.label",
);

const labelRoomTemperatures = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.room_temperatures.label",
);

const labelOptimizedSupplyTemperature = t(
  "mlModel.SetpointOptimizer.systems.cooling_air_systems.mappings.optimized_supply_temperature.label",
);

// Computed Properties
const roomTemperatures = computed(() => {
  return Object.keys(props.controls.room_temperatures);
});

const outputFieldFlowTemperature = computed(() => {
  return { OutputField_actualValue: props.controls.flow_temperature };
});

const outputFieldReturnTemperature = computed(() => {
  return { OutputField_actualValue: props.controls.return_temperature };
});

const outputFieldOutToInFlowTemperature = computed(() => {
  return {
    OutputField_actualValue: props.controls.out_in_flow_temperature,
  };
});

const outputFieldInToOutReturnTemperature = computed(() => {
  return {
    OutputField_actualValue: props.controls.in_out_flow_temperature,
  };
});

const showEventDotStatus = computed(() => {
  return { ShowEventDot_errorWarningState: props.controls.status };
});

const outputFieldOptimizedFlowTemperature = computed(() => {
  return { OutputField_actualValue: props.controls.optimized_flow_temperature };
});

// Functions
function initTemperatureSettings() {
  const copy: any = JSON.parse(JSON.stringify(props.controls));
  settings.value.identifier = props.systemInstanceId!;
  settings.value.max_flow_temperature = copy?.max_flow_temperature;
  settings.value.min_flow_temperature = copy?.min_flow_temperature;
  settings.value.set_point_temperature = copy?.set_point_temperature;
  settings.value.y1_y_range = copy?.y1_y_range;
  settings.value.y2_y_range = copy?.y2_y_range;
  settings.value.x_range = copy?.x_range;
  settings.value.y1_y2_diff = copy?.y1_y2_diff;
  settings.value.advanced_curve_settings = copy?.advanced_curve_settings;
}

async function handleTemperatureSettings() {
  await store.dispatch("mpc/updateSetpointSystemInstanceTemperatureSettings", {
    mpc_id: props.mpcId,
    settings: settings.value,
  });

  emit("handleUpdateMPC");
}

// Lifecycle Hooks
onMounted(() => {
  initTemperatureSettings();
});
</script>
