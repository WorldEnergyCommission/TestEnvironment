<template>
  <div>
    <div class="settings-label mb-4">
      {{ $t("uiComponents.deviceActions.settings") }}
    </div>
    <div>
      <CoreCard v-for="(item, index) in syncedSchedule" :key="index" class="my-3 pa-3">
        <div class="d-flex flex-row justify-space-between align-center">
          <div class="schedule-item-title mr-8">
            {{ $t(`${settingsViewLang}.schedule`) }} #{{ index + 1 }}
          </div>
          <div class="mr-8">
            {{ formattedTime(item.time) }} →

            <span v-if="item.action == 1">
              {{ $t(`${settingsViewLang}.actionOn`) }}
            </span>
            <span v-if="item.action == 0">
              {{ $t(`${settingsViewLang}.actionOff`) }}
            </span>
          </div>

          <div class="flex-grow-1 mr-8" v-html="getActiveDaysShort(item)" />

          <div>
            <CoreButton button-type="standardIcon" @click.stop="() => editScheduleItem(index)">
              <CoreIcon> $edit </CoreIcon>
            </CoreButton>
            <CoreButton
              class="ml-2"
              button-type="standardIcon"
              @click.stop="removeScheduleItem(index)"
            >
              <CoreIcon color="red"> $delete </CoreIcon>
            </CoreButton>
          </div>
        </div>
      </CoreCard>
    </div>

    <div>
      <CoreButton
        class="mt-2"
        button-type="primary"
        :loading="loading"
        @click.stop="addScheduleItem"
      >
        {{ $t("devices.TimeSwitch.settingsView.addSchedule") }}
      </CoreButton>
      <EditScheduleItem
        :dialog="scheduleItemDialog"
        :item="editedItem"
        @close="closeDialog"
        @save="itemHandler"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import EditScheduleItem from "./EditScheduleItem.vue";
import { IScheduleItem, Schedule } from "./types";
import { localizedDayOfWeek, week_days, formattedTime } from "../../forms/Rules/ManageRuleUtils";

// Properties
interface Props {
  schedule: Schedule;
  loading: bool;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: "update:schedule", value: Schedule): void;
}>();

// Constants
const { t } = useI18n();
const scheduleItemDialog = ref<boolean>(false);
const editingScheduleItemIndex = ref<number>(0);
const editedItem = ref<IScheduleItem | undefined>(undefined);
const settingsViewLang = t("devices.TimeSwitch.settingsView");

// Computed Properties
const syncedSchedule = computed({
  get() {
    return props.schedule;
  },
  set(value) {
    emit("update:schedule", value);
  },
});

// Functions
function addScheduleItem() {
  editedItem.value = undefined;
  scheduleItemDialog.value = true;
}

function editScheduleItem(index: number) {
  editedItem.value = { ...syncedSchedule.value[index], index };
  scheduleItemDialog.value = true;
}

function itemHandler(item: IScheduleItem) {
  scheduleItemDialog.value = false;

  // has to reassign to work with PropSync
  const scheduleCopy = JSON.parse(JSON.stringify(props.schedule));

  if (!editedItem.value || editedItem.value.index === undefined) {
    scheduleCopy.push(item);
    syncedSchedule.value = scheduleCopy;
    return;
  }
  const { index, ...data } = item;
  scheduleCopy[editedItem.value!.index!] = data;
  syncedSchedule.value = scheduleCopy;
}

function closeDialog() {
  scheduleItemDialog.value = false;
}

function removeScheduleItem(removeIndex: number) {
  syncedSchedule.value = syncedSchedule.value.filter((_, index) => index !== removeIndex);
}

function getActiveDaysShort(item: IScheduleItem) {
  return week_days
    .map((dayIndex: number) =>
      item.activeDays[dayIndex] ? localizedDayOfWeek(dayIndex, true) : false,
    )
    .filter(Boolean)
    .join(", ");
}
</script>

<style scoped>
.settings-label {
  font-size: 1.5em;
}
</style>
