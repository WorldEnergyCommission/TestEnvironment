<template>
  <EfficientIODialog
    v-model="modalOpen"
    :dialog-title="$t('uiComponents.settings.operating_hours.addHoliday')"
  >
    <template #activator="{ props }">
      <CoreButton variant="tonal" color="accent" v-bind="props" icon="fa-plus">
        <CoreIcon icon="fa-plus fa-solid" />
      </CoreButton>
    </template>
    <template #content>
      <CoreRow>
        <CoreColumn cols="12">
          <CoreTextField
            v-model="name"
            variant="outlined"
            hide-details
            :label="$t('uiComponents.settings.operating_hours.newHolidayTitle')"
          />
        </CoreColumn>
      </CoreRow>
      <CoreRow>
        <CoreColumn cols="12" class="d-flex align-center justify-center">
          <v-date-picker v-model="day">
            <template #title />
          </v-date-picker>
        </CoreColumn>
      </CoreRow>
      <CoreRow>
        <CoreColumn cols="12" class="d-flex align-end">
          <CoreButton
            color="accent"
            class="ml-auto"
            elevation="0"
            variant="tonal"
            @click="modalOpen = false"
          >
            {{ $t("uiComponents.buttons.cancel") }}
          </CoreButton>
          <CoreButton
            color="accent"
            class="ml-3"
            type="submit"
            variant="outlined"
            @click="submitHoliday"
          >
            {{ $t("uiComponents.buttons.submit") }}
            <CoreIcon class="pl-2" size="15"> far fa-paper-plane </CoreIcon>
          </CoreButton>
        </CoreColumn>
      </CoreRow>
    </template>
  </EfficientIODialog>
</template>
<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { ref } from "vue";

import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

const modalOpen = ref(false);
const day = ref(null);
const name = ref("");

const emit = defineEmits(["submit"]);

function submitHoliday() {
  emit("submit", { name: name.value, date: day.value });
  modalOpen.value = false;
  // reset state
  day.value = null;
  name.value = "";
}
</script>
