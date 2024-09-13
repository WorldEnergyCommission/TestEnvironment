<template>
  <CoreCard class="rounded pa-3">
    <CoreRow style="width: 100%">
      <!-- Title -->
      <CoreColumn cols="12">
        <h3>{{ title }}</h3>
      </CoreColumn>
      <!-- Bakeing Window Duration -->
      <CoreColumn cols="6">
        <CoreTextField
          v-model="bakingWindowDuration"
          type="number"
          :label="labelBakingWindowDuration"
        />
      </CoreColumn>
      <CoreColumn>
        <CoreButton button-type="primary" @click="saveSettings()">
          {{ t("uiComponents.buttons.save") }}
        </CoreButton>
      </CoreColumn>
    </CoreRow>
  </CoreCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";

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
const bakingWindowDuration = ref<number | null>(null);

// Translations
const title = t("mlModel.LoadMonitor.settingsView.title");
const labelBakingWindowDuration = t("mlModel.LoadMonitor.settingsView.bakingWindowDuration");

// Functions
async function saveSettings() {
  await store.dispatch("mpc/updateLoadMonitorSettings", {
    mpcId: props.deviceData.id,
    settings: {
      bakingWindowDuration: bakingWindowDuration.value,
    },
  });

  emit("updated");
}

function getSetting() {
  bakingWindowDuration.value = props.deviceData.data.meta.settings.bakingWindowDuration ?? 120;
}

onMounted(getSetting);
</script>

<style scoped lang="scss">
.settings {
  min-height: 65dvh;
  background: rgb(var(--v-theme-deviceBackground));
}
</style>
