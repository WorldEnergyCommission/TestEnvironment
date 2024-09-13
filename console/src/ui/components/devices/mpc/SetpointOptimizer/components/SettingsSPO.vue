<template>
  <div class="settings-spo pa-3 rounded">
    <CoreRow class="w-100">
      <!-- Title -->
      <CoreColumn cols="12">
        <h3>{{ settingsTitle }}</h3>
      </CoreColumn>
      <CoreColumn cols="6">
        <CoreSelect
          v-model="algorithmModel"
          hide-details
          hide-selected
          color="accent"
          item-title="name"
          item-value="value"
          :label="algorithmModelLabel"
          :items="spoSettingsModelItems"
        />
      </CoreColumn>
      <CoreColumn cols="6">
        <CoreSelect
          v-model="algorithmAdditionalProcessor"
          hide-details
          hide-selected
          color="accent"
          item-title="name"
          item-value="value"
          :label="algorithmAdditionalProcessorsLabel"
          :items="spoSettingsAdditionalProcessorsItems"
        />
        <small v-if="algorithmAdditionalProcessor === 1">{{ settingsTopTemperatureValue }}</small>
      </CoreColumn>
      <CoreColumn class="d-flex flex-column align-end">
        <CoreDialog max-width="700" v-model="dialogVisible">
          <!-- Button -->
          <template #activator="{ props }">
            <CoreButton class="mt-2" button-type="primary" type="submit" v-bind="props">
              {{ t("uiComponents.buttons.submit") }}
              <template #iconRight>
                <CoreIcon size="15"> far fa-paper-plane </CoreIcon>
              </template>
            </CoreButton>
          </template>
          <!-- Content -->
          <CoreCard class="dialog">
            <!-- Title -->
            <CoreRow>
              <CoreColumn class="d-flex justify-center">
                <p class="text-h6">{{ dialogSave }}</p>
              </CoreColumn>
            </CoreRow>
            <CoreRow>
              <CoreColumn class="d-flex justify-center">
                <p>{{ dialogDescription }}</p>
              </CoreColumn>
            </CoreRow>
            <!-- Buttons -->
            <CoreRow>
              <CoreColumn class="d-flex justify-center">
                <CoreButton button-type="secondary" @click="cancelSettings">
                  {{ t("uiComponents.buttons.cancel") }}
                </CoreButton>
              </CoreColumn>
              <CoreColumn class="d-flex justify-center">
                <CoreButton button-type="primary" @click="saveSettings">
                  {{ t("uiComponents.buttons.save") }}
                </CoreButton>
              </CoreColumn>
            </CoreRow>
          </CoreCard>
        </CoreDialog>
      </CoreColumn>
    </CoreRow>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";
import CoreColumn from "@/ui/core/components/column/Column.vue";
import CoreRow from "@/ui/core/components/row/Row.vue";
import CoreSelect from "@/ui/core/components/select/Select.vue";

// Properties
interface Props {
  deviceData: IDevice;
  isPreview: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
});

// Emits
const emit = defineEmits<{
  (e: "updated"): void;
}>();

// Constants
const { t } = useI18n();
const store = useStore();
const algorithmModel = ref<null | number>(null);
const algorithmAdditionalProcessor = ref<null | number>(null);
const dialogVisible = ref(false);

// Translations
const settingsTitle = t("mlModel.SetpointOptimizer.settingsView.title");
const algorithmModelLabel = t(
  "mlModel.SetpointOptimizer.heating_curve_settings.mapping.algorithm_model.title",
);
const algorithmAdditionalProcessorsLabel = t(
  "mlModel.SetpointOptimizer.heating_curve_settings.mapping.algorithm_additional_processors.title",
);
const algorithmModelStandard = t("mlModel.SetpointOptimizer.settingsView.algorithm_model.standard");
const algorithmModelHypermodel = t(
  "mlModel.SetpointOptimizer.settingsView.algorithm_model.hypermodel",
);
const algorithmAdditionalProcessorsStandard = t(
  "mlModel.SetpointOptimizer.settingsView.algorithm_additional_processors.standard",
);
const algorithmAdditionalProcessorsTopTemperatureValue = t(
  "mlModel.SetpointOptimizer.settingsView.algorithm_additional_processors.topTemperatureValue",
);
const dialogSave = t("mlModel.SetpointOptimizer.settingsView.dialog.save");
const dialogDescription = t("mlModel.SetpointOptimizer.settingsView.dialog.description");
const settingsTopTemperatureValue = t(
  "mlModel.SetpointOptimizer.settingsView.dialog.topTemperatureValue",
);

// Computed Properties
const spoSettingsModelItems = computed(() => {
  return [
    { value: 0, name: algorithmModelStandard },
    { value: 1, name: algorithmModelHypermodel },
  ];
});

const spoSettingsAdditionalProcessorsItems = computed(() => {
  return [
    { value: 0, name: algorithmAdditionalProcessorsStandard },
    { value: 1, name: algorithmAdditionalProcessorsTopTemperatureValue },
  ];
});

// Functions
const getCurrentSelectValue = () => {
  algorithmModel.value = props.deviceData.data.meta.controllerMappings.algorithmModel
    ? props.deviceData.data.meta.controllerMappings.algorithmModel
    : 0;
  algorithmAdditionalProcessor.value = props.deviceData.data.meta.controllerMappings
    .algorithmAdditionalProcessors
    ? props.deviceData.data.meta.controllerMappings.algorithmAdditionalProcessors
    : 0;
};

const saveSettings = async () => {
  await store.dispatch("mpc/updateSetpointOptimizerSettings", {
    mpcId: props.deviceData.id,
    settings: {
      algorithmModel: algorithmModel.value,
      algorithmAdditionalProcessors: algorithmAdditionalProcessor.value,
    },
  });

  emit("updated");

  dialogVisible.value = false;
};

const cancelSettings = () => {
  dialogVisible.value = false;
};

// Lifecycle Hooks
onMounted(() => {
  getCurrentSelectValue();
});
</script>

<style lang="scss">
.settings-spo {
  min-height: 50dvh;
  background: rgb(var(--v-theme-deviceBackground));
}

.dialog {
  padding: 3dvh;
  display: flex;
  flex-direction: column;
}
</style>
